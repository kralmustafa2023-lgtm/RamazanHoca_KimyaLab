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
        // First connect without database to create it if it doesn't exist
        const connection = await mysql.createConnection(dbConfig);
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DBNAME}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        console.log(`Veritabanı başarıyla kontrol edildi/oluşturuldu: ${DBNAME}`);
        await connection.end();

        // Now connect with database and create connection pool
        pool = mysql.createPool({
            ...dbConfig,
            database: DBNAME,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        // Create users table if not exists (username acts as primary key ID)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                username VARCHAR(100) PRIMARY KEY,
                data_json LONGTEXT,
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('Kullanıcı tablosu kontrol edildi/oluşturuldu.');
    } catch (err) {
        console.error('🔴 Veritabanı başlatma hatası! MySQL çalışıyor mu ve şifre doğru mu kontrol et:', err.message);
        process.exit(1);
    }
}

// Get user data
app.get('/api/user/:username', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT data_json FROM users WHERE username = ?', [req.params.username]);
        if (rows.length > 0) {
            res.json({ success: true, data: JSON.parse(rows[0].data_json) });
        } else {
            res.json({ success: true, data: null }); // Yeni kullanıcı
        }
    } catch (err) {
        console.error('🔴 Veri okuma hatası:', err);
        res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
});

// Save user data (Upsert: Insert or Update if exists)
app.post('/api/user/:username', async (req, res) => {
    try {
        const username = req.params.username;
        const dataJson = JSON.stringify(req.body);

        await pool.query(
            `INSERT INTO users (username, data_json) VALUES (?, ?) 
             ON DUPLICATE KEY UPDATE data_json = ?`,
            [username, dataJson, dataJson]
        );
        res.json({ success: true, message: 'Veri MySQL e kaydedildi ✨' });
    } catch (err) {
        console.error('🔴 Veri kaydetme hatası:', err);
        res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
});

// Admin API Logic
app.all('/api/admin', async (req, res) => {
    try {
        const action = req.query.action;
        if (action === 'users' && req.method === 'GET') {
            const [rows] = await pool.query('SELECT username, data_json FROM users');
            const usersData = rows.map(r => ({
                username: r.username,
                data: JSON.parse(r.data_json)
            }));
            res.json({ success: true, data: usersData });
        } else if (action === 'toggleAccount' && req.method === 'POST') {
            const { username, banned } = req.body;
            const [rows] = await pool.query('SELECT data_json FROM users WHERE username = ?', [username]);
            if(rows.length > 0) {
                let data = JSON.parse(rows[0].data_json);
                data.banned = banned;
                await pool.query('UPDATE users SET data_json = ? WHERE username = ?', [JSON.stringify(data), username]);
                res.json({ success: true });
            } else {
                res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı' });
            }
        } else if (action === 'message' && req.method === 'POST') {
            const { target, message } = req.body;
            if (target === 'all') {
                const [rows] = await pool.query('SELECT username, data_json FROM users');
                for(let i=0; i<rows.length; i++) {
                    let data = JSON.parse(rows[i].data_json);
                    if(!data.inbox) data.inbox = [];
                    data.inbox.push(message);
                    await pool.query('UPDATE users SET data_json = ? WHERE username = ?', [JSON.stringify(data), rows[i].username]);
                }
            } else {
                const [rows] = await pool.query('SELECT data_json FROM users WHERE username = ?', [target]);
                if(rows.length > 0) {
                    let data = JSON.parse(rows[0].data_json);
                    if(!data.inbox) data.inbox = [];
                    data.inbox.push(message);
                    await pool.query('UPDATE users SET data_json = ? WHERE username = ?', [JSON.stringify(data), target]);
                }
            }
            res.json({ success: true });
        } else if (action === 'getSettings' && req.method === 'GET') {
            const [rows] = await pool.query('SELECT data_json FROM users WHERE username = "__ADMIN_SETTINGS__"');
            if (rows.length > 0) {
                res.json({ success: true, data: JSON.parse(rows[0].data_json) });
            } else {
                res.json({ success: true, data: {} });
            }
        } else if (action === 'updateSettings' && req.method === 'POST') {
            const newSettings = req.body;
            const dataJson = JSON.stringify(newSettings);
            await pool.query(
                `INSERT INTO users (username, data_json) VALUES ('__ADMIN_SETTINGS__', ?) 
                 ON DUPLICATE KEY UPDATE data_json = ?`,
                [dataJson, dataJson]
            );
            res.json({ success: true });
        } else {
            res.status(400).json({ success: false, message: 'Geçersiz işlem veya HTTP metodu' });
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
