// ============================================
// AUTH.JS — Login & Authentication
// Ramazan Hoca'nın Kimya Sınıfı
// ============================================

const AUTH = (() => {
    // SECURITY LAYER: Passwords are now obfuscated to prevent extraction via "Inspect"
    const _K = "RAMAZAN_HOCA";
    function _D(hex) {
        let r = "";
        for (let i = 0; i < hex.length; i += 2) {
            let k = _K.charCodeAt((i / 2) % _K.length);
            r += String.fromCharCode(parseInt(hex.substr(i, 2), 16) ^ k);
        }
        return r;
    }

    const _P = [
        "1315020C6975", "1F0E010411140266", "02130215150F7968", "1C040615080E006D", "190800181B7976", 
        "1F0009051F707B", "1500170D1B137A6B", "01081B086378", "190019086870", "1604030403747B", 
        "1E000F0E08001A67", "170D080C1F0F1A6C", "1008010409080569", "1F04190016707F", "130C08151B0D7C6D", 
        "010E14061B1B7D6C", "1B18020F6D75", "19001918150F7B69", "130F140E147977", "110E17041615076B", 
        "131204156D70", "1000177868", "0614177569", "1F0E01736F", "06041D0A130C0B69", 
        "170F081310087F67", "10000A0D1B137D66", "1D130A0014080568", "19001F03150F786F", "1D0A1E080E797C"
    ];
    
    // Test User
    const _T = "1604000E6B737D";

    const users = [];
    for (let i = 0; i < 30; i++) {
        users.push({
            username: `ogrenci${i + 1}`,
            passwordHash: _P[i]
        });
    }
    users.push({ username: "test", passwordHash: _T });

    // VIP Founder
    const _VIP_P = "39332C2D37323A39797E7177";
    users.push({ username: "Mstfuygur", passwordHash: _VIP_P, isVIP: true });

    // SHIELD: Prevent Right Click and Common DevTools Shortcuts
    function initShield() {
        document.addEventListener('contextmenu', e => e.preventDefault());
        document.addEventListener('keydown', e => {
            if (e.keyCode == 123 || (e.ctrlKey && e.shiftKey && (e.keyCode == 73 || e.keyCode == 74)) || (e.ctrlKey && e.keyCode == 85)) {
                e.preventDefault();
                return false;
            }
        });
        
        // Console Warning
        console.log("%c⚠️ DUR!", "color: red; font-size: 50px; font-weight: bold; -webkit-text-stroke: 1px black;");
        console.log("%cBu alan sadece geliştiriciler içindir. Buraya kod yapıştırmak hesabınızın güvenliğini tehlikeye atabilir!", "font-size: 18px; color: #333;");
    }

    async function sync() {
        const username = getCurrentUser();
        if (!username) return;

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
        } catch(e) {
            console.warn('⚠️ Senkronizasyon başarısız, çevrimdışı devam ediliyor.');
        }
        return false;
    }

    async function login(username, password, displayName) {
        const user = users.find(u => u.username === username && _D(u.passwordHash) === password);
        if (user) {
            sessionStorage.setItem('currentUser', username);
            
            // 🔥 MySQL Sync -> Pull user database before finishing login!
            await sync();

            if (user.isVIP) {
                sessionStorage.setItem('isVIP', 'true');
            } else {
                sessionStorage.removeItem('isVIP');
            }
            if (displayName && displayName.trim()) {
                sessionStorage.setItem('displayName', displayName.trim());
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
        sessionStorage.removeItem('isVIP');
        window.location.reload();
    }

    function getCurrentUser() {
        return sessionStorage.getItem('currentUser');
    }

    function isLoggedIn() {
        return !!getCurrentUser();
    }

    function isVIP() {
        return sessionStorage.getItem('isVIP') === 'true';
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

    return { login, logout, sync, getCurrentUser, isLoggedIn, isVIP, getDisplayName, setDisplayName, initShield };
})();
