// ============================================
// AUTH.JS — Firebase Realtime DB Login & Auth
// Ramazan Hoca'nın Kimya Sınıfı v4.0
// ============================================

const AUTH = (() => {

    function initShield() {
        document.addEventListener('contextmenu', e => e.preventDefault());
        document.addEventListener('keydown', e => {
            if (e.keyCode == 123 || (e.ctrlKey && e.shiftKey && (e.keyCode == 73 || e.keyCode == 74)) || (e.ctrlKey && e.keyCode == 85)) {
                e.preventDefault();
                return false;
            }
        });
    }

    // ===== LOGIN =====
    async function login(username, password, displayName) {
        try {
            const user = await DB.get('users/' + username);

            if (!user) {
                return { success: false, message: 'Kullanıcı bulunamadı.' };
            }

            if (user.password !== password) {
                return { success: false, message: 'Şifre hatalı!' };
            }

            if (user.banned) {
                return { success: false, message: 'Hesabınız dondurulmuştur. Lütfen öğretmeninizle iletişime geçin.' };
            }

            sessionStorage.setItem('currentUser', username);
            sessionStorage.setItem('userRole', user.role);

            if (user.role === 'vip') sessionStorage.setItem('isVIP', 'true');
            else sessionStorage.removeItem('isVIP');

            if (user.role === 'admin') sessionStorage.setItem('isTeacher', 'true');
            else sessionStorage.removeItem('isTeacher');

            const name = displayName || user.displayName || username;
            sessionStorage.setItem('displayName', name);
            localStorage.setItem('ramazan_hoca_name_' + username, name);

            // Load cloud data into localStorage
            if (user.data && Object.keys(user.data).length > 0) {
                localStorage.setItem('ramazan_hoca_' + username, JSON.stringify(user.data));
            }

            if (typeof Storage !== 'undefined' && Storage.initUser) {
                Storage.initUser(username);
            }

            return { success: true, username: username };
        } catch (e) {
            console.error('Login Error:', e);
            return { success: false, message: 'Firebase bağlantı hatası. İnterneti kontrol edin. (' + e.message + ')' };
        }
    }

    // ===== TEACHER LOGIN =====
    async function teacherLogin(username, password) {
        try {
            const user = await DB.get('users/' + username);
            if (!user) return { success: false, message: 'Kullanıcı bulunamadı.' };
            if (user.password !== password) return { success: false, message: 'Şifre hatalı!' };
            if (user.role !== 'admin' && user.role !== 'ogretmen') return { success: false, message: 'Bu hesap yönetici değil!' };

            sessionStorage.setItem('isTeacher', 'true');
            sessionStorage.setItem('currentUser', username);
            sessionStorage.setItem('userRole', user.role);
            sessionStorage.setItem('displayName', user.displayName || 'Ramazan Hoca');
            return { success: true };
        } catch (e) {
            return { success: false, message: 'Firebase bağlantı hatası. (' + e.message + ')' };
        }
    }

    // ===== REGISTER =====
    async function register(username, password, email, displayName) {
        try {
            const existing = await DB.get('users/' + username);
            if (existing) return { success: false, message: 'Bu kullanıcı adı zaten alınmış!' };

            // Check email uniqueness
            const allUsers = await DB.get('users');
            if (allUsers) {
                const emailUsed = Object.values(allUsers).find(u => u.email && u.email.toLowerCase() === email.toLowerCase().trim());
                if (emailUsed) return { success: false, message: 'Bu e-posta adresi zaten kayıtlı!' };
            }

            await DB.set('users/' + username, {
                username: username,
                password: password,
                email: email.toLowerCase().trim(),
                displayName: displayName || username,
                role: 'student',
                group: '',
                banned: false,
                data: {}
            });

            return { success: true, message: 'Hesap başarıyla oluşturuldu! Şimdi giriş yapabilirsin.' };
        } catch (e) {
            return { success: false, message: 'Kayıt hatası. (' + e.message + ')' };
        }
    }

    // ===== FORGOT PASSWORD =====
    async function resetPassword(username, email, newPassword) {
        try {
            const user = await DB.get('users/' + username);
            if (!user) return { success: false, message: 'Bu kullanıcı adı bulunamadı!' };

            if (!user.email || user.email.toLowerCase().trim() !== email.toLowerCase().trim()) {
                return { success: false, message: 'Kullanıcı adı ve e-posta eşleşmiyor!' };
            }

            await DB.update('users/' + username, { password: newPassword });
            return { success: true, message: 'Şifren başarıyla değiştirildi! Yeni şifrenle giriş yapabilirsin.' };
        } catch (e) {
            return { success: false, message: 'Şifre sıfırlama hatası. (' + e.message + ')' };
        }
    }

    // ===== SYNC =====
    async function sync() {
        const username = getCurrentUser();
        if (!username) return false;
        try {
            const user = await DB.get('users/' + username);
            if (user && user.data && Object.keys(user.data).length > 0) {
                localStorage.setItem('ramazan_hoca_' + username, JSON.stringify(user.data));
                console.log('✅ Veriler Firebase\'den güncellendi!');
                return true;
            }
        } catch (e) {
            console.warn('⚠️ Senkronizasyon başarısız.');
        }
        return false;
    }

    function logout() { sessionStorage.clear(); window.location.reload(); }
    function getCurrentUser() { return sessionStorage.getItem('currentUser'); }
    function isLoggedIn() { return !!getCurrentUser(); }
    function isVIP() { return sessionStorage.getItem('isVIP') === 'true' || sessionStorage.getItem('userRole') === 'vip'; }
    function isTeacher() { return sessionStorage.getItem('isTeacher') === 'true' || sessionStorage.getItem('userRole') === 'admin'; }

    function getDisplayName(username) {
        if (!username) return '';
        const sessionName = sessionStorage.getItem('displayName');
        if (sessionName && username === getCurrentUser()) return sessionName;
        const storedName = localStorage.getItem('ramazan_hoca_name_' + username);
        if (storedName) return storedName;
        return username;
    }

    function setDisplayName(name) {
        const username = getCurrentUser();
        if (username && name && name.trim()) {
            sessionStorage.setItem('displayName', name.trim());
            localStorage.setItem('ramazan_hoca_name_' + username, name.trim());
        }
    }

    return {
        login, teacherLogin, register, resetPassword, logout, sync, getCurrentUser,
        isLoggedIn, isVIP, isTeacher, getDisplayName, setDisplayName, initShield
    };
})();
