// ============================================
// ADMIN.JS — Firebase-Powered Öğretmen Kontrol Paneli v4.0
// Ramazan Hoca'nın Kimya Sınıfı
// ============================================

const ADMIN = (() => {
    let usersData = [];
    let groupsList = [];
    let notificationsData = [];
    let currentTab = 'dashboard';

    // ===== FETCH ALL USERS FROM FIREBASE =====
    async function fetchAllUsers() {
        try {
            const val = await DB.get('users');
            usersData = [];
            const groupSet = new Set();

            if (val) {
                Object.keys(val).forEach(key => {
                    const d = val[key];
                    if (!d.username || d.username.startsWith('_')) return;
                    usersData.push({
                        username: d.username,
                        displayName: d.displayName,
                        role: d.role || 'student',
                        group: d.group || null,
                        banned: !!d.banned,
                        email: d.email || '',
                        data: d.data || {}
                    });
                    if (d.group) groupSet.add(d.group);
                });
            }

            groupsList = Array.from(groupSet);

            // Fetch notifications
            const notifs = await DB.get('notifications');
            notificationsData = [];
            if (notifs) {
                Object.keys(notifs).forEach(key => {
                    const n = notifs[key];
                    n.firebaseKey = key;
                    if (!n.id) n.id = key;
                    notificationsData.push(n);
                });
                notificationsData.sort((a,b) => new Date(b.date) - new Date(a.date));
            }

        } catch (e) {
            console.warn('Firebase bağlantısı yok.', e);
        }

        renderCurrentTab();
    }

    function getUsersData() { return usersData; }

    // ===== TAB NAVIGATION =====
    function switchTab(tab) {
        currentTab = tab;
        renderCurrentTab();
    }

    function renderCurrentTab() {
        const body = document.getElementById('admin-tab-content');
        if (!body) return;

        // Update tab buttons
        document.querySelectorAll('.admin-tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === currentTab);
        });

        switch (currentTab) {
            case 'dashboard': renderDashboard(body); break;
            case 'students': renderStudents(body); break;
            case 'messages': renderMessages(body); break;
            case 'questions': renderQuestions(body); break;
            case 'settings': renderSettings(body); break;
        }
    }

    // ===== 1. DASHBOARD (Leaderboard) =====
    function renderDashboard(container) {
        const sorted = [...usersData].filter(u => u.role !== 'admin').sort((a, b) => (b.data.totalPoints || 0) - (a.data.totalPoints || 0));
        let totalGames = 0;
        let totalStudents = sorted.length;
        sorted.forEach(u => { totalGames += (u.data.gamesPlayed || 0); });

        let leaderboardRows = sorted.map((u, i) => {
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;
            const pts = u.data.totalPoints || 0;
            const games = u.data.gamesPlayed || 0;
            const accuracy = calcAccuracy(u.data);
            return `<tr>
                <td style="font-weight:800; font-size:18px;">${medal}</td>
                <td><div style="display:flex;align-items:center;gap:8px;">
                    <span style="font-size:22px;">${u.data.activeAvatar || '👤'}</span>
                    <div><div style="font-weight:700;">${u.displayName || u.username}</div>
                    <div style="font-size:11px; color:#A3AED0;">${u.username} ${u.group ? '• ' + u.group : ''}</div></div>
                </div></td>
                <td style="font-weight:800; color:#FFB547;">${pts} ⭐</td>
                <td>${games}</td>
                <td>%${accuracy}</td>
                <td>${u.banned ? '<span class="status-badge status-banned">Kapalı</span>' : '<span class="status-badge status-active">Aktif</span>'}</td>
            </tr>`;
        }).join('');

        container.innerHTML = `
            <div class="admin-stats-grid">
                <div class="admin-stat-card">
                    <div class="stat-icon" style="background:rgba(117,81,255,0.1);color:#7551FF;">👥</div>
                    <div class="stat-info"><div class="stat-value">${totalStudents}</div><div class="stat-label">Toplam Öğrenci</div></div>
                </div>
                <div class="admin-stat-card">
                    <div class="stat-icon" style="background:rgba(5,205,153,0.1);color:#05CD99;">🎮</div>
                    <div class="stat-info"><div class="stat-value">${totalGames}</div><div class="stat-label">Oynanan Oyun</div></div>
                </div>
                <div class="admin-stat-card">
                    <div class="stat-icon" style="background:rgba(255,181,71,0.1);color:#FFB547;">🏆</div>
                    <div class="stat-info"><div class="stat-value" style="font-size:16px;">${sorted[0] ? (sorted[0].displayName || sorted[0].username) : '-'}</div><div class="stat-label">Sınıf Birincisi</div></div>
                </div>
                <div class="admin-stat-card">
                    <div class="stat-icon" style="background:rgba(238,93,80,0.1);color:#EE5D50;">📊</div>
                    <div class="stat-info"><div class="stat-value">${groupsList.length}</div><div class="stat-label">Grup / Sınıf</div></div>
                </div>
            </div>
            <div class="admin-table-container">
                <h3 style="margin:0 0 15px 0;color:#2B3674;">📊 Skor Sıralaması</h3>
                <table class="admin-table">
                    <thead><tr><th>Sıra</th><th>Öğrenci</th><th>Puan</th><th>Oyun</th><th>Doğruluk</th><th>Durum</th></tr></thead>
                    <tbody>${leaderboardRows || '<tr><td colspan="6" style="text-align:center;">Henüz öğrenci yok.</td></tr>'}</tbody>
                </table>
            </div>
        `;
    }

    // ===== 2. STUDENTS TAB =====
    function renderStudents(container) {
        let rows = usersData.filter(u => u.role !== 'admin').map(u => {
            return `<tr>
                <td><div style="display:flex;align-items:center;gap:8px;">
                    <span style="font-size:20px;">${u.data.activeAvatar || '👤'}</span>
                    <div><div style="font-weight:700;">${u.displayName || u.username}</div>
                    <div style="font-size:11px;color:#A3AED0;">${u.username}</div></div>
                </div></td>
                <td>${u.group || '-'}</td>
                <td style="color:#FFB547;font-weight:800;">${u.data.totalPoints || 0} ⭐</td>
                <td style="color:#05CD99;font-weight:800;">${u.data.coins || 0} 💰</td>
                <td>${u.banned ? '<span class="status-badge status-banned">Kapalı</span>' : '<span class="status-badge status-active">Aktif</span>'}</td>
                <td>
                    <div style="display:flex;gap:6px;flex-wrap:wrap;">
                        <button class="admin-btn btn-edit" onclick="ADMIN.viewUserDetails('${u.username}')">Detay</button>
                        <button class="admin-btn btn-edit" onclick="ADMIN.editUser('${u.username}')">✏️</button>
                        <button class="admin-btn btn-edit" onclick="ADMIN.showPassword('${u.username}')">🔑</button>
                        ${u.banned ? 
                            `<button class="admin-btn btn-success" onclick="ADMIN.toggleBan('${u.username}',false)">Aç</button>` :
                            `<button class="admin-btn btn-danger" onclick="ADMIN.toggleBan('${u.username}',true)">Kapat</button>`
                        }
                        <button class="admin-btn btn-danger" onclick="ADMIN.deleteUser('${u.username}')">🗑️</button>
                    </div>
                </td>
            </tr>`;
        }).join('');

        let groupOptions = groupsList.map(g => `<option value="${g}">${g}</option>`).join('');

        container.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:10px;">
                <h3 style="margin:0;color:#2B3674;">👥 Öğrenci Yönetimi (${usersData.filter(u=>u.role!=='admin').length} Kişi)</h3>
                <button class="admin-btn btn-success" style="padding:10px 20px;font-size:14px;" onclick="ADMIN.showAddUserModal()">+ Yeni Öğrenci Ekle</button>
            </div>
            <div class="admin-table-container">
                <table class="admin-table">
                    <thead><tr><th>Öğrenci</th><th>Grup</th><th>Puan</th><th>Altın</th><th>Durum</th><th>İşlemler</th></tr></thead>
                    <tbody>${rows || '<tr><td colspan="6" style="text-align:center;">Henüz öğrenci yok.</td></tr>'}</tbody>
                </table>
            </div>

            <!-- Add User Modal -->
            <div id="add-user-modal" class="admin-modal-overlay" style="opacity:0;pointer-events:none;">
                <div class="admin-modal">
                    <h3>➕ Yeni Öğrenci Ekle</h3>
                    <div class="admin-form-group"><label>Kullanıcı Adı</label><input type="text" id="new-username" class="admin-input" placeholder="ornek: ogrenci31"></div>
                    <div class="admin-form-group"><label>Şifre</label><input type="text" id="new-password" class="admin-input" placeholder="Güçlü bir şifre"></div>
                    <div class="admin-form-group"><label>Görünen Ad</label><input type="text" id="new-displayname" class="admin-input" placeholder="Ahmet Yılmaz"></div>
                    <div class="admin-form-group"><label>Grup / Sınıf</label>
                        <input type="text" id="new-group" class="admin-input" placeholder="9A, 10B veya boş bırakın" list="group-list">
                        <datalist id="group-list">${groupOptions}</datalist>
                    </div>
                    <div style="display:flex;gap:10px;margin-top:20px;">
                        <button class="admin-btn btn-success" style="flex:1;padding:12px;" onclick="ADMIN.addUser()">Kaydet ✅</button>
                        <button class="admin-btn btn-danger" style="flex:1;padding:12px;" onclick="ADMIN.closeModal('add-user-modal')">İptal</button>
                    </div>
                </div>
            </div>

            <!-- Edit User Modal -->
            <div id="edit-user-modal" class="admin-modal-overlay" style="opacity:0;pointer-events:none;">
                <div class="admin-modal">
                    <h3>✏️ Öğrenci Düzenle</h3>
                    <input type="hidden" id="edit-username-key">
                    <div class="admin-form-group"><label>Yeni Şifre (boş bırakılırsa değişmez)</label><input type="text" id="edit-password" class="admin-input"></div>
                    <div class="admin-form-group"><label>Görünen Ad</label><input type="text" id="edit-displayname" class="admin-input"></div>
                    <div class="admin-form-group"><label>Grup / Sınıf</label>
                        <input type="text" id="edit-group" class="admin-input" list="group-list-edit">
                        <datalist id="group-list-edit">${groupOptions}</datalist>
                    </div>
                    <div style="display:flex;gap:10px;margin-top:20px;">
                        <button class="admin-btn btn-success" style="flex:1;padding:12px;" onclick="ADMIN.saveEditUser()">Güncelle 💾</button>
                        <button class="admin-btn btn-danger" style="flex:1;padding:12px;" onclick="ADMIN.closeModal('edit-user-modal')">İptal</button>
                    </div>
                </div>
            </div>
        `;
    }

    function showAddUserModal() { openModal('add-user-modal'); }

    async function addUser() {
        const username = document.getElementById('new-username').value.trim();
        const password = document.getElementById('new-password').value.trim();
        const email = document.getElementById('new-email') ? document.getElementById('new-email').value.trim() : '';
        const displayName = document.getElementById('new-displayname').value.trim();
        const group = document.getElementById('new-group').value.trim();
        if (!username || !password) { alert('Kullanıcı adı ve şifre zorunlu!'); return; }
        try {
            const existing = await DB.get('users/' + username);
            if (existing) { alert('Bu kullanıcı adı zaten mevcut!'); return; }

            await DB.set('users/' + username, {
                username: username,
                password: password,
                email: email || '',
                displayName: displayName || username,
                role: 'student',
                group: group || null,
                banned: false,
                data: {}
            });
            alert('Öğrenci eklendi! ✅');
            closeModal('add-user-modal');
            fetchAllUsers();
        } catch (e) { alert('Firebase hatası: ' + e.message); }
    }

    function editUser(username) {
        const user = usersData.find(u => u.username === username);
        if (!user) return;
        document.getElementById('edit-username-key').value = username;
        document.getElementById('edit-password').value = '';
        document.getElementById('edit-displayname').value = user.displayName || '';
        document.getElementById('edit-group').value = user.group || '';
        openModal('edit-user-modal');
    }

    async function saveEditUser() {
        const username = document.getElementById('edit-username-key').value;
        const password = document.getElementById('edit-password').value.trim();
        const displayName = document.getElementById('edit-displayname').value.trim();
        const group = document.getElementById('edit-group').value.trim();
        const updates = {};
        if (password) updates.password = password;
        if (displayName) updates.displayName = displayName;
        updates.group = group || null;

        try {
            await DB.update('users/' + username, updates);
            alert('Güncellendi ✅');
            closeModal('edit-user-modal');
            fetchAllUsers();
        } catch (e) { alert('Firebase hatası: ' + e.message); }
    }

    async function showPassword(username) {
        try {
            const doc = await DB.get('users/' + username);
            if (doc) {
                alert(`🔑 ${username} şifresi: ${doc.password}`);
            } else {
                alert('Kullanıcı bulunamadı.');
            }
        } catch (e) { alert('Firebase hatası: ' + e.message); }
    }

    async function toggleBan(username, banState) {
        if (!confirm(`${username} hesabını ${banState ? 'dondurmak' : 'açmak'} istediğinize emin misiniz?`)) return;
        try {
            await DB.update('users/' + username, { banned: banState });
            fetchAllUsers();
        } catch (e) { alert('Firebase hatası: ' + e.message); }
    }

    async function deleteUser(username) {
        if (!confirm(`${username} hesabı KALİCI olarak silinecek. Emin misiniz?`)) return;
        try {
            await DB.remove('users/' + username);
            fetchAllUsers();
        } catch (e) { alert('Firebase hatası: ' + e.message); }
    }

    function viewUserDetails(username) {
        const u = usersData.find(x => x.username === username);
        if (!u) return;
        const d = u.data;
        const accuracy = calcAccuracy(d);
        let worstElements = '<span style="color:var(--text-muted);">Henüz hata yok.</span>';
        if (d.wrongAnswers && d.wrongAnswers.length > 0) {
            const sorted = [...d.wrongAnswers].sort((a, b) => b.count - a.count).slice(0, 3);
            worstElements = sorted.map(w => `<span style="background:rgba(255,82,82,0.15); color:#FF5252; padding:3px 8px; border-radius:6px; font-size:11px; font-weight:800; display:inline-block; margin-bottom:4px;">${w.correct} (${w.count}x)</span>`).join(' ');
        }
        
        const overlay = document.createElement('div');
        overlay.className = 'user-detail-overlay';
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.85);backdrop-filter:blur(15px);z-index:10000;display:flex;align-items:center;justify-content:center;opacity:0;transition:all 0.4s ease; perspective:1000px; padding:10px; box-sizing:border-box; overflow-y:auto;';
        
        overlay.innerHTML = `
            <div class="user-detail-card" style="margin:auto; background:var(--bg-card);border-radius:24px;padding:0;width:100%;max-width:400px;box-shadow:0 30px 60px rgba(0,0,0,0.6);transform:rotateX(15deg) translateY(30px);transition:all 0.5s cubic-bezier(0.175,0.885,0.32,1.275);overflow:hidden;border:1px solid rgba(255,255,255,0.1); display:flex; flex-direction:column; max-height:95vh;">
                
                <!-- Header Component -->
                <div style="flex-shrink:0; background:linear-gradient(135deg, var(--teal, #00BFA5), #7C4DFF); padding:20px 15px 15px; text-align:center; position:relative;">
                    <button style="position:absolute; top:15px; right:15px; background:rgba(0,0,0,0.2); border:none; color:white; width:30px; height:30px; border-radius:50%; font-weight:bold; cursor:pointer;" onclick="const o=this.closest('.user-detail-overlay'); o.style.opacity='0'; o.querySelector('.user-detail-card').style.transform='rotateX(-15deg) translateY(30px)'; setTimeout(()=>o.remove(),400);">✕</button>
                    <div style="font-size:50px; margin-bottom:5px; filter:drop-shadow(0 4px 10px rgba(0,0,0,0.3)); line-height:1;">${d.activeAvatar || '👤'}</div>
                    <h3 style="color:white; font-size:20px; font-weight:800; margin:0 0 5px; font-family:'Poppins',sans-serif; text-shadow:0 2px 4px rgba(0,0,0,0.2);">${u.displayName || u.username}</h3>
                    <div style="font-size:11px; color:rgba(255,255,255,1); background:rgba(0,0,0,0.25); display:inline-block; padding:4px 12px; border-radius:15px; font-weight:700; border:1px solid rgba(255,255,255,0.2);">Sınıf: <strong style="text-shadow:none; color:#FFD700;">${u.group || 'Yok'}</strong></div>
                </div>
                
                <!-- Scrollable Body Component -->
                <div style="padding:15px 20px 20px; overflow-y:auto; flex-shrink:1;">
                    <table style="width:100%; border-collapse:separate; border-spacing:0 4px; margin-top:-5px; margin-bottom:15px; font-size:13px; text-align:left; font-family:'Inter', sans-serif;">
                        <tbody>
                            <tr style="background:rgba(0,0,0,0.02); border-radius:10px;">
                                <td style="padding:10px 12px; color:var(--text-muted); font-weight:600; border-radius:10px 0 0 10px;"><span style="display:inline-block; width:22px; font-size:15px;">⭐</span> Puan</td>
                                <td style="padding:10px 12px; font-weight:900; color:#FF9100; text-align:right; font-size:14px; border-radius:0 10px 10px 0;">${d.totalPoints || 0}</td>
                            </tr>
                            <tr style="background:rgba(0,0,0,0.02); border-radius:10px;">
                                <td style="padding:10px 12px; color:var(--text-muted); font-weight:600; border-radius:10px 0 0 10px;"><span style="display:inline-block; width:22px; font-size:15px;">💰</span> Altın</td>
                                <td style="padding:10px 12px; font-weight:900; color:var(--teal, #00BFA5); text-align:right; font-size:14px; border-radius:0 10px 10px 0;">${d.coins || 0}</td>
                            </tr>
                            <tr style="background:rgba(0,0,0,0.02); border-radius:10px;">
                                <td style="padding:10px 12px; color:var(--text-muted); font-weight:600; border-radius:10px 0 0 10px;"><span style="display:inline-block; width:22px; font-size:15px;">🎖️</span> Seviye</td>
                                <td style="padding:10px 12px; font-weight:800; color:var(--text-primary); text-align:right; border-radius:0 10px 10px 0;">${d.level || 'Çaylak'}</td>
                            </tr>
                            <tr style="background:rgba(0,0,0,0.02); border-radius:10px;">
                                <td style="padding:10px 12px; color:var(--text-muted); font-weight:600; border-radius:10px 0 0 10px;"><span style="display:inline-block; width:22px; font-size:15px;">🎮</span> Oynanan Oyun</td>
                                <td style="padding:10px 12px; font-weight:800; color:var(--text-primary); text-align:right; border-radius:0 10px 10px 0;">${d.gamesPlayed || 0}</td>
                            </tr>
                            <tr style="background:rgba(0,0,0,0.02); border-radius:10px;">
                                <td style="padding:10px 12px; color:var(--text-muted); font-weight:600; border-radius:10px 0 0 10px;"><span style="display:inline-block; width:22px; font-size:15px;">🔥</span> Max Kombo</td>
                                <td style="padding:10px 12px; font-weight:800; color:var(--text-primary); text-align:right; border-radius:0 10px 10px 0;">${d.maxCombo || 0}</td>
                            </tr>
                            <tr style="background:rgba(0,0,0,0.02); border-radius:10px;">
                                <td style="padding:10px 12px; color:var(--text-muted); font-weight:600; border-radius:10px 0 0 10px;"><span style="display:inline-block; width:22px; font-size:15px;">📅</span> Sürekli Görev</td>
                                <td style="padding:10px 12px; font-weight:800; color:var(--text-primary); text-align:right; border-radius:0 10px 10px 0;">${d.streak || 0} Gün</td>
                            </tr>
                            <tr style="background:rgba(0,0,0,0.02); border-radius:10px;">
                                <td style="padding:10px 12px; color:var(--text-muted); font-weight:600; border-radius:10px 0 0 10px;"><span style="display:inline-block; width:22px; font-size:15px;">🎯</span> Başarı Oranı</td>
                                <td style="padding:10px 12px; font-weight:800; color:var(--text-primary); text-align:right; border-radius:0 10px 10px 0;">%${accuracy}</td>
                            </tr>
                            <tr style="background:rgba(255,82,82,0.05); border-radius:10px;">
                                <td style="padding:12px 12px; color:#FF5252; font-weight:700; vertical-align:middle; border-radius:10px 0 0 10px;"><span style="display:inline-block; width:22px; font-size:15px;">❌</span> Hatalar</td>
                                <td style="padding:12px 12px; text-align:right; max-width:140px; line-height:1.6; border-radius:0 10px 10px 0;">${worstElements}</td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <button style="width:100%; padding:14px; border-radius:14px; font-weight:800; font-size:14px; font-family:'Poppins',sans-serif; background:rgba(0,0,0,0.06); color:var(--text-primary); border:none; cursor:pointer; transition:all 0.3s; flex-shrink:0;" onmouseover="this.style.background='var(--teal)'; this.style.color='white'; this.style.transform='translateY(-2px)';" onmouseout="this.style.background='rgba(0,0,0,0.06)'; this.style.color='var(--text-primary)'; this.style.transform='translateY(0)';" onclick="const o=this.closest('.user-detail-overlay'); o.style.opacity='0'; o.querySelector('.user-detail-card').style.transform='rotateX(-15deg) translateY(30px)'; setTimeout(()=>o.remove(),400);">
                        İncelemeyi Kapat
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        
        // Force reflow
        void overlay.offsetWidth;
        
        setTimeout(() => {
            overlay.style.opacity = '1';
            const card = overlay.querySelector('.user-detail-card');
            if (card) card.style.transform = 'rotateX(0deg) translateY(0)';
        }, 10);
    }

    // ===== 3. MESSAGES TAB =====
    function renderMessages(container) {
        let userOptions = usersData.filter(u => u.role !== 'admin').map(u =>
            `<option value="${u.username}">${u.displayName || u.username}</option>`
        ).join('');
        let groupOptions = groupsList.map(g => `<option value="${g}">${g}</option>`).join('');

        container.innerHTML = `
            <div class="admin-table-container">
                <h3 style="margin:0 0 20px 0;color:#2B3674;">📩 Yeni Mesaj & Görev Gönder</h3>
                <div class="admin-form-group"><label>Gönderim Tipi</label>
                    <select id="msg-type" class="admin-select" onchange="ADMIN.onMsgTypeChange()">
                        <option value="all">🌍 Tüm Öğrenciler</option>
                        <option value="group">📁 Gruba Gönder</option>
                        <option value="individual">👤 Bireysel</option>
                    </select>
                </div>
                <div id="msg-target-wrapper" class="admin-form-group" style="display:none;">
                    <label>Alıcı</label>
                    <select id="msg-target" class="admin-select">
                        <optgroup label="Gruplar">${groupOptions}</optgroup>
                        <optgroup label="Öğrenciler">${userOptions}</optgroup>
                    </select>
                </div>
                <div class="admin-form-group"><label>Başlık</label><input type="text" id="msg-title" class="admin-input" placeholder="Örn: Hafta Sonu Ödevi"></div>
                <div class="admin-form-group"><label>Mesaj İçeriği</label>
                    <textarea id="msg-body" class="admin-input admin-textarea" placeholder="Mesajınızı..."></textarea>
                </div>
                <button class="admin-btn btn-success" style="padding:14px 30px;font-size:15px;width:100%;margin-bottom:30px;" onclick="ADMIN.sendMessage()">Gönder 🚀</button>
                
                <h3 style="margin:0 0 15px 0;color:#2B3674;border-top:2px solid #F4F7FE;padding-top:20px;">📨 Gönderilen Mesaj Geçmişi</h3>
                <table class="admin-table">
                    <thead><tr><th>Tarih</th><th>Alıcı</th><th>Mesaj Özeti</th><th>İşlemler</th></tr></thead>
                    <tbody>
                        ${notificationsData.length > 0 ? notificationsData.map(n => `
                            <tr>
                                <td style="font-size:12px;color:var(--text-muted);">${new Date(n.date).toLocaleDateString()} <br> ${new Date(n.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</td>
                                <td><span class="status-badge" style="background:rgba(117,81,255,0.1);color:#7551FF;">${n.targetType === 'all' ? '🌍 Herkes' : n.targetType === 'group' ? '📁 ' + n.target : '👤 ' + n.target}</span></td>
                                <td style="max-width:200px;">
                                    <strong>${n.title}</strong>
                                    <div style="font-size:11px;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${n.body}</div>
                                </td>
                                <td>
                                    <button class="admin-btn btn-danger" onclick="ADMIN.deleteMessage('${n.id}', '${n.firebaseKey}')" style="padding:6px 12px;font-size:12px;">🗑️ Sil / Geri Çek</button>
                                </td>
                            </tr>
                        `).join('') : '<tr><td colspan="4" style="text-align:center;padding:20px;">Henüz mesaj gönderilmedi.</td></tr>'}
                    </tbody>
                </table>
            </div>
        `;
    }

    function onMsgTypeChange() {
        const type = document.getElementById('msg-type').value;
        const wrapper = document.getElementById('msg-target-wrapper');
        wrapper.style.display = type === 'all' ? 'none' : 'block';
    }

    async function sendMessage() {
        const targetType = document.getElementById('msg-type').value;
        const target = document.getElementById('msg-target') ? document.getElementById('msg-target').value : '';
        const title = document.getElementById('msg-title').value.trim();
        const body = document.getElementById('msg-body').value.trim();
        if (!title || !body) { alert('Başlık ve mesaj gerekli!'); return; }

        const msgId = 'msg-' + Date.now();
        const msgObj = {
            id: msgId,
            title: title,
            body: body,
            date: new Date().toISOString(),
            sender: 'Ramazan Hoca',
            targetType: targetType,
            target: target || 'all'
        };

        try {
            await DB.update('notifications/' + msgId, msgObj);

            let targetUsers = [];
            if (targetType === 'all') {
                targetUsers = usersData.filter(u => u.role !== 'admin');
            } else if (targetType === 'group') {
                targetUsers = usersData.filter(u => u.group === target);
            } else {
                targetUsers = usersData.filter(u => u.username === target);
            }

            for (const user of targetUsers) {
                const inbox = user.data.inbox || [];
                inbox.push({ ...msgObj, read: false });
                await DB.update('users/' + user.username, {
                    'data/inbox': inbox
                });
            }

            alert(`Mesaj ${targetUsers.length} kişiye gönderildi! 🚀`);
            document.getElementById('msg-title').value = '';
            document.getElementById('msg-body').value = '';
            fetchAllUsers(); // Refresh messages list
        } catch (e) { alert('Firebase hatası: ' + e.message); }
    }

    async function deleteMessage(msgId, firebaseKey) {
        if (!confirm('Bu mesajı silmek / tüm öğrencilerden geri çekmek istediğinize emin misiniz?')) return;
        try {
            // Delete from notifications history
            await DB.remove('notifications/' + (firebaseKey || msgId));

            // Also remove from all users' inboxes (Geri Çekme)
            let students = usersData.filter(u => u.role !== 'admin');
            for (const user of students) {
                if (user.data.inbox && user.data.inbox.length > 0) {
                    const newInbox = user.data.inbox.filter(m => m.id !== msgId && m.firebaseKey !== firebaseKey);
                    if (newInbox.length !== user.data.inbox.length) {
                        await DB.update('users/' + user.username, { 'data/inbox': newInbox });
                    }
                }
            }

            alert('Mesaj başarıyla silindi ve kullanıcılardan geri çekildi! 🗑️');
            fetchAllUsers();
        } catch (e) { alert('Hata: ' + e.message); }
    }

    // ===== 4. QUESTIONS CMS =====
    function renderQuestions(container) {
        let tableCards = Object.keys(TABLES).map(key => {
            const t = TABLES[key];
            return `
                <div class="admin-stat-card" style="cursor:pointer;flex-direction:column;align-items:flex-start;" onclick="ADMIN.editTable('${key}')">
                    <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
                        <span style="font-size:30px;">${t.icon}</span>
                        <div><div style="font-weight:800;color:#2B3674;">${t.name}</div>
                        <div style="font-size:12px;color:#A3AED0;">${t.items.length} Element</div></div>
                    </div>
                    <button class="admin-btn btn-edit">Düzenle ✏️</button>
                </div>
            `;
        }).join('');

        container.innerHTML = `
            <h3 style="margin:0 0 20px 0;color:#2B3674;">📝 Soru Havuzu (CMS)</h3>
            <p style="color:#A3AED0;margin-bottom:20px;">Bir tabloya tıklayarak element ekleme, silme veya düzenleme yapabilirsiniz. Değişiklikler Firebase'e kaydedilir.</p>
            <div class="admin-stats-grid">${tableCards}</div>
            <div id="table-editor" style="margin-top:20px;"></div>
        `;
    }

    function editTable(tableKey) {
        const t = TABLES[tableKey];
        const editor = document.getElementById('table-editor');
        if (!editor) return;

        let rows = t.items.map((item, i) => `
            <tr>
                <td><input class="admin-input" style="width:80px;" value="${item.symbol}" data-field="symbol" data-idx="${i}"></td>
                <td><input class="admin-input" style="width:120px;" value="${item.name}" data-field="name" data-idx="${i}"></td>
                <td><input class="admin-input" style="width:60px;" value="${item.charge || (item.charges ? item.charges.join(',') : item.number || '')}" data-field="extra" data-idx="${i}"></td>
                <td><button class="admin-btn btn-danger" onclick="ADMIN.removeElement('${tableKey}',${i})">🗑️</button></td>
            </tr>
        `).join('');

        editor.innerHTML = `
            <div class="admin-table-container">
                <h3 style="margin:0 0 15px 0;color:#2B3674;">${t.icon} ${t.name} Düzenle</h3>
                <table class="admin-table">
                    <thead><tr><th>Sembol</th><th>Ad</th><th>Yük / Numara</th><th></th></tr></thead>
                    <tbody id="table-editor-body">${rows}</tbody>
                </table>
                <div style="display:flex;gap:10px;margin-top:15px;">
                    <button class="admin-btn btn-success" style="padding:10px 20px;" onclick="ADMIN.addElement('${tableKey}')">+ Element Ekle</button>
                    <button class="admin-btn btn-edit" style="padding:10px 20px;" onclick="ADMIN.saveTable('${tableKey}')">💾 Kaydet (Firebase'e)</button>
                </div>
            </div>
        `;
    }

    function addElement(tableKey) {
        const t = TABLES[tableKey];
        t.items.push({ symbol: '?', name: 'Yeni Element', charge: '0', bio: '' });
        editTable(tableKey);
    }

    function removeElement(tableKey, idx) {
        TABLES[tableKey].items.splice(idx, 1);
        editTable(tableKey);
    }

    async function saveTable(tableKey) {
        // Read edited inputs
        const inputs = document.querySelectorAll('#table-editor-body input');
        const items = TABLES[tableKey].items;
        inputs.forEach(inp => {
            const idx = parseInt(inp.dataset.idx);
            const field = inp.dataset.field;
            if (field === 'symbol') items[idx].symbol = inp.value;
            if (field === 'name') items[idx].name = inp.value;
            if (field === 'extra') {
                if (items[idx].charge !== undefined) items[idx].charge = inp.value;
                else if (items[idx].charges !== undefined) items[idx].charges = inp.value.split(',');
                else if (items[idx].number !== undefined) items[idx].number = parseInt(inp.value) || 0;
            }
        });

        try {
            await DB.update('appData/tables', { tables: TABLES });
            alert('Tablo Firebase\'e kaydedildi! ✅ Öğrenciler oyuna girdiklerinde yeni soruları görecek.');
            // Regenerate local questions
            if (typeof loadTablesFromDB === 'function') loadTablesFromDB();
        } catch (e) { alert('Firebase hatası: ' + e.message); }
    }

    // ===== 6. SETTINGS =====
    function renderSettings(container) {
        container.innerHTML = `
            <div class="admin-table-container" style="max-width:500px;">
                <h3 style="margin:0 0 20px 0;color:#2B3674;">⚙️ Sistem Ayarları</h3>
                <div class="admin-form-group"><label>🔑 Admin Şifre Değiştir</label></div>
                <div class="admin-form-group"><label style="font-size:13px;">Mevcut Şifre</label><input type="password" id="old-admin-pw" class="admin-input"></div>
                <div class="admin-form-group"><label style="font-size:13px;">Yeni Şifre</label><input type="password" id="new-admin-pw" class="admin-input"></div>
                <button class="admin-btn btn-success" style="padding:12px 24px;width:100%;" onclick="ADMIN.changeAdminPw()">Şifreyi Güncelle 🔒</button>

                <hr style="margin:30px 0;border-color:#F4F7FE;">

                <div class="admin-form-group"><label>🎨 Panel Teması</label></div>
                <div style="display:flex;gap:10px;">
                    <button class="admin-btn btn-edit" onclick="ADMIN.setAdminTheme('light')">☀️ Açık</button>
                    <button class="admin-btn btn-edit" onclick="ADMIN.setAdminTheme('dark')">🌙 Koyu</button>
                </div>
            </div>
        `;
    }

    async function changeAdminPw() {
        const oldPw = document.getElementById('old-admin-pw').value;
        const newPw = document.getElementById('new-admin-pw').value;
        if (!oldPw || !newPw) { alert('Lütfen iki alanı da doldurun.'); return; }
        try {
            const adminUsers = usersData.filter(u => u.role === 'admin' || u.role === 'ogretmen');
            if (adminUsers.length === 0) { alert('Admin bulunamadı.'); return; }

            const doc = await DB.get('users/' + adminUsers[0].username);
            if (doc && doc.password === oldPw) {
                for (const admin of adminUsers) {
                    await DB.update('users/' + admin.username, { password: newPw });
                }
                alert('Şifre değiştirildi! ✅');
            } else {
                alert('Eski şifre hatalı.');
            }
        } catch (e) { alert('Firebase hatası: ' + e.message); }
    }

    function setAdminTheme(theme) {
        const layout = document.querySelector('.admin-layout');
        if (!layout) return;
        if (theme === 'dark') {
            layout.style.background = '#0B1437';
            layout.querySelectorAll('.admin-content').forEach(el => el.style.background = '#111C44');
            layout.querySelectorAll('.admin-header').forEach(el => { el.style.background = '#0B1437'; el.style.color = '#fff'; });
            layout.querySelectorAll('.admin-header h1').forEach(el => el.style.color = '#fff');
            layout.querySelectorAll('.admin-body').forEach(el => el.style.color = '#fff');
        } else {
            layout.style.background = '#F4F7FE';
            layout.querySelectorAll('.admin-content').forEach(el => el.style.background = '');
            layout.querySelectorAll('.admin-header').forEach(el => { el.style.background = ''; el.style.color = ''; });
            layout.querySelectorAll('.admin-header h1').forEach(el => el.style.color = '');
        }
        localStorage.setItem('admin_theme', theme);
    }

    // ===== HELPERS =====
    function calcAccuracy(d) {
        if (!d.stats) return 0;
        let c = 0, t = 0;
        Object.values(d.stats).forEach(s => { c += s.totalCorrect || 0; t += s.totalAttempted || 0; });
        return t === 0 ? 0 : Math.round((c / t) * 100);
    }

    function openModal(id) {
        const m = document.getElementById(id);
        if (m) { m.style.opacity = '1'; m.style.pointerEvents = 'auto'; }
    }

    function closeModal(id) {
        const m = document.getElementById(id);
        if (m) { m.style.opacity = '0'; m.style.pointerEvents = 'none'; }
    }

    // ===== STUDENT INBOX CHECK =====
    function checkInboxForStudent() {
        const username = sessionStorage.getItem('currentUser');
        if (!username) return;
        if (sessionStorage.getItem('isTeacher') === 'true') return;

        const dataStr = localStorage.getItem('ramazan_hoca_' + username);
        if (dataStr) {
            let data = JSON.parse(dataStr);
            if (data.inbox && data.inbox.length > 0) {
                const unread = data.inbox.filter(m => !m.read);
                if (unread.length > 0) {
                    showStudentMessage(unread[0], data, username);
                }
            }
        }
    }

    function showStudentMessage(msg, data, username) {
        if (document.querySelector('.student-msg-overlay')) return;
        if (typeof AUDIO !== 'undefined') {
            if (AUDIO.playNotification) AUDIO.playNotification();
            else AUDIO.playSuccess();
        }

        const date = msg.date ? new Date(msg.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

        const overlay = document.createElement('div');
        overlay.className = 'student-msg-overlay';
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);backdrop-filter:blur(10px);z-index:10000;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.3s;';
        overlay.innerHTML = `
            <div style="background:var(--bg-card);border-radius:24px;padding:30px;width:90%;max-width:450px;text-align:center;box-shadow:0 20px 50px rgba(0,0,0,0.5);transform:translateY(20px) scale(0.95);transition:all 0.4s cubic-bezier(0.175,0.885,0.32,1.275);">
                <div style="font-size:50px;margin-bottom:10px;">📩</div>
                <h3 style="color:var(--text-primary);font-size:20px;margin-bottom:5px;font-weight:800;">${msg.title}</h3>
                <div style="font-size:12px;color:var(--text-muted);margin-bottom:20px;">Gönderen: ${msg.sender}</div>
                <div style="background:rgba(117,81,255,0.05);padding:20px;border-radius:15px;text-align:left;color:var(--text-primary);font-weight:500;line-height:1.6;font-size:14px;margin-bottom:25px;border-left:4px solid #7551FF;position:relative;">
                    <div style="min-height:40px; margin-bottom:15px;">
                        ${msg.body.replace(/\n/g, '<br>')}
                    </div>
                    <div style="text-align:right; font-size:10px; color:var(--text-muted); font-weight:700; opacity:0.8;">
                        ⏱️ ${date}
                    </div>
                </div>
                <button class="btn" style="width:100%;background:#7551FF;color:white;padding:14px;font-weight:800;border-radius:12px;border:none;cursor:pointer;box-shadow:0 4px 15px rgba(117,81,255,0.4);" onclick="this.closest('.student-msg-overlay').style.opacity='0'; setTimeout(()=>this.closest('.student-msg-overlay').remove(),300)">Anladım, Kapat</button>
            </div>
        `;
        document.body.appendChild(overlay);
        setTimeout(() => {
            overlay.style.opacity = '1';
            overlay.children[0].style.transform = 'translateY(0) scale(1)';
        }, 10);
        
        msg.read = true;
        localStorage.setItem('ramazan_hoca_' + username, JSON.stringify(data));
    }

    return {
        fetchAllUsers, getUsersData, switchTab, renderCurrentTab,
        showAddUserModal, addUser, editUser, saveEditUser, showPassword,
        toggleBan, deleteUser, viewUserDetails,
        onMsgTypeChange, sendMessage, deleteMessage,
        editTable, addElement, removeElement, saveTable,
        changeAdminPw, setAdminTheme,
        openModal, closeModal,
        checkInboxForStudent
    };
})();
