// ============================================
// FIREBASE-CONFIG.JS — Firebase Initialization
// Ramazan Hoca'nın Kimya Sınıfı v4.0
// MEB FIREWALL BYPASS - USING FIREBASE REST API
// ============================================

const FIREBASE_DB_URL = "https://kimyalab-67c90-default-rtdb.europe-west1.firebasedatabase.app";

// ===== FIREBASE DB HELPERS (REST API OVER HTTPS) =====
// Bu sistem MEB internetindeki WebSocket engellerini aşmak için
// standart HTTPS fetch istekleri kullanır.
const DB = {
    // Read a path
    async get(path) {
        try {
            const response = await fetch(`${FIREBASE_DB_URL}/${path}.json`, { 
                cache: 'no-store' 
            });
            if (!response.ok) throw new Error('HTTP error ' + response.status);
            return await response.json();
        } catch (e) {
            console.error('❌ DB Get Error:', e.message);
            throw e;
        }
    },
    // Write to a path
    async set(path, data) {
        const response = await fetch(`${FIREBASE_DB_URL}/${path}.json`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('HTTP error ' + response.status);
    },
    // Update specific fields
    async update(path, data) {
        const response = await fetch(`${FIREBASE_DB_URL}/${path}.json`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('HTTP error ' + response.status);
    },
    // Delete a path
    async remove(path) {
        const response = await fetch(`${FIREBASE_DB_URL}/${path}.json`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('HTTP error ' + response.status);
    },
    // Get all children
    async getAll(path) {
        const val = await this.get(path);
        if (!val) return [];
        return Object.keys(val).map(k => ({ ...val[k], _key: k }));
    },
    // Push (auto-id)
    async push(path, data) {
        const response = await fetch(`${FIREBASE_DB_URL}/${path}.json`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('HTTP error ' + response.status);
        const result = await response.json();
        return result.name;
    }
};

// ===== SEED DEFAULT USERS =====
async function seedDefaultUsers() {
    const defaults = [
        {
            username: 'RamazanHoca',
            password: 'KimyaAdmin123',
            displayName: 'Ramazan Hoca',
            role: 'admin',
            email: '',
            group: '',
            banned: false,
            data: {}
        },
        {
            username: 'Mstfuygur',
            password: 'Mstfuygur2011',
            displayName: 'Mstfuygur',
            role: 'vip',
            email: '',
            group: '',
            banned: false,
            data: {}
        }
    ];

    for (const user of defaults) {
        try {
            const existing = await DB.get('users/' + user.username);
            if (!existing) {
                await DB.set('users/' + user.username, user);
                console.log('✅ Varsayılan kullanıcı oluşturuldu: ' + user.username);
            }
        } catch (e) {
            console.warn('⚠️ Seed başarısız (' + user.username + '):', e.message);
        }
    }
}

// Run seed on first load (non-blocking)
try { seedDefaultUsers(); } catch(e) { console.warn('Seed error:', e); }

console.log('🔥 Firebase REST API başarıyla başlatıldı (MEB Bypass Aktif)!');
