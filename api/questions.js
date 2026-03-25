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
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') { res.status(200).end(); return; }
    if (req.method !== 'GET') { return res.status(405).json({ error: 'GET only' }); }

    try {
        const db = await getPool();

        // Auto-init app_data table
        await db.query(`
            CREATE TABLE IF NOT EXISTS app_data (
                data_key VARCHAR(100) PRIMARY KEY,
                data_value LONGTEXT,
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        const [rows] = await db.query("SELECT data_value FROM app_data WHERE data_key = 'tables'");

        if (rows.length > 0) {
            let pTables = null;
            try { pTables = JSON.parse(rows[0].data_value); } catch(e){}
            return res.status(200).json({ success: true, tables: pTables });
        } else {
            // Return empty — frontend will use its fallback
            return res.status(200).json({ success: true, tables: null });
        }

    } catch (error) {
        console.error('Questions API Error:', error);
        return res.status(500).json({ success: false, message: 'Sunucu hatası', details: error.message });
    }
};
