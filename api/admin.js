const mysql = require('mysql2/promise');

let pool;
async function getPool() {
    if (!pool) {
        pool = mysql.createPool({
            uri: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false },
            waitForConnections: true,
            connectionLimit: 1,
            queueLimit: 0,
            connectTimeout: 10000
        });
    }
    return pool;
}

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') { res.status(200).end(); return; }

    const { action } = req.query;
    if (!action) return res.status(400).json({ success: false, error: 'action parametresi gerekli' });

    try {
        const db = await getPool();

        // Ensure table and columns exist
        await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                username VARCHAR(100) PRIMARY KEY,
                password VARCHAR(255) DEFAULT NULL,
                display_name VARCHAR(200) DEFAULT NULL,
                role ENUM('student','vip','admin') DEFAULT 'student',
                group_name VARCHAR(100) DEFAULT NULL,
                banned TINYINT(1) DEFAULT 0,
                data_json LONGTEXT,
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        const columnsToAdd = [
            "ADD COLUMN password VARCHAR(255) DEFAULT NULL",
            "ADD COLUMN display_name VARCHAR(200) DEFAULT NULL",
            "ADD COLUMN role ENUM('student','vip','admin') DEFAULT 'student'",
            "ADD COLUMN group_name VARCHAR(100) DEFAULT NULL",
            "ADD COLUMN banned TINYINT(1) DEFAULT 0"
        ];
        for (const colDef of columnsToAdd) {
            try {
                await db.query(`ALTER TABLE users ${colDef}`);
            } catch (e) {}
        }

        // ===== USERS =====
        if (action === 'users' && req.method === 'GET') {
            const [rows] = await db.query('SELECT username, display_name, role, group_name, banned, data_json FROM users WHERE username NOT LIKE "\\_%%" ORDER BY username');
            const users = rows.map(r => {
                let pData = {};
                try { pData = r.data_json ? JSON.parse(r.data_json) : {}; } catch(e) { pData = {}; }
                return {
                    username: r.username,
                    displayName: r.display_name,
                    role: r.role,
                    group: r.group_name,
                    banned: !!r.banned,
                    data: pData
                };
            });
            return res.status(200).json({ success: true, data: users });
        }

        // ===== ADD USER =====
        if (action === 'addUser' && req.method === 'POST') {
            const { username, password, displayName, role, group } = req.body;
            if (!username || !password) return res.status(400).json({ success: false, message: 'Kullanıcı adı ve şifre gerekli.' });
            await db.query(
                'INSERT INTO users (username, password, display_name, role, group_name, data_json) VALUES (?, ?, ?, ?, ?, ?)',
                [username, password, displayName || username, role || 'student', group || null, '{}']
            );
            return res.status(200).json({ success: true });
        }

        // ===== UPDATE USER =====
        if (action === 'updateUser' && req.method === 'POST') {
            const { username, password, displayName, group, banned } = req.body;
            const updates = [];
            const params = [];
            if (password !== undefined) { updates.push('password = ?'); params.push(password); }
            if (displayName !== undefined) { updates.push('display_name = ?'); params.push(displayName); }
            if (group !== undefined) { updates.push('group_name = ?'); params.push(group); }
            if (banned !== undefined) { updates.push('banned = ?'); params.push(banned ? 1 : 0); }
            if (updates.length === 0) return res.status(400).json({ success: false, message: 'Güncelleme verisi yok.' });
            params.push(username);
            await db.query(`UPDATE users SET ${updates.join(', ')} WHERE username = ?`, params);
            return res.status(200).json({ success: true });
        }

        // ===== DELETE USER =====
        if (action === 'deleteUser' && req.method === 'POST') {
            const { username } = req.body;
            await db.query('DELETE FROM users WHERE username = ?', [username]);
            return res.status(200).json({ success: true });
        }

        // ===== GET PASSWORD (for admin to view) =====
        if (action === 'getPassword' && req.method === 'POST') {
            const { username } = req.body;
            const [rows] = await db.query('SELECT password FROM users WHERE username = ?', [username]);
            if (rows.length > 0) {
                return res.status(200).json({ success: true, password: rows[0].password });
            }
            return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı' });
        }

        // ===== GROUPS =====
        if (action === 'groups' && req.method === 'GET') {
            const [rows] = await db.query('SELECT DISTINCT group_name FROM users WHERE group_name IS NOT NULL AND group_name != ""');
            return res.status(200).json({ success: true, groups: rows.map(r => r.group_name) });
        }

        // ===== MESSAGE =====
        if (action === 'message' && req.method === 'POST') {
            const { target, targetType, message } = req.body;
            // targetType: 'all', 'group', 'individual'
            let whereClause = '';
            let params = [];
            if (targetType === 'all') {
                whereClause = 'WHERE role = "student"';
            } else if (targetType === 'group') {
                whereClause = 'WHERE group_name = ?';
                params = [target];
            } else {
                whereClause = 'WHERE username = ?';
                params = [target];
            }
            const [rows] = await db.query(`SELECT username, data_json FROM users ${whereClause}`, params);
            for (const row of rows) {
                let data = {};
                try { if (row.data_json) data = JSON.parse(row.data_json); } catch(e){}
                if (!data.inbox) data.inbox = [];
                data.inbox.push(message);
                await db.query('UPDATE users SET data_json = ? WHERE username = ?', [JSON.stringify(data), row.username]);
            }
            return res.status(200).json({ success: true, count: rows.length });
        }

        // ===== QUESTIONS / TABLES =====
        if (action === 'getTables' && req.method === 'GET') {
            await db.query(`
                CREATE TABLE IF NOT EXISTS app_data (
                    data_key VARCHAR(100) PRIMARY KEY,
                    data_value LONGTEXT,
                    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `);
            const [rows] = await db.query('SELECT data_value FROM app_data WHERE data_key = "tables"');
            if (rows.length > 0) {
                return res.status(200).json({ success: true, tables: JSON.parse(rows[0].data_value) });
            }
            return res.status(200).json({ success: true, tables: null });
        }

        if (action === 'saveTables' && req.method === 'POST') {
            const { tables } = req.body;
            const dataJson = JSON.stringify(tables);
            await db.query(
                `INSERT INTO app_data (data_key, data_value) VALUES ('tables', ?)
                 ON DUPLICATE KEY UPDATE data_value = ?`,
                [dataJson, dataJson]
            );
            return res.status(200).json({ success: true });
        }

        // ===== CHANGE ADMIN PASSWORD =====
        if (action === 'changeAdminPassword' && req.method === 'POST') {
            const { oldPassword, newPassword } = req.body;
            const [rows] = await db.query('SELECT password FROM users WHERE role = "admin"');
            if (rows.length > 0 && rows[0].password === oldPassword) {
                await db.query('UPDATE users SET password = ? WHERE role = "admin"', [newPassword]);
                return res.status(200).json({ success: true });
            }
            return res.status(200).json({ success: false, message: 'Eski şifre yanlış.' });
        }

        return res.status(400).json({ success: false, message: 'Tanınmayan action: ' + action });

    } catch (error) {
        console.error('Admin API Error:', error);
        return res.status(500).json({ success: false, message: 'Sunucu hatası', details: error.message });
    }
};
