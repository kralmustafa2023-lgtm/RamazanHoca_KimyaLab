const mysql = require('mysql2/promise');

// Cloud mysql pool
let pool;

async function getPool() {
    if (!pool) {
        // Aiven requires SSL. We'll use the URL but ensure SSL is properly configured for Node environment.
        const dbUrl = process.env.DATABASE_URL;
        
        pool = mysql.createPool({
            uri: dbUrl,
            ssl: {
                rejectUnauthorized: false // Required for some cloud providers like Aiven in serverless environments
            },
            waitForConnections: true,
            connectionLimit: 1, // Keep it low for serverless functions to avoid hitting Aiven limits
            queueLimit: 0,
            connectTimeout: 10000 // 10 seconds timeout for the initial connection
        });
        
        // Auto-initialize the table on Vercel if it's the very first hit
        try {
            const conn = await pool.getConnection();
            await conn.query(`
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
            conn.release();
            console.log('Database initialized successfully');
        } catch (err) {
            console.error('Database Initialization Error:', err);
        }
    }
    return pool;
}

module.exports = async function handler(req, res) {
    // Vercel standard CORS setup
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { username } = req.query;

    if (!username) {
        return res.status(400).json({ error: 'Eksik Parametre: username zorunludur' });
    }

    try {
        const dbPool = await getPool();

        if (req.method === 'GET') {
            const [rows] = await dbPool.query('SELECT data_json FROM users WHERE username = ?', [username]);
            if (rows.length > 0) {
                return res.status(200).json({ success: true, data: JSON.parse(rows[0].data_json) });
            } else {
                return res.status(200).json({ success: true, data: null });
            }
        } 
        else if (req.method === 'POST') {
            const dataJson = JSON.stringify(req.body);
            await dbPool.query(
                `INSERT INTO users (username, data_json) VALUES (?, ?) 
                 ON DUPLICATE KEY UPDATE data_json = ?`,
                [username, dataJson, dataJson]
            );
            return res.status(200).json({ success: true, message: 'Veri Vercel üzerinden Aiven Cloud a kaydedildi ✨' });
        }
        else {
            res.status(405).json({ error: 'Yöntem desteklenmiyor.' });
        }
    } catch (error) {
        console.error('Sunucu veya Veritabanı Hatası:', error);
        res.status(500).json({ error: 'Sunucu Hatası', details: error.message });
    }
};
