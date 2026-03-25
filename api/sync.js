const mysql = require('mysql2/promise');

// Cloud mysql pool
let pool;

async function getPool() {
    if (!pool) {
        pool = mysql.createPool({
            uri: process.env.DATABASE_URL,
            waitForConnections: true,
            connectionLimit: 4, // Maximize free-tier resilience
            queueLimit: 0,
            ssl: { rejectUnauthorized: true }
        });
        
        // Auto-initialize the table on Vercel if it's the very first hit
        try {
            await pool.query(`
                CREATE TABLE IF NOT EXISTS users (
                    username VARCHAR(100) PRIMARY KEY,
                    data_json LONGTEXT,
                    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `);
        } catch (err) {
            console.error('Table Creation Error:', err); // Log but don't crash
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
