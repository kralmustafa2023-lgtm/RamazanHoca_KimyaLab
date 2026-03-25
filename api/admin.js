const mysql = require('mysql2/promise');

let pool;

async function getPool() {
    if (!pool) {
        const dbUrl = process.env.DATABASE_URL;
        pool = mysql.createPool({
            uri: dbUrl,
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
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { action } = req.query;

    if (!action) {
        return res.status(400).json({ success: false, error: 'Eksik parametre: action' });
    }

    try {
        const dbPool = await getPool();

        if (action === 'users' && req.method === 'GET') {
            const [rows] = await dbPool.query('SELECT username, data_json FROM users');
            const usersData = rows.map(r => ({
                username: r.username,
                data: JSON.parse(r.data_json)
            }));
            return res.status(200).json({ success: true, data: usersData });
        } 
        else if (action === 'toggleAccount' && req.method === 'POST') {
            const { username, banned } = req.body;
            const [rows] = await dbPool.query('SELECT data_json FROM users WHERE username = ?', [username]);
            if (rows.length > 0) {
                let data = JSON.parse(rows[0].data_json);
                data.banned = banned;
                await dbPool.query('UPDATE users SET data_json = ? WHERE username = ?', [JSON.stringify(data), username]);
                return res.status(200).json({ success: true });
            } else {
                return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı' });
            }
        } 
        else if (action === 'message' && req.method === 'POST') {
            const { target, message } = req.body;
            if (target === 'all') {
                const [rows] = await dbPool.query('SELECT username, data_json FROM users');
                for (let i = 0; i < rows.length; i++) {
                    let data = JSON.parse(rows[i].data_json);
                    if (!data.inbox) data.inbox = [];
                    data.inbox.push(message);
                    await dbPool.query('UPDATE users SET data_json = ? WHERE username = ?', [JSON.stringify(data), rows[i].username]);
                }
            } else {
                const [rows] = await dbPool.query('SELECT data_json FROM users WHERE username = ?', [target]);
                if (rows.length > 0) {
                    let data = JSON.parse(rows[0].data_json);
                    if (!data.inbox) data.inbox = [];
                    data.inbox.push(message);
                    await dbPool.query('UPDATE users SET data_json = ? WHERE username = ?', [JSON.stringify(data), target]);
                }
            }
            return res.status(200).json({ success: true });
        } 
        else if (action === 'getSettings' && req.method === 'GET') {
            const [rows] = await dbPool.query('SELECT data_json FROM users WHERE username = "__ADMIN_SETTINGS__"');
            if (rows.length > 0) {
                return res.status(200).json({ success: true, data: JSON.parse(rows[0].data_json) });
            } else {
                return res.status(200).json({ success: true, data: {} });
            }
        } 
        else if (action === 'updateSettings' && req.method === 'POST') {
            const newSettings = req.body;
            const dataJson = JSON.stringify(newSettings);
            await dbPool.query(
                `INSERT INTO users (username, data_json) VALUES ('__ADMIN_SETTINGS__', ?) 
                 ON DUPLICATE KEY UPDATE data_json = ?`,
                [dataJson, dataJson]
            );
            return res.status(200).json({ success: true });
        } 
        else {
            return res.status(400).json({ success: false, message: 'Yöntem desteklenmiyor.' });
        }
    } catch (error) {
        console.error('Admin API Sunucu Hatası:', error);
        return res.status(500).json({ success: false, error: 'Sunucu Hatası', details: error.message });
    }
};
