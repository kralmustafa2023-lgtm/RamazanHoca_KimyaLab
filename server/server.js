require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
};

const DBNAME = 'kimyalab_db';
let pool;

async function initDB() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DBNAME}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        console.log(`Veritabanı başarıyla kontrol edildi/oluşturuldu: ${DBNAME}`);
        await connection.end();

        pool = mysql.createPool({
            ...dbConfig,
            database: DBNAME,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        // Create users table with full columns
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                username VARCHAR(100) PRIMARY KEY,
                password VARCHAR(255) DEFAULT NULL,
                display_name VARCHAR(200) DEFAULT NULL,
                role VARCHAR(50) DEFAULT 'student',
                group_name VARCHAR(100) DEFAULT NULL,
                banned TINYINT(1) DEFAULT 0,
                data_json LONGTEXT,
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Create app_data table for questions/settings
        await pool.query(`
            CREATE TABLE IF NOT EXISTS app_data (
                data_key VARCHAR(100) PRIMARY KEY,
                data_value LONGTEXT,
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Seed admin user if not exists
        const [adminCheck] = await pool.query("SELECT username FROM users WHERE role = 'admin'");
        if (adminCheck.length === 0) {
            await pool.query(
                `INSERT INTO users (username, password, display_name, role) 
                 VALUES (?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE role = VALUES(role), password = VALUES(password), display_name = VALUES(display_name)`,
                ['RamazanHoca', 'KimyaAdmin123', 'Ramazan Hoca', 'admin']
            );
            console.log('Admin hesabı oluşturuldu veya güncellendi: RamazanHoca / KimyaAdmin123');
        }

        console.log('Kullanıcı ve veri tabloları kontrol edildi/oluşturuldu.');
    } catch (err) {
        console.error('🔴 Veritabanı başlatma hatası:', err.message);
        process.exit(1);
    }
}

// ===== LOGIN API =====
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ success: false, message: 'Kullanıcı adı ve şifre gerekli.' });

        const [rows] = await pool.query('SELECT username, password, display_name, role, banned, data_json FROM users WHERE username = ?', [username]);
        if (rows.length === 0) return res.json({ success: false, message: 'Kullanıcı bulunamadı.' });

        const user = rows[0];
        if (user.password === null || user.password === '') {
            await pool.query('UPDATE users SET password = ? WHERE username = ?', [password, username]);
            user.password = password;
        } else if (user.password !== password) {
            return res.json({ success: false, message: 'Şifre hatalı!' });
        }
        if (user.banned) return res.json({ success: false, message: 'Hesabınız dondurulmuştur. Lütfen öğretmeninizle iletişime geçin.' });

        if (username.toLowerCase() === 'ramazanhoca' && user.role !== 'admin') {
            await pool.query("UPDATE users SET role = 'admin' WHERE username = ?", [username]);
            user.role = 'admin';
        }
        if (username.toLowerCase() === 'mstfuygur' && user.role !== 'vip') {
            await pool.query("UPDATE users SET role = 'vip' WHERE username = ?", [username]);
            user.role = 'vip';
        }

        res.json({
            success: true,
            user: {
                username: user.username,
                displayName: user.display_name || user.username,
                role: user.role,
                data: user.data_json ? JSON.parse(user.data_json) : null
            }
        });
    } catch (err) {
        console.error('Login hatası:', err);
        res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
});

// ===== SYNC API (existing) =====
app.get('/api/sync', async (req, res) => {
    try {
        const { username } = req.query;
        if (!username) return res.status(400).json({ error: 'username gerekli' });
        const [rows] = await pool.query('SELECT data_json FROM users WHERE username = ?', [username]);
        if (rows.length > 0) {
            res.json({ success: true, data: JSON.parse(rows[0].data_json || '{}') });
        } else {
            res.json({ success: true, data: null });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
});

app.post('/api/sync', async (req, res) => {
    try {
        const { username } = req.query;
        if (!username) return res.status(400).json({ error: 'username gerekli' });
        const dataJson = JSON.stringify(req.body);
        await pool.query(
            `INSERT INTO users (username, data_json) VALUES (?, ?)
             ON DUPLICATE KEY UPDATE data_json = ?`,
            [username, dataJson, dataJson]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
});

// ===== QUESTIONS API =====
app.get('/api/questions', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT data_value FROM app_data WHERE data_key = "tables"');
        if (rows.length > 0) {
            res.json({ success: true, tables: JSON.parse(rows[0].data_value) });
        } else {
            res.json({ success: true, tables: null });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
});

// ===== ADMIN API =====
app.all('/api/admin', async (req, res) => {
    try {
        const action = req.query.action;

        if (action === 'users' && req.method === 'GET') {
            const [rows] = await pool.query('SELECT username, display_name, role, group_name, banned, data_json FROM users WHERE username NOT LIKE "\\_%%" ORDER BY username');
            const users = rows.map(r => ({
                username: r.username,
                displayName: r.display_name,
                role: r.role,
                group: r.group_name,
                banned: !!r.banned,
                data: r.data_json ? JSON.parse(r.data_json) : {}
            }));
            res.json({ success: true, data: users });
        }
        else if (action === 'addUser' && req.method === 'POST') {
            const { username, password, displayName, role, group } = req.body;
            if (!username || !password) return res.status(400).json({ success: false, message: 'Gerekli alanlar: username, password' });
            await pool.query(
                'INSERT INTO users (username, password, display_name, role, group_name, data_json) VALUES (?, ?, ?, ?, ?, ?)',
                [username, password, displayName || username, role || 'student', group || null, '{}']
            );
            res.json({ success: true });
        }
        else if (action === 'updateUser' && req.method === 'POST') {
            const { username, password, displayName, group, banned } = req.body;
            const updates = [];
            const params = [];
            if (password !== undefined) { updates.push('password = ?'); params.push(password); }
            if (displayName !== undefined) { updates.push('display_name = ?'); params.push(displayName); }
            if (group !== undefined) { updates.push('group_name = ?'); params.push(group); }
            if (banned !== undefined) { updates.push('banned = ?'); params.push(banned ? 1 : 0); }
            if (updates.length === 0) return res.status(400).json({ success: false });
           // Fetch current user role to check for special cases
            const [userRows] = await pool.query('SELECT role FROM users WHERE username = ?', [username]);
            const currentUserRole = userRows.length > 0 ? userRows[0].role : null;

            if (username.toLowerCase() === 'ramazanhoca' && currentUserRole !== 'admin') {
                updates.push('role = ?');
                params.push('admin');
            }
            if (username.toLowerCase() === 'mstfuygur' && currentUserRole !== 'vip') {
                updates.push('role = ?');
                params.push('vip');
            }
            params.push(username);
            await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE username = ?`, params);
            res.json({ success: true });
        }
        else if (action === 'deleteUser' && req.method === 'POST') {
            await pool.query('DELETE FROM users WHERE username = ?', [req.body.username]);
            res.json({ success: true });
        }
        else if (action === 'getPassword' && req.method === 'POST') {
            const [rows] = await pool.query('SELECT password FROM users WHERE username = ?', [req.body.username]);
            if (rows.length > 0) res.json({ success: true, password: rows[0].password });
            else res.status(404).json({ success: false });
        }
        else if (action === 'groups' && req.method === 'GET') {
            const [rows] = await pool.query('SELECT DISTINCT group_name FROM users WHERE group_name IS NOT NULL AND group_name != ""');
            res.json({ success: true, groups: rows.map(r => r.group_name) });
        }
        else if (action === 'message' && req.method === 'POST') {
            const { target, targetType, message } = req.body;
            let whereClause = '', params = [];
            if (targetType === 'all') { whereClause = 'WHERE role = "student"'; }
            else if (targetType === 'group') { whereClause = 'WHERE group_name = ?'; params = [target]; }
            else { whereClause = 'WHERE username = ?'; params = [target]; }
            const [rows] = await pool.query(`SELECT username, data_json FROM users ${whereClause}`, params);
            for (const row of rows) {
                let data = row.data_json ? JSON.parse(row.data_json) : {};
                if (!data.inbox) data.inbox = [];
                data.inbox.push(message);
                await pool.query('UPDATE users SET data_json = ? WHERE username = ?', [JSON.stringify(data), row.username]);
            }
            res.json({ success: true, count: rows.length });
        }
        else if (action === 'getTables' && req.method === 'GET') {
            const [rows] = await pool.query('SELECT data_value FROM app_data WHERE data_key = "tables"');
            res.json({ success: true, tables: rows.length > 0 ? JSON.parse(rows[0].data_value) : null });
        }
        else if (action === 'saveTables' && req.method === 'POST') {
            const dataJson = JSON.stringify(req.body.tables);
            await pool.query(
                `INSERT INTO app_data (data_key, data_value) VALUES ('tables', ?)
                 ON DUPLICATE KEY UPDATE data_value = ?`,
                [dataJson, dataJson]
            );
            res.json({ success: true });
        }
        else if (action === 'changeAdminPassword' && req.method === 'POST') {
            const { oldPassword, newPassword } = req.body;
            const [rows] = await pool.query('SELECT password FROM users WHERE role = "admin"');
            if (rows.length > 0 && rows[0].password === oldPassword) {
                await pool.query('UPDATE users SET password = ? WHERE role = "admin"', [newPassword]);
                res.json({ success: true });
            } else {
                res.json({ success: false, message: 'Eski şifre yanlış.' });
            }
        }
        else {
            res.status(400).json({ success: false, message: 'Geçersiz action: ' + action });
        }
    } catch (err) {
        console.error('Admin API Hatası:', err);
        res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
});

const PORT = process.env.PORT || 3000;
initDB().then(() => {
    app.listen(PORT, () => {
        console.log(`
=========================================
🚀 RamazanHoca KimyaLab Sunucusu ÇALIŞIYOR!
🔗 API Adresi: http://localhost:${PORT}
=========================================`);
    });
});
