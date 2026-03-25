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
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') { res.status(200).end(); return; }
    if (req.method !== 'POST') { return res.status(405).json({ error: 'POST only' }); }

    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Kullanıcı adı ve şifre gerekli.' });
    }

    try {
        const db = await getPool();

        // Auto-init users table just in case it's a completely new DB
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

        // Upgrade existing table if columns are missing.
        // Doing this column by column individually so if one exists, it won't abort the others.
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
            } catch (e) {
                // Ignore duplicate column errors (1060)
            }
        }

        // Auto-seed admin user if not exists
        const [adminCheck] = await db.query('SELECT username FROM users WHERE role = "admin"');
        if (adminCheck.length === 0) {
            await db.query(
                'INSERT INTO users (username, password, display_name, role, group_name, data_json) VALUES (?, ?, ?, ?, ?, ?)',
                ['RamazanHoca', 'KimyaAdmin123', 'Ramazan Hoca', 'admin', null, '{}']
            );
            console.log('✅ Default admin hesabı Vercel üzerinde oluşturuldu.');
        }

        // Auto-seed VIP user if not exists
        const [vipCheck] = await db.query('SELECT username FROM users WHERE role = "vip"');
        if (vipCheck.length === 0) {
            await db.query(
                'INSERT INTO users (username, password, display_name, role, group_name, data_json) VALUES (?, ?, ?, ?, ?, ?)',
                ['Kurucu1', 'VipPatron2025', '👑 Kurucu Patron', 'vip', null, '{}']
            );
        }

        const [rows] = await db.query('SELECT username, password, display_name, role, banned, data_json FROM users WHERE username = ?', [username]);

        if (rows.length === 0) {
            return res.status(200).json({ success: false, message: 'Kullanıcı bulunamadı.' });
        }

        const user = rows[0];

        if (user.password !== password) {
            return res.status(200).json({ success: false, message: 'Şifre hatalı!' });
        }

        if (user.banned) {
            return res.status(200).json({ success: false, message: 'Hesabınız dondurulmuştur. Lütfen öğretmeninizle iletişime geçin.' });
        }

        return res.status(200).json({
            success: true,
            user: {
                username: user.username,
                displayName: user.display_name || user.username,
                role: user.role,
                data: user.data_json ? JSON.parse(user.data_json) : null
            }
        });

    } catch (error) {
        console.error('Login API Error:', error);
        return res.status(500).json({ success: false, message: 'Sunucu hatası', details: error.message });
    }
};
