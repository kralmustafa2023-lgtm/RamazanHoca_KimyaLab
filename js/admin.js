// ============================================
// ADMIN.JS — Öğretmen Kontrol Paneli İşlevleri
// Ramazan Hoca'nın Kimya Sınıfı
// ============================================

const ADMIN = (() => {
    let usersData = [];

    async function fetchAllUsers() {
        try {
            const req = await fetch('/api/admin?action=users');
            if (req.ok) {
                const res = await req.json();
                if (res.success) {
                    usersData = res.data;
                    renderUsersTable();
                    renderStats();
                }
            } else {
                console.warn('Backend bağlantısı yok, yerel test verisi üretiliyor.');
                usersData = generateFallbackUsers();
                renderUsersTable();
                renderStats();
            }
        } catch (e) {
            console.error('Kullanıcılar çekilemedi', e);
            usersData = generateFallbackUsers();
            renderUsersTable();
            renderStats();
        }
    }

    function generateFallbackUsers() {
        const users = [];
        for (let i = 1; i <= 30; i++) {
            const raw = localStorage.getItem('ramazan_hoca_ogrenci' + i);
            if (raw) {
                users.push({ username: 'ogrenci' + i, data: JSON.parse(raw) });
            }
        }
        return users;
    }

    function renderStats() {
        document.getElementById('admin-stat-total').textContent = usersData.length;
        
        let totalGames = 0;
        let highestPoint = 0;
        let topUser = '-';

        usersData.forEach(u => {
            const d = u.data;
            if (d.gamesPlayed) totalGames += d.gamesPlayed;
            if (d.totalPoints > highestPoint) {
                highestPoint = d.totalPoints;
                topUser = AUTH.getDisplayName(u.username) || u.username;
            }
        });

        document.getElementById('admin-stat-games').textContent = totalGames;
        document.getElementById('admin-stat-top').textContent = `${highestPoint} (${topUser})`;
    }

    function renderUsersTable() {
        const tbody = document.getElementById('admin-users-tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        usersData.forEach(user => {
            const d = user.data || {};
            const level = d.level || 'Çaylak';
            const coins = d.coins || 0;
            const points = d.totalPoints || 0;
            const displayName = AUTH.getDisplayName(user.username) || user.username;
            const status = d.banned ? '<span class="status-badge status-banned">Donduruldu</span>' : '<span class="status-badge status-active">Aktif</span>';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <div style="width:36px; height:36px; border-radius:50%; background:#F4F7FE; display:flex; align-items:center; justify-content:center; overflow:hidden;">
                            ${d.activeAvatar ? d.activeAvatar : '👤'}
                        </div>
                        <div style="display:flex; flex-direction:column;">
                            <span style="font-weight:700;">${displayName}</span>
                            <span style="font-size:12px; color:#A3AED0;">${user.username}</span>
                        </div>
                    </div>
                </td>
                <td>${level}</td>
                <td><span style="color:#FFB547; font-weight:800;">${points} ⭐</span></td>
                <td><span style="color:#05CD99; font-weight:800;">${coins} 💰</span></td>
                <td>${status}</td>
                <td>
                    <div style="display:flex; gap:8px;">
                        <button class="admin-btn btn-edit" title="İstatistikleri Gör" onclick="ADMIN.viewUserStats('${user.username}')">İncele</button>
                        ${d.banned ? 
                            `<button class="admin-btn btn-success" onclick="ADMIN.toggleBan('${user.username}', false)">Aç</button>` :
                            `<button class="admin-btn btn-danger" onclick="ADMIN.toggleBan('${user.username}', true)">Kapat</button>`
                        }
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    async function toggleBan(username, banState) {
        if (!confirm(`Bu kullanıcının hesabını ${banState ? 'kapatmak' : 'açmak'} istediğinize emin misiniz?`)) return;

        // Perform via Backend API
        try {
            const formData = { username, banned: banState };
            const req = await fetch('/api/admin?action=toggleAccount', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            if (req.ok) {
                // local update as well
                const userObj = usersData.find(u => u.username === username);
                if (userObj) {
                    userObj.data.banned = banState;
                    localStorage.setItem('ramazan_hoca_' + username, JSON.stringify(userObj.data));
                }
                renderUsersTable();
                alert('İşlem Başarılı!');
            }
        } catch (e) {
            // Local mode
            const userObj = usersData.find(u => u.username === username);
            if (userObj) {
                userObj.data.banned = banState;
                localStorage.setItem('ramazan_hoca_' + username, JSON.stringify(userObj.data));
                renderUsersTable();
                alert('Hesap durumu güncellendi (Yerel). Senkronizasyon olmadı.');
            }
        }
    }

    function viewUserStats(username) {
        const userObj = usersData.find(u => u.username === username);
        if(!userObj) return;
        const d = userObj.data;
        
        let worstElementText = "Henüz hata yok.";
        if (d.wrongAnswers && d.wrongAnswers.length > 0) {
            const worst = d.wrongAnswers.sort((a,b) => b.count - a.count)[0];
            worstElementText = `${worst.correct} (Hatalı: ${worst.userAnswer}) - ${worst.count} Kez`;
        }

        const info = `
Öğrenci: ${AUTH.getDisplayName(username)}
Puan: ${d.totalPoints} | Altın: ${d.coins || 0}
Sürekli Oynama (Streak): ${d.streak || 0} Gün
Genel Doğruluk Oranı: %${calculateAccuracy(d)}
En Çok Yapılan Hata: ${worstElementText}
Toplam Oynanan Oyun: ${d.gamesPlayed || 0}
Max Kombo: ${d.maxCombo || 0}
`;
        alert(info);
    }
    
    function calculateAccuracy(d) {
        if(!d.stats) return 0;
        let totalCorrect = 0, totalAttempted = 0;
        Object.values(d.stats).forEach(s => {
            totalCorrect += s.totalCorrect || 0;
            totalAttempted += s.totalAttempted || 0;
        });
        if (totalAttempted === 0) return 0;
        return Math.round((totalCorrect / totalAttempted) * 100);
    }

    // MESSAGES / HOMEWORK
    async function sendMessage() {
        const target = document.getElementById('msg-target').value;
        const title = document.getElementById('msg-title').value;
        const body = document.getElementById('msg-body').value;

        if(!title || !body) {
            alert('Lütfen başlık ve mesaj girin.');
            return;
        }

        const msgObj = {
            id: 'msg-' + Date.now(),
            title: title,
            body: body,
            date: new Date().toISOString(),
            read: false,
            sender: 'Ramazan Hoca'
        };

        try {
            const req = await fetch('/api/admin?action=message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ target, message: msgObj })
            });

            if (req.ok) {
                alert('Mesaj başarıyla gönderildi! 🚀');
                document.getElementById('msg-title').value = '';
                document.getElementById('msg-body').value = '';
            }
        } catch(e) {
            // Local fallback
            if (target === 'all') {
                usersData.forEach(u => deliverLocalMessage(u.username, msgObj));
            } else {
                deliverLocalMessage(target, msgObj);
            }
            alert('Mesaj Yerel (Local) olarak iletildi.');
        }
    }

    function deliverLocalMessage(username, msgObj) {
        const key = 'ramazan_hoca_' + username;
        let dataStr = localStorage.getItem(key);
        if (dataStr) {
            let data = JSON.parse(dataStr);
            if(!data.inbox) data.inbox = [];
            data.inbox.push(msgObj);
            localStorage.setItem(key, JSON.stringify(data));
        }
    }

    // CHECK INBOX FOR STUDENT
    function checkInboxForStudent() {
        const username = sessionStorage.getItem('currentUser');
        if(!username) return;
        if(sessionStorage.getItem('isTeacher') === 'true') return;

        const dataStr = localStorage.getItem('ramazan_hoca_' + username);
        if (dataStr) {
            let data = JSON.parse(dataStr);
            if(data.inbox && data.inbox.length > 0) {
                const unread = data.inbox.filter(m => !m.read);
                if (unread.length > 0) {
                    showStudentMessage(unread[0], data, username);
                }
            }
        }
    }

    function showStudentMessage(msg, data, username) {
        if(document.querySelector('.student-msg-overlay')) return;
        
        if (typeof AUDIO !== 'undefined') AUDIO.playSuccess(); // Attention sound

        const overlay = document.createElement('div');
        overlay.className = 'student-msg-overlay';
        overlay.style.cssText = `
            position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(10px);
            z-index: 10000; display: flex; align-items: center; justify-content: center;
        `;
        
        overlay.innerHTML = `
            <div style="background: white; border-radius: 20px; padding: 30px; width: 90%; max-width: 450px; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
                <div style="font-size: 50px; margin-bottom: 10px;">📩</div>
                <h3 style="color:var(--text-primary); font-size:20px; margin-bottom:5px;">${msg.title}</h3>
                <div style="font-size:12px; color:var(--text-muted); margin-bottom: 20px;">Gönderen: ${msg.sender}</div>
                <div style="background:var(--bg-body); padding:20px; border-radius:15px; text-align:left; color:#333; font-weight:500; line-height:1.6; font-size:14px; margin-bottom:25px; border-left:4px solid var(--primary);">
                    ${msg.body.replace(/\\n/g, '<br>')}
                </div>
                <button class="btn" style="width:100%; background:var(--primary); color:white; padding:12px; font-weight:800; border-radius:12px; border:none;" onclick="this.closest('.student-msg-overlay').remove()">Anladım, Kapat</button>
            </div>
        `;
        document.body.appendChild(overlay);

        // Mark as read
        msg.read = true;
        localStorage.setItem('ramazan_hoca_' + username, JSON.stringify(data));
    }

    function getUsersData() {
        return usersData;
    }

    return { 
        fetchAllUsers, renderStats, renderUsersTable, toggleBan, viewUserStats, 
        sendMessage, checkInboxForStudent, getUsersData
    };
})();
