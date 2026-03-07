// ============================================
// AUTH.JS — Login & Authentication
// Ramazan Hoca'nın Kimya Sınıfı
// ============================================

const AUTH = (() => {
    // 30 hardcoded users with distinct passwords
    const passwords = [
        "ATOM34", "MOLEKUL9", "PROTON77", "NEKTRON2", "KIMYA88",
        "MADDE15", "GAZLAR44", "SIVI99", "KATI21", "DENEY55",
        "LABORAT8", "ELEMENT3", "BILESIK6", "METAL11", "AMETAL22",
        "SOYGAZ33", "IYON74", "KATYON56", "ANYON89", "COZELTI4",
        "ASIT71", "BAZ92", "TUZ43", "MOL25", "TEPKIME6",
        "ENERJI18", "BAGLAR39", "ORGANIK7", "KARBON60", "OKSIT82"
    ];
    
    const users = [];
    for (let i = 0; i < 30; i++) {
        users.push({
            username: `ogrenci${i + 1}`,
            password: passwords[i]
        });
    }

    // Special Test/Demo User
    users.push({
        username: "test",
        password: "DEMO123"
    });

    function login(username, password, displayName) {
        const user = users.find(u => u.username === username && u.password === password);
        if (user) {
            sessionStorage.setItem('currentUser', username);
            // Save the custom display name
            if (displayName && displayName.trim()) {
                sessionStorage.setItem('displayName', displayName.trim());
                // Also persist in localStorage for next sessions
                localStorage.setItem('ramazan_hoca_name_' + username, displayName.trim());
            }
            Storage.initUser(username);
            return { success: true, username: username };
        }
        return { success: false, message: "Kullanıcı adı veya şifre hatalı!" };
    }

    function logout() {
        sessionStorage.removeItem('currentUser');
        sessionStorage.removeItem('displayName');
        APP.navigate('login');
    }

    function getCurrentUser() {
        return sessionStorage.getItem('currentUser');
    }

    function isLoggedIn() {
        return !!getCurrentUser();
    }

    function getDisplayName(username) {
        if (!username) return '';
        // First check session
        const sessionName = sessionStorage.getItem('displayName');
        if (sessionName) return sessionName;
        // Then check localStorage
        const storedName = localStorage.getItem('ramazan_hoca_name_' + username);
        if (storedName) return storedName;
        // Fallback
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

    return { login, logout, getCurrentUser, isLoggedIn, getDisplayName, setDisplayName };
})();
