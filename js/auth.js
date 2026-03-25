// ============================================
// AUTH.JS — DB-Driven Login & Authentication
// Ramazan Hoca'nın Kimya Sınıfı v3.0
// ============================================

const AUTH = (() => {

    // SHIELD: Prevent Right Click and Common DevTools Shortcuts
    function initShield() {
        document.addEventListener('contextmenu', e => e.preventDefault());
        document.addEventListener('keydown', e => {
            if (e.keyCode == 123 || (e.ctrlKey && e.shiftKey && (e.keyCode == 73 || e.keyCode == 74)) || (e.ctrlKey && e.keyCode == 85)) {
                e.preventDefault();
                return false;
            }
        });
        console.log("%c⚠️ DUR!", "color: red; font-size: 50px; font-weight: bold; -webkit-text-stroke: 1px black;");
        console.log("%cBu alan sadece geliştiriciler içindir.", "font-size: 18px; color: #333;");
    }

    // ===== DB-DRIVEN LOGIN =====
    async function login(username, password, displayName) {
        try {
            const req = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const res = await req.json();

            if (res.success) {
                const user = res.user;
                sessionStorage.setItem('currentUser', user.username);
                sessionStorage.setItem('userRole', user.role);

                if (user.role === 'vip') sessionStorage.setItem('isVIP', 'true');
                else sessionStorage.removeItem('isVIP');

                if (user.role === 'admin') sessionStorage.setItem('isTeacher', 'true');
                else sessionStorage.removeItem('isTeacher');

                // Set display name
                const name = displayName || user.displayName || user.username;
                sessionStorage.setItem('displayName', name);
                localStorage.setItem('ramazan_hoca_name_' + user.username, name);

                // Load cloud data into localStorage
                if (user.data) {
                    localStorage.setItem('ramazan_hoca_' + user.username, JSON.stringify(user.data));
                }

                // Init user storage
                if (typeof Storage !== 'undefined' && Storage.initUser) {
                    Storage.initUser(user.username);
                }

                return { success: true, username: user.username };
            } else {
                return { success: false, message: res.message || 'Giriş başarısız.' };
            }
        } catch (e) {
            console.error('Login API Error:', e);
            return { success: false, message: 'Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin.' };
        }
    }

    // ===== TEACHER LOGIN (same API, role check) =====
    async function teacherLogin(username, password) {
        try {
            const req = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const res = await req.json();

            if (res.success && res.user.role === 'admin') {
                sessionStorage.setItem('isTeacher', 'true');
                sessionStorage.setItem('currentUser', res.user.username);
                sessionStorage.setItem('userRole', 'admin');
                sessionStorage.setItem('displayName', res.user.displayName || 'Ramazan Hoca');
                return { success: true };
            } else if (res.success && res.user.role !== 'admin') {
                return { success: false, message: 'Bu hesap yönetici değil!' };
            } else {
                return { success: false, message: res.message || 'Giriş başarısız.' };
            }
        } catch (e) {
            console.error('Teacher Login Error:', e);
            return { success: false, message: 'Sunucuya bağlanılamadı.' };
        }
    }

    // ===== SYNC: Pull user data from cloud =====
    async function sync() {
        const username = getCurrentUser();
        if (!username) return false;

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 6000);
            const req = await fetch(`/api/sync?username=${encodeURIComponent(username)}`, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (req.ok) {
                const res = await req.json();
                if (res.success && res.data) {
                    localStorage.setItem('ramazan_hoca_' + username, JSON.stringify(res.data));
                    console.log('✅ ' + username + ' verileri buluttan güncellendi!');
                    return true;
                }
            }
        } catch (e) {
            console.warn('⚠️ Senkronizasyon başarısız, çevrimdışı devam ediliyor.');
        }
        return false;
    }

    function logout() {
        sessionStorage.clear();
        window.location.reload();
    }

    function getCurrentUser() {
        return sessionStorage.getItem('currentUser');
    }

    function isLoggedIn() {
        return !!getCurrentUser();
    }

    function isVIP() {
        return sessionStorage.getItem('isVIP') === 'true' || sessionStorage.getItem('userRole') === 'vip';
    }

    function isTeacher() {
        return sessionStorage.getItem('isTeacher') === 'true' || sessionStorage.getItem('userRole') === 'admin';
    }

    function getDisplayName(username) {
        if (!username) return '';
        const sessionName = sessionStorage.getItem('displayName');
        if (sessionName && username === getCurrentUser()) return sessionName;
        const storedName = localStorage.getItem('ramazan_hoca_name_' + username);
        if (storedName) return storedName;
        const num = username.replace('ogrenci', '');
        return `Öğrenci ${num}`;
    }

    function setDisplayName(name) {
        const username = getCurrentUser();
        if (username && name && name.trim()) {
            sessionStorage.setItem('displayName', name.trim());
            localStorage.setItem('ramazan_hoca_name_' + username, name.trim());
        }
    }

    return {
        login, teacherLogin, logout, sync, getCurrentUser,
        isLoggedIn, isVIP, isTeacher, getDisplayName, setDisplayName, initShield
    };
})();
