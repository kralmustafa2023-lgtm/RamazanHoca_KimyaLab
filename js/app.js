// ============================================
// APP.JS — Main Application Logic
// Ramazan Hoca'nın Kimya Sınıfı
// ============================================

const APP = (() => {
    let currentScreen = 'login';
    let selectedMode = null;
    let selectedDifficulty = null;
    let selectedTable = null;

    function init() {
        const savedTheme = localStorage.getItem('kimyalab_theme');
        if (savedTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        }

        if (AUTH.isLoggedIn()) {
            navigate('dashboard');
        } else {
            navigate('login');
        }
    }

    function navigate(screen, data) {
        if (typeof AUDIO !== 'undefined' && screen !== currentScreen) AUDIO.playClick();
        
        const container = document.getElementById('main-content');
        const sidebar = document.getElementById('sidebar');
        
        Animations.pageTransition(container, () => {
            currentScreen = screen;
            
            // Show/hide sidebar
            if (screen === 'login') {
                document.body.classList.remove('has-sidebar');
                if (sidebar) sidebar.style.display = 'none';
            } else {
                document.body.classList.add('has-sidebar');
                if (sidebar) sidebar.style.display = '';
                renderSidebar();
                renderBottomNav();
            }

            switch (screen) {
                case 'login': renderLogin(); break;
                case 'dashboard': renderDashboard(); break;
                case 'tables': renderTables(); break;
                case 'modeSelect': renderModeSelect(); break;
                case 'difficultySelect': renderDifficultySelect(data); break;
                case 'tableSelect': renderTableSelect(data); break;
                case 'statistics': renderStatistics(); break;
                case 'badges': renderBadges(); break;
            }
        });
    }

    // ============ LOGIN SCREEN ============
    function renderLogin() {
        const container = document.getElementById('main-content');
        container.innerHTML = `
            <div class="login-screen">
                <div class="login-left">
                    <div class="login-form-container">
                        <div class="login-logo">
                            <img src="images/logo.png" alt="NSBL Logo" class="logo-image">
                            <h1 class="login-title">Ramazan Hoca'nın<br>KimyaLab</h1>
                            <p class="login-subtitle">Kimyayı Fethedelim! ⚗️</p>
                        </div>

                        <form class="login-form" onsubmit="APP.handleLogin(event)">
                            <div class="input-group">
                                <span class="input-icon">✏️</span>
                                <input type="text" id="login-displayname" placeholder="Adınızı girin (örn: Ahmet)" 
                                       class="input-field" autocomplete="off" oninput="APP.updatePreview()">
                            </div>
                            <div class="input-group">
                                <span class="input-icon">👤</span>
                                <input type="text" id="login-username" placeholder="Kullanıcı adı" 
                                       class="input-field" autocomplete="off">
                            </div>
                            <div class="input-group">
                                <span class="input-icon">🔒</span>
                                <input type="password" id="login-password" placeholder="Şifre" 
                                       class="input-field" autocomplete="off">
                                <button type="button" class="password-toggle" onclick="APP.togglePassword()">👁️</button>
                            </div>
                            <div id="login-error" class="login-error"></div>
                            <button type="submit" class="btn btn-primary btn-lg btn-login">
                                Giriş Yap 🚀
                            </button>
                        </form>

                        <div class="login-footer">
                            <p>Nizip Sosyal Bilimler Lisesi 🏫</p>
                        </div>
                    </div>
                </div>
                <div class="login-right">
                    <div class="login-preview">
                        <div class="preview-molecules">
                            <div class="molecule molecule-1">⚗️</div>
                            <div class="molecule molecule-2">🧪</div>
                            <div class="molecule molecule-3">🔬</div>
                            <div class="molecule molecule-4">⚡</div>
                            <div class="molecule molecule-5">🧫</div>
                        </div>
                        <div class="preview-card">
                            <img src="images/logo.png" alt="Logo" class="preview-logo-img">
                            <div class="preview-greeting" id="preview-greeting">
                                Hoş geldin! 🧪
                            </div>
                            <div class="preview-subtitle">Ramazan Hoca'nın öğrencisi</div>
                            <div class="preview-stats">
                                <div class="preview-stat">
                                    <span>🎮</span> 4 Mod
                                </div>
                                <div class="preview-stat">
                                    <span>📊</span> 600+ Soru
                                </div>
                                <div class="preview-stat">
                                    <span>🏆</span> 8 Rozet
                                </div>
                            </div>
                        </div>
                        <div class="preview-elements">
                            <span class="floating-element el-1">Na</span>
                            <span class="floating-element el-2">Fe</span>
                            <span class="floating-element el-3">Ca</span>
                            <span class="floating-element el-4">O₂</span>
                            <span class="floating-element el-5">H₂O</span>
                            <span class="floating-element el-6">Cl</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        Animations.initRipples();
        const formElements = container.querySelectorAll('.input-group, .btn-login, .login-logo');
        Animations.staggeredEntrance(Array.from(formElements), 120);
    }

    function updatePreview() {
        const inputEl = document.getElementById('login-displayname');
        const customName = inputEl ? inputEl.value : '';
        const preview = document.getElementById('preview-greeting');
        if (preview) {
            if (customName.trim()) {
                preview.textContent = `Hoş geldin ${customName.trim()}! 🧪`;
            } else {
                preview.textContent = 'Hoş geldin! 🧪';
            }
        }
    }

    function togglePassword() {
        const pwd = document.getElementById('login-password');
        if (pwd.type === 'password') {
            pwd.type = 'text';
        } else {
            pwd.type = 'password';
        }
    }

    function handleLogin(event) {
        event.preventDefault();
        const displayName = document.getElementById('login-displayname').value.trim();
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value.trim();
        const errorEl = document.getElementById('login-error');

        if (!username || !password) {
            errorEl.textContent = 'Lütfen kullanıcı adı ve şifre giriniz!';
            Animations.shake(document.querySelector('.login-form'));
            return;
        }

        if (!displayName) {
            errorEl.textContent = 'Lütfen adınızı girin!';
            Animations.shake(document.querySelector('.login-form'));
            return;
        }

        const result = AUTH.login(username, password, displayName);
        if (result.success) {
            navigate('dashboard');
        } else {
            errorEl.textContent = result.message;
            Animations.shake(document.querySelector('.login-form'));
        }
    }

    // ============ SIDEBAR ============
    function renderSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) return;
        
        const username = AUTH.getCurrentUser();
        const data = Storage.getData(username);
        const level = getLevel(data.totalPoints);

        sidebar.innerHTML = `
            <div class="sidebar-content">
                <div class="sidebar-logo">
                    <img src="images/logo.png" alt="NSBL" class="sidebar-logo-img">
                    <span class="sidebar-logo-text">KimyaLab</span>
                </div>
                
                <div class="sidebar-user">
                    <div class="user-avatar">${level.icon}</div>
                    <div class="user-info">
                        <span class="user-name">${AUTH.getDisplayName(username)}</span>
                        <span class="user-level">${level.name}</span>
                    </div>
                </div>

                <nav class="sidebar-nav">
                    <div class="nav-section-title">ANA MENÜ</div>
                    <a class="nav-item ${currentScreen === 'dashboard' ? 'active' : ''}" onclick="APP.navigate('dashboard')">
                        <span class="nav-icon">🏠</span>
                        <span class="nav-text">Ana Sayfa</span>
                    </a>
                    <a class="nav-item ${currentScreen === 'modeSelect' ? 'active' : ''}" onclick="APP.navigate('modeSelect')">
                        <span class="nav-icon">🎮</span>
                        <span class="nav-text">Oyun Modları</span>
                    </a>
                    <a class="nav-item ${currentScreen === 'tables' ? 'active' : ''}" onclick="APP.navigate('tables')">
                        <span class="nav-icon">📖</span>
                        <span class="nav-text">Tablolar</span>
                    </a>
                    
                    <div class="nav-section-title">İSTATİSTİKLER</div>
                    <a class="nav-item ${currentScreen === 'statistics' ? 'active' : ''}" onclick="APP.navigate('statistics')">
                        <span class="nav-icon">📊</span>
                        <span class="nav-text">İstatistikler</span>
                    </a>
                    <a class="nav-item ${currentScreen === 'badges' ? 'active' : ''}" onclick="APP.navigate('badges')">
                        <span class="nav-icon">🏆</span>
                        <span class="nav-text">Rozetler</span>
                    </a>
                </nav>

                <div class="sidebar-footer">
                    <div class="level-progress-mini">
                        <div class="level-bar-mini">
                            <div class="level-fill-mini" style="width: ${getLevelProgress(data.totalPoints)}%"></div>
                        </div>
                        <span class="level-points-mini">${data.totalPoints} puan</span>
                    </div>
                    <div class="settings-row" style="display:flex;gap:10px;margin-top:15px;margin-bottom:15px;">
                        <button class="btn btn-primary" style="flex:1;padding:8px;font-size:12px;" onclick="APP.toggleTheme()">🌓 Tema</button>
                        <button class="btn btn-primary" style="flex:1;padding:8px;font-size:12px;" onclick="APP.toggleAudio()" id="btn-audio-sidebar">🔊 Ses ${typeof AUDIO !== 'undefined' && AUDIO.isEnabled() ? 'AÇIK' : 'KAPALI'}</button>
                    </div>
                    <a class="nav-item nav-logout" onclick="AUTH.logout()">
                        <span class="nav-icon">🚪</span>
                        <span class="nav-text">Çıkış Yap</span>
                    </a>
                </div>
            </div>
        `;
    }

    function renderBottomNav() {
        let bottomNav = document.getElementById('bottom-nav');
        if (!bottomNav) {
            bottomNav = document.createElement('div');
            bottomNav.id = 'bottom-nav';
            bottomNav.className = 'bottom-nav';
            document.body.appendChild(bottomNav);
        }

        bottomNav.innerHTML = `
            <a class="bottom-nav-item ${currentScreen === 'dashboard' ? 'active' : ''}" onclick="APP.navigate('dashboard')">
                <span class="bottom-nav-icon">🏠</span>
                <span class="bottom-nav-text">Ana Sayfa</span>
            </a>
            <a class="bottom-nav-item ${currentScreen === 'modeSelect' ? 'active' : ''}" onclick="APP.navigate('modeSelect')">
                <span class="bottom-nav-icon">🎮</span>
                <span class="bottom-nav-text">Oyna</span>
            </a>
            <a class="bottom-nav-item ${currentScreen === 'tables' ? 'active' : ''}" onclick="APP.navigate('tables')">
                <span class="bottom-nav-icon">📖</span>
                <span class="bottom-nav-text">Tablolar</span>
            </a>
            <a class="bottom-nav-item ${currentScreen === 'statistics' ? 'active' : ''}" onclick="APP.navigate('statistics')">
                <span class="bottom-nav-icon">📊</span>
                <span class="bottom-nav-text">İstatistik</span>
            </a>
            <a class="bottom-nav-item ${currentScreen === 'badges' ? 'active' : ''}" onclick="APP.navigate('badges')">
                <span class="bottom-nav-icon">🏆</span>
                <span class="bottom-nav-text">Rozetler</span>
            </a>
        `;

        if (currentScreen === 'login') {
            bottomNav.style.display = 'none';
        } else {
            bottomNav.style.display = '';
        }
    }

    // ============ DASHBOARD ============
    function renderDashboard() {
        const container = document.getElementById('main-content');
        const username = AUTH.getCurrentUser();
        const data = Storage.getData(username);
        const displayName = AUTH.getDisplayName(username);
        const level = getLevel(data.totalPoints);
        const accuracy = Storage.getOverallAccuracy(username);

        // Random motivation
        const motiv = MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];
        const motivText = motiv.text.replace('{name}', displayName);

        // Daily goal
        const today = new Date().toDateString();
        const dailyCards = data.dailyGoalDate === today ? data.dailyCardsFlipped : 0;
        const dailyGoal = 10;
        const dailyProgress = Math.min(100, Math.round((dailyCards / dailyGoal) * 100));

        container.innerHTML = `
            <div class="dashboard-screen">
                <div class="dashboard-topbar">
                    <div class="topbar-greeting">
                        <h2>Hoş geldin ${displayName}! 🧪</h2>
                        <p class="topbar-subtitle">Ramazan Hoca'nın öğrencisi ${displayName}</p>
                    </div>
                    <div class="topbar-badge">
                        <span class="level-icon">${level.icon}</span>
                        <span class="level-name">${level.name}</span>
                        <span class="total-points">${data.totalPoints} ⭐</span>
                    </div>
                </div>

                <div class="dashboard-grid">
                    <!-- Motivation Card -->
                    <div class="dash-card motivation-card">
                        <div class="motivation-content">
                            <span class="motivation-icon">💬</span>
                            <p class="motivation-text">${motivText}</p>
                            <span class="motivation-author">— Ramazan Hoca</span>
                        </div>
                    </div>

                    <!-- Daily Goal Card -->
                    <div class="dash-card daily-goal-card">
                        <h3 class="card-title">📎 Günlük Hedef</h3>
                        <p class="goal-text">Bugün ${dailyGoal} kart çevir</p>
                        <div class="goal-progress">
                            <div class="goal-bar">
                                <div class="goal-fill" style="width: ${dailyProgress}%"></div>
                            </div>
                            <span class="goal-count">${dailyCards}/${dailyGoal}</span>
                        </div>
                        ${dailyProgress >= 100 ? '<div class="goal-badge">✅ Tamamlandı!</div>' : ''}
                    </div>

                    <!-- Mode Cards -->
                    <div class="dash-section">
                        <h3 class="section-title">🎮 Oyun Modları</h3>
                        <div class="mode-cards-grid">
                            <div class="mode-card mode-flashcard" onclick="APP.navigate('difficultySelect', {mode: 'flashcard'})">
                                <div class="mode-icon">🃏</div>
                                <h4 class="mode-name">Flashcard</h4>
                                <p class="mode-desc">Kartları çevirerek öğren</p>
                                <div class="mode-best">En iyi: ${data.stats.flashcard.bestScore}</div>
                                <button class="btn btn-mode">Oyna →</button>
                            </div>
                            <div class="mode-card mode-fill" onclick="APP.navigate('difficultySelect', {mode: 'fillTable'})">
                                <div class="mode-icon">📝</div>
                                <h4 class="mode-name">Boş Tablo Doldur</h4>
                                <p class="mode-desc">Tabloyu tamamla</p>
                                <div class="mode-best">En iyi: ${data.stats.fillTable.bestScore}</div>
                                <button class="btn btn-mode">Oyna →</button>
                            </div>
                            <div class="mode-card mode-matching" onclick="APP.navigate('difficultySelect', {mode: 'matching'})">
                                <div class="mode-icon">🔗</div>
                                <h4 class="mode-name">Eşleştirme</h4>
                                <p class="mode-desc">Doğru eşleri bul</p>
                                <div class="mode-best">En iyi: ${data.stats.matching.bestScore}</div>
                                <button class="btn btn-mode">Oyna →</button>
                            </div>
                            <div class="mode-card mode-quiz" onclick="APP.navigate('difficultySelect', {mode: 'quiz'})">
                                <div class="mode-icon">🧪</div>
                                <h4 class="mode-name">Quiz</h4>
                                <p class="mode-desc">Bilgini test et</p>
                                <div class="mode-best">En iyi: ${data.stats.quiz.bestScore}</div>
                                <button class="btn btn-mode">Oyna →</button>
                            </div>
                        </div>
                    </div>

                    <!-- Progress Section -->
                    <div class="dash-card progress-card">
                        <h3 class="card-title">📈 Tablo İlerlemen</h3>
                        <div class="progress-items">
                            ${Object.keys(TABLES).map(key => `
                                <div class="progress-item">
                                    <div class="progress-info">
                                        <span>${TABLES[key].icon} ${TABLES[key].name}</span>
                                        <span class="progress-percent">${data.progress[key]}%</span>
                                    </div>
                                    <div class="progress-bar-sm">
                                        <div class="progress-fill-sm" style="width: ${data.progress[key]}%; background: ${TABLES[key].color}"></div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Quick Stats -->
                    <div class="dash-card stats-quick-card">
                        <h3 class="card-title">⚡ Hızlı İstatistikler</h3>
                        <div class="quick-stats-grid">
                            <div class="quick-stat">
                                <span class="stat-emoji">⏱️</span>
                                <span class="stat-number">${Storage.formatStudyTime(data.studyTime)}</span>
                                <span class="stat-label">Çalışma Süresi</span>
                            </div>
                            <div class="quick-stat">
                                <span class="stat-emoji">🎮</span>
                                <span class="stat-number">${data.gamesPlayed}</span>
                                <span class="stat-label">Oyun Sayısı</span>
                            </div>
                            <div class="quick-stat">
                                <span class="stat-emoji">🎯</span>
                                <span class="stat-number">${accuracy}%</span>
                                <span class="stat-label">Doğruluk</span>
                            </div>
                            <div class="quick-stat">
                                <span class="stat-emoji">🔥</span>
                                <span class="stat-number">${data.streak}</span>
                                <span class="stat-label">Gün Serisi</span>
                            </div>
                        </div>
                    </div>

                    <!-- Badges Preview -->
                    <div class="dash-card badges-preview-card">
                        <div class="card-header-row">
                            <h3 class="card-title">🎖️ Rozetlerin</h3>
                            <button class="btn btn-ghost btn-sm" onclick="APP.navigate('badges')">Tümünü Gör →</button>
                        </div>
                        <div class="badges-preview-grid">
                            ${BADGES.slice(0, 4).map(badge => `
                                <div class="badge-mini ${data.badges.includes(badge.id) ? 'earned' : 'locked'}">
                                    <span class="badge-icon">${badge.icon}</span>
                                    <span class="badge-name">${badge.name}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Navigation Buttons -->
                    <div class="dash-nav-buttons">
                        <button class="btn btn-outline btn-lg" onclick="APP.navigate('tables')">
                            📖 Tablolara Bak
                        </button>
                        <button class="btn btn-outline btn-lg" onclick="APP.navigate('statistics')">
                            📊 İstatistikler
                        </button>
                        <button class="btn btn-outline btn-lg" onclick="APP.navigate('badges')">
                            🏆 Rozetler
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Animate everything
        const cards = container.querySelectorAll('.dash-card, .mode-card, .quick-stat, .badge-mini');
        Animations.staggeredEntrance(Array.from(cards), 80);
        Animations.initRipples();
    }

    // ============ TABLES SCREEN ============
    function renderTables() {
        const container = document.getElementById('main-content');
        const tabs = Object.keys(TABLES);
        
        container.innerHTML = `
            <div class="tables-screen">
                <div class="screen-header">
                    <h2 class="screen-title">📖 Tablolar</h2>
                    <div class="search-container">
                        <span class="search-icon">🔍</span>
                        <input type="text" id="table-search" class="search-input" 
                               placeholder="Element ara..." oninput="APP.searchTable()">
                    </div>
                </div>

                <div class="tabs-container">
                    ${tabs.map((key, idx) => `
                        <button class="tab-btn ${idx === 0 ? 'active' : ''}" onclick="APP.switchTab('${key}', this)">
                            ${TABLES[key].icon} ${TABLES[key].name}
                        </button>
                    `).join('')}
                </div>

                <div class="table-content" id="table-content">
                    ${renderTableContent(tabs[0])}
                </div>
            </div>
        `;

        Animations.initRipples();
        const rows = container.querySelectorAll('.table-row');
        Animations.staggeredEntrance(Array.from(rows), 40);
    }

    function renderTableContent(tableKey) {
        const table = TABLES[tableKey];
        const isMetal = tableKey === 'metaller';
        const isElement = tableKey === 'ilk20';

        return `
            <div class="data-table">
                ${table.items.map((item, idx) => `
                    <div class="table-row" onclick="APP.showElementBio(${JSON.stringify(item).replace(/"/g, '&quot;')})">
                        <div class="row-number">${idx + 1}</div>
                        <div class="row-symbol" style="border-color: ${table.color}">
                            ${item.symbol}
                        </div>
                        <div class="row-name">${item.name}</div>
                        ${isMetal ? `<div class="row-charges">${item.charges.join(', ')}</div>` : ''}
                        ${isElement ? `<div class="row-number-badge">#${item.number}</div>` : ''}
                        ${!isMetal && !isElement ? `<div class="row-charge">${item.charge}</div>` : ''}
                        <button class="btn btn-ghost btn-sm btn-speak" onclick="event.stopPropagation(); APP.speak('${item.name}')">
                            🔊
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    }

    function switchTab(key, btn) {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const content = document.getElementById('table-content');
        content.innerHTML = renderTableContent(key);
        
        const rows = content.querySelectorAll('.table-row');
        Animations.staggeredEntrance(Array.from(rows), 40);
    }

    function searchTable() {
        const query = document.getElementById('table-search').value.toLowerCase().trim();
        const rows = document.querySelectorAll('.table-row');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(query) ? '' : 'none';
        });
    }

    function showElementBio(item) {
        const overlay = document.createElement('div');
        overlay.className = 'element-bio-overlay';
        overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
        
        overlay.innerHTML = `
            <div class="element-bio-card">
                <button class="bio-close" onclick="this.closest('.element-bio-overlay').remove()">✕</button>
                <div class="bio-symbol">${item.symbol}</div>
                <h3 class="bio-name">${item.name}</h3>
                ${item.number ? `<div class="bio-detail">Atom No: ${item.number}</div>` : ''}
                ${item.charge ? `<div class="bio-detail">Yük: ${item.charge}</div>` : ''}
                ${item.charges ? `<div class="bio-detail">Yükler: ${item.charges.join(', ')}</div>` : ''}
                <p class="bio-text">${item.bio}</p>
                <button class="btn btn-primary btn-sm" onclick="APP.speak('${item.name}. ${item.bio.replace(/'/g, "")}')">
                    🔊 Sesli Dinle
                </button>
            </div>
        `;
        
        document.body.appendChild(overlay);
    }

    function speak(text) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'tr-TR';
            utterance.rate = 0.9;
            speechSynthesis.speak(utterance);
        }
    }

    // ============ MODE SELECT ============
    function renderModeSelect() {
        const container = document.getElementById('main-content');
        const username = AUTH.getCurrentUser();
        const data = Storage.getData(username);

        container.innerHTML = `
            <div class="mode-select-screen">
                <div class="screen-header">
                    <h2 class="screen-title">🎮 Oyun Modunu Seç</h2>
                    <p class="screen-subtitle">Hangi modda pratik yapmak istersin?</p>
                </div>

                <div class="mode-select-grid">
                    <div class="mode-select-card card-flashcard" onclick="APP.navigate('difficultySelect', {mode: 'flashcard'})">
                        <div class="mode-select-icon">🃏</div>
                        <h3 class="mode-select-name">Flashcard</h3>
                        <p class="mode-select-desc">Kartları çevirerek elementleri öğren. Sembol ve isimleri eşleştir.</p>
                        <div class="mode-select-best">🏅 En iyi: ${data.stats.flashcard.bestScore}</div>
                        <button class="btn btn-mode-select">Oyna →</button>
                    </div>
                    <div class="mode-select-card card-fill" onclick="APP.navigate('difficultySelect', {mode: 'fillTable'})">
                        <div class="mode-select-icon">📝</div>
                        <h3 class="mode-select-name">Boş Tablo Doldur</h3>
                        <p class="mode-select-desc">Tablodaki boş hücreleri doldurarak hafızanı test et.</p>
                        <div class="mode-select-best">🏅 En iyi: ${data.stats.fillTable.bestScore}</div>
                        <button class="btn btn-mode-select">Oyna →</button>
                    </div>
                    <div class="mode-select-card card-matching" onclick="APP.navigate('difficultySelect', {mode: 'matching'})">
                        <div class="mode-select-icon">🔗</div>
                        <h3 class="mode-select-name">Eşleştirme</h3>
                        <p class="mode-select-desc">Sembolleri doğru isimlerle eşleştir. Sürükle ve bırak!</p>
                        <div class="mode-select-best">🏅 En iyi: ${data.stats.matching.bestScore}</div>
                        <button class="btn btn-mode-select">Oyna →</button>
                    </div>
                    <div class="mode-select-card card-quiz" onclick="APP.navigate('difficultySelect', {mode: 'quiz'})">
                        <div class="mode-select-icon">🧪</div>
                        <h3 class="mode-select-name">Quiz</h3>
                        <p class="mode-select-desc">150 sorudan oluşan test bankasıyla kendini sına!</p>
                        <div class="mode-select-best">🏅 En iyi: ${data.stats.quiz.bestScore}</div>
                        <button class="btn btn-mode-select">Oyna →</button>
                    </div>
                </div>
            </div>
        `;

        const cards = container.querySelectorAll('.mode-select-card');
        Animations.staggeredEntrance(Array.from(cards), 120);
        Animations.initRipples();
    }

    // ============ DIFFICULTY SELECT ============
    function renderDifficultySelect(data) {
        selectedMode = (data && data.mode) || selectedMode;
        const container = document.getElementById('main-content');

        container.innerHTML = `
            <div class="difficulty-screen">
                <div class="screen-header">
                    <button class="btn btn-ghost" onclick="APP.navigate('modeSelect')">← Geri</button>
                    <h2 class="screen-title">⚡ Zorluk Seç</h2>
                </div>

                <div class="difficulty-grid">
                    <div class="difficulty-card diff-easy" onclick="APP.selectDifficulty('kolay')">
                        <div class="diff-emoji">🟢</div>
                        <h3 class="diff-name">Kolay</h3>
                        <ul class="diff-features">
                            <li>Az soru sayısı</li>
                            <li>Süre yok</li>
                            <li>Tek tablo</li>
                        </ul>
                        <button class="btn btn-difficulty">Seç →</button>
                    </div>
                    <div class="difficulty-card diff-medium" onclick="APP.selectDifficulty('orta')">
                        <div class="diff-emoji">🟡</div>
                        <h3 class="diff-name">Orta</h3>
                        <ul class="diff-features">
                            <li>Daha fazla soru</li>
                            <li>Süre var</li>
                            <li>Tek tablo</li>
                        </ul>
                        <div class="diff-recommended">⭐ Önerilen</div>
                        <button class="btn btn-difficulty">Seç →</button>
                    </div>
                    <div class="difficulty-card diff-hard" onclick="APP.selectDifficulty('zor')">
                        <div class="diff-emoji">🔴</div>
                        <h3 class="diff-name">Zor</h3>
                        <ul class="diff-features">
                            <li>Tüm sorular</li>
                            <li>Kısa süre</li>
                            <li>Karışık tablolar</li>
                        </ul>
                        <button class="btn btn-difficulty">Seç →</button>
                    </div>
                </div>
            </div>
        `;

        const cards = container.querySelectorAll('.difficulty-card');
        Animations.staggeredEntrance(Array.from(cards), 150);
        Animations.initRipples();
    }

    function selectDifficulty(diff) {
        selectedDifficulty = diff;
        navigate('tableSelect', { mode: selectedMode, difficulty: diff });
    }

    // ============ TABLE SELECT ============
    function renderTableSelect(data) {
        if (data) {
            selectedMode = data.mode || selectedMode;
            selectedDifficulty = data.difficulty || selectedDifficulty;
        }
        const container = document.getElementById('main-content');

        container.innerHTML = `
            <div class="table-select-screen">
                <div class="screen-header">
                    <button class="btn btn-ghost" onclick="APP.navigate('difficultySelect', {mode: '${selectedMode}'})">← Geri</button>
                    <h2 class="screen-title">📋 Tablo Seç</h2>
                </div>

                <div class="table-select-grid">
                    ${Object.keys(TABLES).map(key => `
                        <div class="table-select-card" style="--card-color: ${TABLES[key].color}" 
                             onclick="APP.startGame('${key}')">
                            <div class="table-select-icon">${TABLES[key].icon}</div>
                            <h3 class="table-select-name">${TABLES[key].name}</h3>
                            <p class="table-select-subtitle">${TABLES[key].subtitle}</p>
                            <div class="table-select-count">${TABLES[key].items.length} element</div>
                            <button class="btn btn-table-select">Başla →</button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        const cards = container.querySelectorAll('.table-select-card');
        Animations.staggeredEntrance(Array.from(cards), 120);
        Animations.initRipples();
    }

    function startGame(table) {
        selectedTable = table;
        switch (selectedMode) {
            case 'flashcard':
                Game.startFlashcard(table, selectedDifficulty);
                break;
            case 'quiz':
                Game.startQuiz(table, selectedDifficulty);
                break;
            case 'fillTable':
                Game.startFillTable(table, selectedDifficulty);
                break;
            case 'matching':
                Game.startMatching(table, selectedDifficulty);
                break;
        }
    }

    // ============ STATISTICS ============
    function renderStatistics() {
        const container = document.getElementById('main-content');
        const username = AUTH.getCurrentUser();
        const data = Storage.getData(username);
        const displayName = AUTH.getDisplayName(username);
        const accuracy = Storage.getOverallAccuracy(username);
        const missed = Storage.getMostMissedElement(username);
        const weeklyComp = Storage.getWeeklyComparison(username);

        // Best table
        let bestTable = null;
        let bestPct = 0;
        Object.keys(data.progress).forEach(key => {
            if (data.progress[key] > bestPct) {
                bestPct = data.progress[key];
                bestTable = key;
            }
        });

        container.innerHTML = `
            <div class="statistics-screen">
                <div class="screen-header">
                    <h2 class="screen-title">📊 İstatistikler</h2>
                    <p class="screen-subtitle">${displayName} — Performans Özeti</p>
                </div>

                <div class="stats-grid">
                    <div class="stat-card stat-time">
                        <span class="stat-card-icon">⏱️</span>
                        <span class="stat-card-value">${Storage.formatStudyTime(data.studyTime)}</span>
                        <span class="stat-card-label">Toplam Çalışma</span>
                    </div>
                    <div class="stat-card stat-games">
                        <span class="stat-card-icon">🎮</span>
                        <span class="stat-card-value">${data.gamesPlayed}</span>
                        <span class="stat-card-label">Oyun Sayısı</span>
                    </div>
                    <div class="stat-card stat-accuracy">
                        <span class="stat-card-icon">🎯</span>
                        <span class="stat-card-value">${accuracy}%</span>
                        <span class="stat-card-label">Genel Doğruluk</span>
                    </div>
                    <div class="stat-card stat-streak">
                        <span class="stat-card-icon">🔥</span>
                        <span class="stat-card-value">${data.streak}</span>
                        <span class="stat-card-label">Gün Serisi</span>
                    </div>
                </div>

                <div class="stats-section">
                    <h3 class="section-title">📈 Tablo Bazında Doğruluk</h3>
                    <div class="accuracy-bars">
                        ${Object.keys(TABLES).map(key => {
                            const modeStats = data.stats;
                            const pct = data.progress[key];
                            return `
                                <div class="accuracy-bar-item">
                                    <div class="accuracy-info">
                                        <span>${TABLES[key].icon} ${TABLES[key].name}</span>
                                        <span>${pct}%</span>
                                    </div>
                                    <div class="accuracy-bar">
                                        <div class="accuracy-fill" style="width: ${pct}%; background: ${TABLES[key].color}"></div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>

                ${missed ? `
                    <div class="stats-section">
                        <div class="missed-element">
                            <span class="missed-icon">⚠️</span>
                            <div class="missed-info">
                                <h4>En Çok Kaçırılan</h4>
                                <p>${missed.question} → ${missed.correct} (${missed.count} kez)</p>
                            </div>
                        </div>
                    </div>
                ` : ''}

                ${bestTable ? `
                    <div class="stats-section">
                        <div class="best-table">
                            <span class="best-icon">💪</span>
                            <div class="best-info">
                                <h4>En Güçlü Tablonur</h4>
                                <p>${TABLES[bestTable].icon} ${TABLES[bestTable].name} — ${bestPct}%</p>
                            </div>
                        </div>
                    </div>
                ` : ''}

                ${weeklyComp !== null ? `
                    <div class="stats-section weekly-comp">
                        <p class="weekly-text">
                            ${weeklyComp >= 0 ? 
                                `📈 Geçen haftaya göre %${weeklyComp} daha iyisin!` : 
                                `📉 Geçen haftaya göre %${Math.abs(weeklyComp)} düşüş var. Biraz daha çalış!`
                            }
                        </p>
                    </div>
                ` : ''}

                <div class="stats-section">
                    <h3 class="section-title">🎮 Mod Bazında En İyiler</h3>
                    <div class="mode-stats-grid">
                        <div class="mode-stat-card">
                            <span class="mode-stat-icon">🃏</span>
                            <span class="mode-stat-name">Flashcard</span>
                            <span class="mode-stat-value">${data.stats.flashcard.bestScore} puan</span>
                        </div>
                        <div class="mode-stat-card">
                            <span class="mode-stat-icon">🔗</span>
                            <span class="mode-stat-name">Eşleştirme</span>
                            <span class="mode-stat-value">${data.stats.matching.bestTime ? Storage.formatStudyTime(data.stats.matching.bestTime) : '—'}</span>
                        </div>
                        <div class="mode-stat-card">
                            <span class="mode-stat-icon">🧪</span>
                            <span class="mode-stat-name">Quiz</span>
                            <span class="mode-stat-value">${data.stats.quiz.bestScore} puan</span>
                        </div>
                        <div class="mode-stat-card">
                            <span class="mode-stat-icon">📝</span>
                            <span class="mode-stat-name">Tablo Doldur</span>
                            <span class="mode-stat-value">${data.stats.fillTable.bestScore} puan</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const cards = container.querySelectorAll('.stat-card, .accuracy-bar-item, .mode-stat-card');
        Animations.staggeredEntrance(Array.from(cards), 80);
    }

    // ============ BADGES ============
    function renderBadges() {
        const container = document.getElementById('main-content');
        const username = AUTH.getCurrentUser();
        const data = Storage.getData(username);

        container.innerHTML = `
            <div class="badges-screen">
                <div class="screen-header">
                    <h2 class="screen-title">🏆 Rozetler</h2>
                    <p class="screen-subtitle">${data.badges.length} / ${BADGES.length} rozet kazanıldı</p>
                </div>

                <div class="badges-grid">
                    ${BADGES.map(badge => {
                        const earned = data.badges.includes(badge.id);
                        return `
                            <div class="badge-card ${earned ? 'badge-earned' : 'badge-locked'}">
                                <div class="badge-card-icon">${badge.icon}</div>
                                <h4 class="badge-card-name">${badge.name}</h4>
                                <p class="badge-card-desc">${earned ? badge.description : badge.requirement}</p>
                                ${earned ? '<div class="badge-earned-tag">✅ Kazanıldı</div>' : '<div class="badge-locked-tag">🔒 Kilitli</div>'}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;

        const cards = container.querySelectorAll('.badge-card');
        Animations.staggeredEntrance(Array.from(cards), 100);
    }

    function toggleTheme() {
        if (typeof AUDIO !== 'undefined') AUDIO.playClick();
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('kimyalab_theme', next);
    }

    function toggleAudio() {
        if (typeof AUDIO !== 'undefined') {
            const isEnabled = AUDIO.toggleSound();
            const btn = document.getElementById('btn-audio-sidebar');
            if (btn) btn.innerHTML = `🔊 Ses ${isEnabled ? 'AÇIK' : 'KAPALI'}`;
        }
    }

    return {
        init, navigate, handleLogin, updatePreview, togglePassword,
        switchTab, searchTable, showElementBio, speak,
        selectDifficulty, startGame,
        renderSidebar, renderBottomNav,
        toggleTheme, toggleAudio
    };
})();

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => APP.init());
