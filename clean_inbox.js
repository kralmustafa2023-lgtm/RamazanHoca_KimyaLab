const https = require('https');

const FIREBASE_DB_URL = "https://kimyalab-67c90-default-rtdb.firebaseio.com";

function fetchJson(path, options = {}) {
    return new Promise((resolve, reject) => {
        const req = https.request(`${FIREBASE_DB_URL}/${path}.json`, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve(data ? JSON.parse(data) : null);
                    } catch (e) {
                        resolve(null);
                    }
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                }
            });
        });
        req.on('error', reject);
        if (options.body) req.write(options.body);
        req.end();
    });
}

async function clean() {
    try {
        console.log('Fetching notifications...');
        const notifs = await fetchJson('notifications');
        const validIds = notifs ? Object.keys(notifs) : [];
        console.log(`Found ${validIds.length} valid notifications.`);

        console.log('Fetching users...');
        const users = await fetchJson('users');
        if (!users) return console.log('No users found.');

        for (const [username, user] of Object.entries(users)) {
            if (user.role === 'admin') continue;
            if (user.data && user.data.inbox && user.data.inbox.length > 0) {
                // Filter inbox
                const oldInbox = Object.values(user.data.inbox).filter(m => m !== null);
                const newInbox = oldInbox.filter(m => validIds.includes(m.id) || validIds.includes(m.firebaseKey));
                
                if (newInbox.length !== oldInbox.length) {
                    console.log(`Cleaning inbox for ${username}: ${oldInbox.length} -> ${newInbox.length}`);
                    if (newInbox.length > 0) {
                        await fetchJson(`users/${username}/data/inbox`, { method: 'PUT', body: JSON.stringify(newInbox) });
                    } else {
                        await fetchJson(`users/${username}/data/inbox`, { method: 'DELETE' });
                    }
                }
            }
        }
        console.log('Cleanup finished!');
    } catch (e) {
        console.error('Error:', e);
    }
}

clean();
