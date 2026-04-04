// ============================================
// FIREBASE-CONFIG.JS — Firebase Initialization
// Ramazan Hoca'nın Kimya Sınıfı v4.0
// Realtime Database Kullanılıyor
// ============================================

const firebaseConfig = {
    apiKey: "AIzaSyBvwxSNjtOWu-3NI2obWGF_peOBmw4bjDY",
    authDomain: "kimyalab-67c90.firebaseapp.com",
    databaseURL: "https://kimyalab-67c90-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "kimyalab-67c90",
    storageBucket: "kimyalab-67c90.firebasestorage.app",
    messagingSenderId: "102051706189",
    appId: "1:102051706189:web:451f5ee303d0c713bbf304",
    measurementId: "G-3E42BHB40Z"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Global reference — Realtime Database
const db = firebase.database();

// ===== FIREBASE DB HELPERS =====
const DB = {
    // Read a path with timeout
    async get(path) {
        console.log('📡 Fetching from DB:', path);
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Firebase bağlantı zaman aşımı! (Bağlantı çok yavaş veya veritabanı URL hatası)')), 7000)
        );
        try {
            const snap = await Promise.race([
                db.ref(path).once('value'),
                timeoutPromise
            ]);
            console.log('✅ Received from DB:', path, snap.val() ? 'Data exists' : 'No data');
            return snap.val();
        } catch (e) {
            console.error('❌ DB Get Error:', e.message);
            throw e;
        }
    },
    // Write to a path
    async set(path, data) {
        console.log('📡 Setting to DB:', path);
        await db.ref(path).set(data);
    },
    // Update specific fields
    async update(path, data) {
        console.log('📡 Updating DB:', path);
        await db.ref(path).update(data);
    },
    // Delete a path
    async remove(path) {
        console.log('📡 Removing from DB:', path);
        await db.ref(path).remove();
    },
    // Get all children
    async getAll(path) {
        console.log('📡 Fetching all from DB:', path);
        const snap = await db.ref(path).once('value');
        const val = snap.val();
        if (!val) return [];
        return Object.keys(val).map(k => ({ ...val[k], _key: k }));
    },
    // Push (auto-id)
    async push(path, data) {
        console.log('📡 Pushing to DB:', path);
        const ref = await db.ref(path).push(data);
        return ref.key;
    },
    // Query by child value
    async queryByChild(path, child, value) {
        console.log('📡 Querying DB:', path, child, value);
        const snap = await db.ref(path).orderByChild(child).equalTo(value).once('value');
        const val = snap.val();
        if (!val) return [];
        return Object.keys(val).map(k => ({ ...val[k], _key: k }));
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

console.log('🔥 Firebase Realtime Database başarıyla başlatıldı!');
