require('dotenv').config();
const mysql = require('mysql2/promise');

async function test() {
    try {
        console.log('Connecting to: ', process.env.DATABASE_URL ? "URL EXISTS" : "ERROR: URL NOT FOUND");
        const pool = mysql.createPool({
            uri: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false }
        });
        
        console.log('Testing connection...');
        const [rows] = await pool.query('SHOW TABLES');
        console.log('Tables:', rows);
        
        console.log('Checking users table columns...');
        const [cols] = await pool.query('SHOW COLUMNS FROM users');
        console.log('Columns:', cols.map(c => c.Field));
        
        console.log('Attempting to apply ALTER TABLE...');
        try {
            await pool.query(`
                ALTER TABLE users 
                ADD COLUMN password VARCHAR(255) DEFAULT NULL,
                ADD COLUMN display_name VARCHAR(200) DEFAULT NULL,
                ADD COLUMN role ENUM('student','vip','admin') DEFAULT 'student',
                ADD COLUMN group_name VARCHAR(100) DEFAULT NULL,
                ADD COLUMN banned TINYINT(1) DEFAULT 0
            `);
            console.log('ALTER TABLE SUCCESSFUL');
        } catch(e) {
            console.error('ALTER TABLE FAILED:', e.message);
        }

        console.log('Checking users query...');
        try {
            const [users] = await pool.query('SELECT username, password, role FROM users LIMIT 1');
            console.log('Select successful:', users);
        } catch(e) {
            console.error('SELECT FAILED:', e.message);
        }

        await pool.end();
    } catch(e) {
        console.error('CRITICAL ERROR:', e);
    }
}
test();
