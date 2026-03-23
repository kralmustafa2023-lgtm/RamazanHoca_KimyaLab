// ============================================
// APP.JS — Main Application Logic
// Ramazan Hoca'nın Kimya Sınıfı
// ============================================

const APP = (() => {
    let currentScreen = 'login';
    let selectedMode = null;
    let selectedDifficulty = null;
    let selectedTable = null;

    function getGoldIcon(size = 18) {
        return `
            <div style="display:inline-flex; align-items:center; justify-content:center; width:${size}px; height:${size}px; background:linear-gradient(135deg, #FFD600, #FFAB00); border:2px solid #E65100; border-radius:50%; box-shadow: 0 2px 4px rgba(0,0,0,0.15); position:relative; overflow:hidden; vertical-align:middle; line-height:1;">
                <div style="position:absolute; top:15%; left:15%; width:25%; height:25%; background:rgba(255,255,255,0.6); border-radius:50%;"></div>
                <span style="color:#BF360C; font-weight:900; font-size:${size*0.65}px; font-family: 'Inter', sans-serif;">$</span>
            </div>
        `;
    }

    function init() {
        // Activate Security Shield
        if (typeof AUTH !== 'undefined' && AUTH.initShield) {
            AUTH.initShield();
        }

        // Global error logging for debugging "invisible" errors
        window.onerror = function(msg, url, line) {
            console.error(`Global Error: ${msg} at ${url}:${line}`);
        };

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
        if (typeof AUDIO !== 'undefined') {
            AUDIO.init();
            if (screen !== currentScreen) AUDIO.playClick();
        }
        
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
                case 'market': renderMarket(); break;
                case 'periodicLab': renderPeriodicLab(); break;
                case 'tournamentSetup': renderTournamentSetup(); break;
                case 'tournamentConfig': renderTournamentConfig(); break;
            }
        });
    }

    // ============ PREMIUM ALERTS ============
    function showDailyChest() {
        const username = AUTH.getCurrentUser();
        const coins = Storage.openDailyChest(username);
        if (coins) {
            if (typeof AUDIO !== 'undefined') AUDIO.playSuccess();
            if (typeof Animations !== 'undefined') Animations.confetti();
            
            showRewardModal(
                "Ganimet Zamanı!",
                "Ramazan Hoca başarılarının devamını diler!",
                coins
            );
        } else {
            showInfoModal("Sandık Kapalı 🔒", "Bugünkü ganimetini zaten topladın. Yeni heyecanlar için yarın tekrar gelmeyi unutma!");
        }
    }

    function showInfoModal(title, text) {
        const existing = document.querySelector('.reward-overlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.className = 'reward-overlay';
        overlay.style.cssText = `
            position: fixed; inset: 0; background: rgba(0,0,0,0.8);
            backdrop-filter: blur(10px); z-index: 10000;
            display: flex; align-items: center; justify-content: center;
            opacity: 0; transition: opacity 0.3s ease;
        `;
        
        overlay.innerHTML = `
            <div style="background: var(--bg-card); width: 320px; border-radius: 28px; padding: 30px; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1); transform: scale(0.9); transition: 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
                <div style="font-size: 50px; margin-bottom: 15px;">⏳</div>
                <h3 style="margin-bottom: 10px; font-weight: 800; color: var(--text-primary);">${title}</h3>
                <p style="font-size: 14px; color: var(--text-muted); line-height: 1.5; margin-bottom: 25px;">${text}</p>
                <button class="btn" style="width: 100%; background: var(--teal); color: white; border: none; padding: 12px; border-radius: 12px; font-weight: 700; cursor: pointer;" onclick="this.closest('.reward-overlay').remove()">Anladım</button>
            </div>
        `;
        document.body.appendChild(overlay);
        setTimeout(() => {
            overlay.style.opacity = '1';
            overlay.children[0].style.transform = 'scale(1)';
        }, 10);
    }

    function showRewardModal(title, subtitle, amount) {
        const existing = document.querySelector('.reward-overlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.className = 'reward-overlay';
        overlay.style.cssText = `
            position: fixed; inset: 0; background: rgba(0,0,0,0.85);
            backdrop-filter: blur(15px); z-index: 10000;
            display: flex; align-items: center; justify-content: center;
            opacity: 0; transition: opacity 0.4s ease;
            perspective: 1000px;
        `;
        
        overlay.innerHTML = `
            <div class="reward-modal" style="
                background: var(--bg-card); 
                max-width: 320px; width: 80%; 
                border-radius: 28px; text-align: center;
                overflow: hidden; box-shadow: 0 40px 100px rgba(0,0,0,0.6);
                transform: rotateX(20deg) scale(0.8) translateY(50px);
                transition: all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.25);
                border: 1px solid rgba(255,255,255,0.15);
                position: relative;
                font-family: 'Poppins', sans-serif;
            ">
                <!-- Premium Header -->
                <div style="background: linear-gradient(135deg, #FFD600, #FF9100); padding: 40px 15px; position: relative; overflow: hidden; border-bottom: 4px solid rgba(0,0,0,0.05);">
                    <div style="position:absolute; top:0; left:-100%; width:60%; height:100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent); transform: skewX(-30deg); animation: premiumShine 2.5s infinite;"></div>
                    
                    <div style="font-size: 80px; filter: drop-shadow(0 15px 20px rgba(0,0,0,0.2)); animation: bounceFloat 3s ease-in-out infinite;">📦</div>
                    <div class="confetti-container" style="position: absolute; inset:0; pointer-events:none; overflow:hidden; opacity:0.8;"></div>
                </div>
                
                <div style="padding: 25px 20px;">
                    <h2 style="font-size: 22px; font-weight: 800; color: var(--text-primary); margin-bottom: 5px;">${title}</h2>
                    <p style="color: var(--text-muted); font-size: 13px; margin-bottom: 20px; line-height: 1.4;">${subtitle}</p>
                    
                    <div style="background: rgba(255, 145, 0, 0.08); border-radius: 20px; padding: 15px; margin-bottom: 25px; border: 2px solid #FF9100; position: relative;">
                        <span style="position: absolute; top: -10px; background: #FF9100; color: white; padding: 2px 10px; border-radius: 6px; font-size: 9px; font-weight: 800; text-transform: uppercase;">Ganimet</span>
                        <div style="display: flex; align-items: center; justify-content: center; gap: 15px;">
                            <span id="reward-amount-count" style="font-size: 48px; font-weight: 900; color: #FF9100; letter-spacing: -1px; text-shadow: 0 4px 10px rgba(0,0,0,0.1);">0</span>
                            <div style="animation: coinVibe 2s ease-in-out infinite;">${getGoldIcon(45)}</div>
                        </div>
                    </div>
                    
                    <button class="btn reward-close-btn" style="width: 100%; padding: 16px; border-radius: 14px; font-size: 15px; font-weight: 800; background: #FF9100; border: none; color: white; box-shadow: 0 8px 20px rgba(255,145,0,0.35); cursor: pointer; transition: 0.3s;">
                        AL VE DEVAM ET 🚀
                    </button>
                </div>
            </div>
            <style>
                @keyframes premiumShine {
                    0% { left: -100%; }
                    25% { left: 150%; }
                    100% { left: 150%; }
                }
                @keyframes bounceFloat {
                    0%, 100% { transform: translateY(0) scale(1.05); }
                    50% { transform: translateY(-12px) scale(0.95); }
                }
                @keyframes coinVibe {
                    0%, 100% { transform: scale(1) rotate(0deg); }
                    50% { transform: scale(1.15) rotate(10deg); filter: drop-shadow(0 10px 20px rgba(255,145,0,0.6)); }
                }
            </style>
        `;
        
        document.body.appendChild(overlay);
        
        const closeBtn = overlay.querySelector('.reward-close-btn');
        closeBtn.onclick = () => {
            if (typeof AUDIO !== 'undefined') AUDIO.playClick();
            overlay.style.opacity = '0';
            overlay.querySelector('.reward-modal').style.transform = 'rotateX(30deg) scale(0.8) translateY(50px)';
            setTimeout(() => {
                overlay.remove();
                APP.navigate('dashboard');
            }, 400);
        };

        setTimeout(() => {
            overlay.style.opacity = '1';
            const modal = overlay.querySelector('.reward-modal');
            modal.style.transform = 'rotateX(0deg) scale(1) translateY(0)';
            
            const counter = overlay.querySelector('#reward-amount-count');
            if (typeof Animations !== 'undefined') {
                Animations.animateCounter(counter, amount, 1500);
                Animations.confetti(overlay.querySelector('.confetti-container'));
            } else {
                counter.textContent = amount;
            }
        }, 50);
    }

    // ============ CUSTOM AVATAR ============
    function customizeAvatar() {
        const username = AUTH.getCurrentUser();
        const data = Storage.getData(username);
        if ((data.coins || 0) < 2000) {
            if (typeof AUDIO !== 'undefined') AUDIO.playWrong();
            alert(`Bu özellik 2000 altın gerektiriyor. Sende ${(data.coins || 0)} altın var.`);
            return;
        }

        const url = prompt("🖼️ Profil resmin için internette bulduğun bir resmin URL'sini (bağlantısını) yapıştır:\nÖrnek: https://i.imgur.com/Gorsel.jpg");
        if (url && url.trim() !== '') {
            data.coins -= 2000;
            const imgTag = `<img src="${url.trim()}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;border:2px solid gold;"> `;
            if (!data.ownedAvatars) data.ownedAvatars = [];
            data.ownedAvatars.push(imgTag);
            data.activeAvatar = imgTag;
            Storage.saveData(username, data);
            
            if (typeof AUDIO !== 'undefined') AUDIO.playSuccess();
            if (typeof Animations !== 'undefined') Animations.confetti();
            alert('✅ Süper! Harika bir profil resmin oldu.');
            renderSidebar();
            navigate('badges'); // refresh page
        }
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
                    <div class="user-avatar" style="width:50px; height:50px; overflow:hidden; display:flex; align-items:center; justify-content:center; background:white; border: 2.5px solid var(--white); box-shadow: 0 4px 12px rgba(0,0,0,0.15); border-radius:50%;">
                        ${data.activeAvatar && data.activeAvatar.includes('<img') ? 
                            data.activeAvatar : 
                            `<img src="images/logo.png" style="width:100%; height:100%; object-fit:cover; image-rendering: -webkit-optimize-contrast;">`
                        }
                    </div>
                    <div class="user-info">
                        <span class="user-name" style="font-size:15px;">${AUTH.getDisplayName(username)}</span>
                        <span class="user-level" style="color:${level.color}; font-weight:700;">${level.name}</span>
                    </div>
                </div>

                <nav class="sidebar-nav">
                    <div class="nav-section-title">ANA MENÜ</div>
                    <a class="nav-item ${currentScreen === 'dashboard' ? 'active' : ''}" style="border: 1px solid var(--teal); background: rgba(0, 191, 165, 0.05); margin-bottom: 6px;" onclick="APP.navigate('dashboard')">
                        <span class="nav-icon">🏠</span>
                        <span class="nav-text" style="color:var(--teal); font-weight:600;">Ana Sayfa</span>
                    </a>
                    
                    <a class="nav-item ${currentScreen === 'modeSelect' ? 'active' : ''}" style="border: 1px solid var(--orange); background: rgba(255, 152, 0, 0.05); margin-bottom: 6px;" onclick="APP.navigate('modeSelect')">
                        <span class="nav-icon">🎮</span>
                        <span class="nav-text" style="color:var(--orange); font-weight:600;">Oyun Modları</span>
                    </a>
                    
                    <a class="nav-item ${currentScreen === 'tournamentSetup' ? 'active' : ''}" style="border: 1px solid #FFD600; background: rgba(255, 214, 0, 0.05); margin-bottom: 6px;" onclick="APP.navigate('tournamentSetup')">
                        <span class="nav-icon">🏆</span>
                        <span class="nav-text" style="color:#FFD600; font-weight:700;">Turnuva</span>
                    </a>
                    
                    <a class="nav-item ${currentScreen === 'tables' ? 'active' : ''}" style="border: 1px solid var(--blue); background: rgba(33, 150, 243, 0.05); margin-bottom: 6px;" onclick="APP.navigate('tables')">
                        <span class="nav-icon">📖</span>
                        <span class="nav-text" style="color:var(--blue); font-weight:600;">Tablolar</span>
                    </a>
                    
                    <a class="nav-item ${currentScreen === 'periodicLab' ? 'active' : ''}" style="border: 1px solid var(--purple); background: rgba(124, 77, 255, 0.05); margin-bottom: 6px;" onclick="APP.navigate('periodicLab')">
                        <span class="nav-icon">🔬</span>
                        <span class="nav-text" style="color:var(--purple); font-weight:600;">P. Tablo Lab.</span>
                    </a>
                    
                    <div class="nav-section-title" style="margin-top: 10px;">İSTATİSTİKLER</div>
                    <a class="nav-item ${currentScreen === 'statistics' ? 'active' : ''}" style="border: 1px solid var(--pink); background: rgba(233, 30, 99, 0.05); margin-bottom: 6px;" onclick="APP.navigate('statistics')">
                        <span class="nav-icon">📊</span>
                        <span class="nav-text" style="color:var(--pink); font-weight:600;">İstatistikler</span>
                    </a>
                    
                    <a class="nav-item ${currentScreen === 'badges' ? 'active' : ''}" style="border: 1px solid var(--teal-dark); background: rgba(0, 137, 123, 0.05); margin-bottom: 6px;" onclick="APP.navigate('badges')">
                        <span class="nav-icon">🎖️</span>
                        <span class="nav-text" style="color:var(--teal-dark); font-weight:600;">Rozetler</span>
                    </a>
                </nav>

                <div class="sidebar-footer">
                    <div class="level-progress-mini">
                        <div class="level-bar-mini">
                            <div class="level-fill-mini" style="width: ${getLevelProgress(data.totalPoints)}%"></div>
                        </div>
                        <span class="level-points-mini" style="display:flex; align-items:center; gap:6px;">
                            ${data.totalPoints} puan - <b style="color:#FFC107; display:flex; align-items:center; gap:4px;">${data.coins || 0} ${getGoldIcon(16)} Altın</b>
                        </span>
                    </div>
                    <div class="settings-row" style="display:flex; flex-direction:column; gap:8px; margin-top:10px; margin-bottom:15px;">
                        <div style="display:flex; gap:10px;">
                            <button class="btn btn-primary" style="flex:1;padding:8px;font-size:12px;" onclick="APP.toggleTheme()">🌓 Tema</button>
                            <button class="btn btn-primary" style="flex:1;padding:8px;font-size:12px;" onclick="APP.toggleAudio()" id="btn-audio-sidebar">🔊 Ses ${typeof AUDIO !== 'undefined' && AUDIO.isEnabled() ? 'AÇIK' : 'KAPALI'}</button>
                        </div>
                        <button class="btn" style="width:100%; padding:6px; font-size:11px; background:rgba(0,0,0,0.1); color:var(--text-muted); border:1px dashed var(--text-muted); border-radius:8px;" onclick="if(typeof AUDIO!=='undefined'){AUDIO.init(); this.textContent='✅ Ses Aktif Edildi'; setTimeout(()=>this.textContent='🔊 Ses Sorununu Gider', 2000);}">🔊 Ses Sorununu Gider</button>
                    </div>
                    <a class="nav-item nav-logout" onclick="AUTH.logout()">
                        <span class="nav-icon">🚪</span>
                        <span class="nav-text">Çıkış Yap</span>
                    </a>
                </div>
            </div>
        `;
    }

    function showSettingsModal() {
        if (typeof AUDIO !== 'undefined') AUDIO.playClick();
        const existing = document.querySelector('.settings-overlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.className = 'settings-overlay';
        overlay.style.cssText = `
            position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px);
            z-index: 10000; display: flex; align-items: center; justify-content: center;
            opacity: 0; transition: opacity 0.3s ease;
        `;
        
        const audioState = (typeof AUDIO !== 'undefined' && AUDIO.isEnabled()) ? 'AÇIK' : 'KAPALI';
        
        overlay.innerHTML = `
            <div style="background: var(--bg-card); padding: 30px 20px; border-radius: 24px; width: 85%; max-width: 320px; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.5); transform: translateY(30px) scale(0.9); transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.25); border: 1px solid rgba(255,255,255,0.08);">
                <div style="font-size: 40px; margin-bottom: 10px;">⚙️</div>
                <h3 style="margin-bottom: 25px; font-weight: 800; color: var(--text-primary); font-family: 'Poppins', sans-serif;">Ayarlar</h3>
                
                <button class="btn" style="width: 100%; margin-bottom: 15px; padding: 14px; border-radius: 12px; font-weight: 700; background: rgba(124, 77, 255, 0.1); color: var(--purple); border: 2px solid rgba(124, 77, 255, 0.3);" onclick="APP.toggleTheme()">
                    🌓 Temayı Değiştir
                </button>
                
                <button class="btn" id="modal-audio-btn" style="width: 100%; margin-bottom: 25px; padding: 14px; border-radius: 12px; font-weight: 700; background: rgba(0, 191, 165, 0.1); color: var(--teal); border: 2px solid rgba(0, 191, 165, 0.3);" onclick="APP.toggleAudio(); this.innerHTML='🔊 Ses Durumu: ' + (typeof AUDIO !== 'undefined' && AUDIO.isEnabled() ? 'AÇIK' : 'KAPALI')">
                    🔊 Ses Durumu: ${audioState}
                </button>
                
                <button class="btn" style="width: 100%; padding: 14px; border-radius: 12px; font-weight: 700; background: var(--red); color: white; border: none; box-shadow: 0 4px 15px rgba(244,67,54,0.3);" onclick="this.closest('.settings-overlay').remove()">
                    KAPAT
                </button>
            </div>
        `;
        document.body.appendChild(overlay);
        
        setTimeout(() => {
            overlay.style.opacity = '1';
            overlay.children[0].style.transform = 'translateY(0) scale(1)';
        }, 10);
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
            <a class="bottom-nav-item ${currentScreen === 'periodicLab' ? 'active' : ''}" onclick="APP.navigate('periodicLab')">
                <span class="bottom-nav-icon">🔬</span>
                <span class="bottom-nav-text">P. Tablo</span>
            </a>
            <a class="bottom-nav-item ${currentScreen === 'tables' ? 'active' : ''}" onclick="APP.navigate('tables')">
                <span class="bottom-nav-icon">📖</span>
                <span class="bottom-nav-text">Tablolar</span>
            </a>
            <a class="bottom-nav-item ${currentScreen === 'tournamentSetup' ? 'active' : ''}" onclick="APP.navigate('tournamentSetup')">
                <span class="bottom-nav-icon">🏆</span>
                <span class="bottom-nav-text">Turnuva</span>
            </a>
        `;

        if (currentScreen === 'login') {
            bottomNav.style.display = 'none';
        } else {
            bottomNav.style.display = 'flex';
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

        const today = new Date().toDateString();
        const dailyCards = data.dailyGoalDate === today ? data.dailyCardsFlipped : 0;
        const dailyGoal = 10;
        const dailyProgress = Math.min(100, Math.round((dailyCards / dailyGoal) * 100));

        // Hata Karnesi
        const worstElement = Storage.getMostMissedElement(username);
        let warningHtml = '';
        if (worstElement && worstElement.count >= 2) {
            warningHtml = `
            <div class="dash-card error-report-card" style="background: linear-gradient(135deg, #FFE5E5, #FFCDD2); border-left: 5px solid #F44336; margin-bottom: 20px;">
                <h3 class="card-title" style="color: #D32F2F;">🚨 Akıllı Hata Karnesi</h3>
                <p class="goal-text" style="color: #B71C1C;"><strong>DİKKAT:</strong> Son zamanlarda <b>${worstElement.correct}</b> elementini sürekli <b>'${worstElement.userAnswer}'</b> olarak hatırlıyorsun (${worstElement.count} hata).</p>
                <div style="margin-top: 10px; font-size: 13px; color: #D32F2F;">Ramazan Hoca Diyor ki: <i>Hemen açıp bu elementin tablosunu tekrar etmelisin!</i></div>
            </div>`;
        }

        // Chest Card
        const chestAvailable = data.dailyChestDate !== today;
        const chestHtml = chestAvailable ? `
            <div class="dash-card chest-card" onclick="APP.showDailyChest()" style="cursor:pointer; background: linear-gradient(135deg, #FFF8E1, #FFECB3); border: 2px dashed #FFCA28; text-align:center; animation: breathing 2s infinite;">
                <h3 class="card-title" style="color:#F57F17; font-size: 24px;">🎁 Sandığın Geldi!</h3>
                <p class="goal-text" style="color:#E65100;">Günlük Altınlarını Almak İçin Dokun!</p>
            </div>
        ` : '';

        container.innerHTML = `
            <div class="dashboard-screen">
                <div class="dashboard-topbar">
                    <div class="topbar-greeting">
                        <h2>Hoş geldin ${displayName}! 🧪</h2>
                        <p class="topbar-subtitle" style="display:flex; align-items:center; gap:6px;">
                            Ramazan Hoca'nın Öğrencisi - ${data.coins || 0} Altın Ganimeti ${getGoldIcon(18)}
                        </p>
                    </div>
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <div class="topbar-badge" style="background: var(--bg-card); border: 2.5px solid ${level.color || 'var(--teal)'}; padding: 10px 24px; border-radius: 30px; box-shadow: 0 6px 25px rgba(0,0,0,0.18); display: flex; align-items: center;">
                            <div class="level-icon" style="width:52px; height:52px; border-radius:50%; overflow:hidden; display:flex; align-items:center; justify-content:center; background:white; position: relative; left: -15px; border: 3px solid white; box-shadow: 5px 0 15px rgba(0,0,0,0.15);">
                                ${data.activeAvatar && data.activeAvatar.includes('<img') ? 
                                    data.activeAvatar : 
                                    `<img src="images/logo.png" style="width:100%; height:100%; object-fit:cover; image-rendering: -webkit-optimize-contrast;">`
                                }
                            </div>
                            <div style="display:flex; flex-direction:column; align-items:flex-start; margin-left: 2px;">
                                <span class="level-name" style="font-weight:900; color:var(--text-primary); font-size:17px; line-height:1.2;">${level.name}</span>
                                <span class="total-points" style="font-weight:800; color:var(--orange); font-size:14px;">${data.totalPoints} ⭐</span>
                            </div>
                            <div style="margin-left: 25px; padding-left: 18px; border-left: 2px solid rgba(0,0,0,0.08); display: flex; flex-direction: column; align-items: center;">
                                <span style="font-size: 11px; color: var(--text-muted); font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Ganimet</span>
                                <div style="display:flex; align-items:center; gap:6px; margin-top:2px;">
                                    <span style="font-weight: 900; color: #FFC107; font-size: 18px;">${data.coins || 0}</span>
                                    ${getGoldIcon(20)}
                                </div>
                            </div>
                        </div>
                        <button onclick="APP.showSettingsModal()" title="Ayarlar" class="btn" style="background: var(--bg-card); color: var(--text-primary); border-radius: 50%; width: 50px; height: 50px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; border: 2px solid rgba(0,0,0,0.08); font-size: 24px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); cursor: pointer; transition: transform 0.3s;" onmouseover="this.style.transform='rotate(45deg)'" onmouseout="this.style.transform='none'">⚙️</button>
                    </div>
                </div>

                ${warningHtml}
                ${chestHtml}

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
                
                <div style="text-align:center; margin-bottom: 20px;">
                    <button class="btn btn-warning btn-lg" onclick="APP.customizeAvatar()" style="box-shadow: 0 4px 15px rgba(255,160,0,0.4); border: 2px solid #FFC107;">
                        🪙 ${data.coins || 0} Altın İle Özel Fotoğraf Koy (2000 Altın)
                    </button>
                    <p style="font-size: 11px; color: var(--text-muted); margin-top: 5px;">*2000 Altın karşılığında internetten/galerinden bir resim URL'si koyabilirsin.</p>
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

    // ============ MARKET (Premium) ============
    function renderMarket() {
        const container = document.getElementById('main-content');
        const username = AUTH.getCurrentUser();
        const data = Storage.getData(username);
        const coins = data.coins || 0;

        const avatars = [
            { id: 'Prof. Dr. 👨‍🔬', name: 'Prof. Dr. Avatar', price: 500, type: 'avatar' },
            { id: 'Deha 🧠', name: 'Kimya Dehası', price: 1000, type: 'avatar' },
            { id: 'Kral 👑', name: 'Okul Birincisi', price: 5000, type: 'avatar' }
        ];

        window.buyMarketItem = (type, id, price) => {
            if (typeof AUDIO !== 'undefined') AUDIO.playClick();
            if (Storage.buyItem(username, type, id, price)) {
                if (typeof AUDIO !== 'undefined') AUDIO.playSuccess();
                alert(`Tebrikler! [${id}] satın alındı ve kuşanıldı!`);
                renderMarket(); // reload
                renderSidebar(); // update avatar right away
            } else {
                if (typeof AUDIO !== 'undefined') AUDIO.playWrong();
                alert('Yetersiz altın! Daha çok soru çözmelisin.');
            }
        };

        window.equipMarketItem = (type, id) => {
            if (typeof AUDIO !== 'undefined') AUDIO.playClick();
            Storage.equipItem(username, type, id);
            renderMarket();
            renderSidebar();
        };

        container.innerHTML = `
            <div class="market-screen" style="padding:20px;">
                <div class="screen-header" style="text-align:center; padding: 40px; background: radial-gradient(circle, #2C3E50 0%, #000000 100%); color: gold; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                    <h2 style="font-size:36px; margin-bottom:10px;">🛒 Gizli Kara Market</h2>
                    <p style="font-size:18px;">Kimya Altınlarını harcayarak profilini özelleştir!</p>
                    <div style="font-size:40px; margin-top:20px; font-weight:bold; text-shadow: 0 0 20px gold;">
                        ${coins} 🪙
                    </div>
                </div>

                <h3 style="margin-top:30px; font-size:24px;">👨‍🔬 Efsanevi Avatarlar</h3>
                <div class="market-grid" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:20px; margin-top:20px;">
                    ${avatars.map(item => {
                        const owned = data.ownedAvatars && data.ownedAvatars.includes(item.id);
                        const active = data.activeAvatar === item.id;
                        return `
                        <div class="dash-card" style="text-align:center; border: ${active ? '3px solid #00BFA5' : '1px solid #ddd'}">
                            <div style="font-size:60px; margin-bottom:10px;">${item.id.split(' ')[0] || item.id}</div>
                            <h4>${item.name}</h4>
                            ${owned ? 
                                `<button class="btn ${active ? 'btn-correct' : 'btn-primary'}" style="margin-top:10px; width:100%;" onclick="buyMarketItem('${item.type}', '${item.id}', 0); equipMarketItem('${item.type}', '${item.id}')">${active ? 'Kuşanıldı ✅' : 'Kullan'}</button>` 
                                : `<button class="btn btn-warning" style="margin-top:10px; width:100%;" onclick="buyMarketItem('${item.type}', '${item.id}', ${item.price})">Satın Al (${item.price} 🪙)</button>`
                            }
                        </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;

        Animations.staggeredEntrance(Array.from(container.querySelectorAll('.dash-card')), 100);
    }

    // ============ PERIODIC LAB ============
    function renderPeriodicLab() {
        const container = document.getElementById('main-content');
        
        let html = `
            <div class="lab-screen" style="padding:20px; max-width: 1200px; margin: 0 auto;">
                <div class="screen-header" style="position:relative; z-index:1; padding: 40px 30px; border-radius: 24px; background: linear-gradient(135deg, #1A2980 0%, #26D0CE 100%); color:white; overflow:hidden; margin-bottom: 40px; box-shadow: var(--shadow-lg);">
                    <div style="position:absolute; top:0;left:0; right:0;bottom:0; background: url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><circle cx=%2250%22 cy=%2250%22 r=%2240%22 stroke=%22rgba(255,255,255,0.1)%22 stroke-width=%221%22 fill=%22none%22/><circle cx=%2250%22 cy=%2250%22 r=%2220%22 stroke=%22rgba(255,255,255,0.2)%22 stroke-width=%222%22 fill=%22none%22/></svg>') center center / cover; opacity: 0.4; animation: spin 25s linear infinite;"></div>
                    <div style="position:relative; z-index:2; text-align:center;">
                        <h2 style="font-size:38px; font-weight:800; margin-bottom:10px; text-shadow: 0 2px 10px rgba(0,0,0,0.2);">🔬 İnteraktif Kimya Laboratuvarı</h2>
                        <p style="font-size:18px; opacity:0.9;">Tüm elementleri ve kökleri keşfet, detaylarını incele.</p>
                    </div>
                </div>`;

        if (typeof TABLES !== 'undefined') {
            Object.keys(TABLES).forEach(key => {
                const table = TABLES[key];
                html += `
                <div class="lab-section" style="margin-bottom: 50px; animation: fadeIn 0.5s ease;">
                    <div style="display:flex; align-items:center; gap:15px; margin-bottom:25px; border-bottom: 2px solid ${table.color}33; padding-bottom:15px;">
                        <div style="font-size:40px; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1));">${table.icon}</div>
                        <div>
                            <h3 style="font-size:24px; font-weight:700; color:var(--text-primary);">${table.name}</h3>
                            <p style="font-size:14px; color:var(--text-muted); font-weight:500;">${table.subtitle} — Toplam ${table.items.length} Element/Kök</p>
                        </div>
                    </div>
                    <div class="periodic-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap:18px;">
                        ${table.items.map(el => `
                            <div class="lab-card" style="background:var(--bg-card); cursor:pointer; padding:20px 10px; border-radius:20px; box-shadow:var(--shadow-md); text-align:center; transition:var(--transition); border: 1px solid rgba(255,255,255,0.4); position:relative; overflow:hidden;"
                                 onmouseover="this.style.transform='scale(1.05) translateY(-8px)'; this.style.boxShadow='0 10px 25px ${table.color}44'; this.style.borderColor='${table.color}';"
                                 onmouseout="this.style.transform='none'; this.style.boxShadow='var(--shadow-md)'; this.style.borderColor='rgba(255,255,255,0.4)';"
                                 onclick="APP.showBigElementCard('${el.symbol.replace(/'/g, "\\'")}')">
                                <div style="position:absolute; top:8px; left:12px; font-size:10px; font-weight:800; color:var(--text-muted);">${el.number || ''}</div>
                                <div style="font-size:38px; font-weight:900; color:${table.color}; margin: 8px 0; line-height:1;">${el.symbol}</div>
                                <div style="font-size:14px; font-weight:700; color:var(--text-primary); margin-top:5px;">${el.name}</div>
                                ${el.charge ? `<div style="font-size:11px; margin-top:8px; color:white; background:${table.color}; opacity:0.8; display:inline-block; padding:2px 8px; border-radius:6px; font-weight:700;">${el.charge}</div>` : ''}
                                ${el.charges ? `<div style="font-size:11px; margin-top:8px; color:white; background:${table.color}; opacity:0.8; display:inline-block; padding:2px 8px; border-radius:6px; font-weight:700;">${el.charges[0]}...</div>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>`;
            });
        }

        html += `</div>`;
        container.innerHTML = html;

        // Add 3d perspective effect to cards
        const cards = container.querySelectorAll('.lab-card');
        Animations.staggeredEntrance(Array.from(cards), 30);
    }
    
    function showBigElementCard(symbol) {
        if (typeof AUDIO !== 'undefined') AUDIO.playClick();
        
        let el = null;
        let parentTable = null;
        Object.values(TABLES).forEach(table => {
            const found = table.items.find(i => i.symbol === symbol);
            if (found) {
                el = found;
                parentTable = table;
            }
        });
        
        if (!el) return;
        
        const cardColor = parentTable ? parentTable.color : '#00BFA5';
        
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0'; overlay.style.left = '0'; overlay.style.right = '0'; overlay.style.bottom = '0';
        overlay.style.backgroundColor = 'rgba(0,0,0,0.92)';
        overlay.style.zIndex = '10000';
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.backdropFilter = 'blur(15px)';
        overlay.style.padding = '20px';
        overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
        
        overlay.innerHTML = `
            <div class="big-element-card" style="
                background: var(--bg-card); 
                max-width: 420px; 
                width: 100%; 
                border-radius: 32px; 
                padding: 0; 
                box-shadow: 0 0 60px ${cardColor}33, 0 30px 100px rgba(0,0,0,0.8); 
                text-align:center; 
                position:relative; 
                overflow:hidden; 
                border: 1px solid rgba(255,255,255,0.1); 
                opacity:0; 
                transform:scale(0.8) translateY(40px); 
                transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
                display: flex;
                flex-direction: column;
            ">
                <!-- Top Colorful Header Section -->
                <div style="background: linear-gradient(135deg, ${cardColor} 0%, #1a1a1a 100%); padding: 30px 20px; position: relative;">
                    <div style="position:absolute; top:0; left:0; right:0; bottom:0; background: url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><circle cx=%2250%22 cy=%2250%22 r=%2240%22 stroke=%22rgba(255,255,255,0.1)%22 stroke-width=%220.5%22 fill=%22none%22/></svg>') center center / cover; opacity: 0.3;"></div>
                    
                    <button onclick="this.closest('.big-element-card').parentElement.remove()" style="position:absolute; top: 15px; right: 15px; font-size: 24px; background:rgba(0,0,0,0.2); border:none; cursor:pointer; color:white; width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; z-index:10; transition:all 0.3s ease;">✕</button>

                    <div style="display:inline-block; background:rgba(255,255,255,0.2); backdrop-filter:blur(5px); color:white; padding:4px 12px; border-radius:20px; font-weight:700; font-size:10px; text-transform:uppercase; letter-spacing:1px; margin-bottom:15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                        ${el.number ? 'Element No: ' + el.number : 'Özel Kimyasal Yapı'}
                    </div>
                    
                    <div style="font-size: 80px; font-weight: 900; color: white; line-height:0.85; margin: 5px 0; text-shadow: 0 10px 30px rgba(0,0,0,0.3); letter-spacing:-3px;">${el.symbol}</div>
                    <h2 style="font-size: 32px; font-weight: 800; color:white; margin-top: 10px; text-shadow: 0 4px 15px rgba(0,0,0,0.2);">${el.name}</h2>
                </div>

                <!-- Content Section -->
                <div style="padding: 25px; flex: 1; background: var(--bg-card);">
                    <div style="background: rgba(0,0,0,0.03); border-radius: 20px; padding: 20px; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 25px; position: relative;">
                        <div style="position:absolute; top:-12px; left:20px; background:${cardColor}; color:white; padding:3px 12px; border-radius:8px; font-size:11px; font-weight:700; box-shadow: 0 4px 10px ${cardColor}44;">Ramazan Hoca Notu 📝</div>
                        <p style="font-size: 15px; color:var(--text-primary); line-height:1.6; font-weight:500;">${el.bio}</p>
                    </div>

                    <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:12px; margin-bottom:25px;">
                        <div style="background:var(--bg-secondary); padding:15px; border-radius:20px; text-align:left; border-left: 4px solid ${cardColor};">
                            <div style="font-size:10px; color:var(--text-muted); text-transform:uppercase; font-weight:800; letter-spacing:1px; margin-bottom:4px;">Sembol</div>
                            <div style="font-size:20px; font-weight:800; color:var(--text-primary);">${el.symbol}</div>
                        </div>
                        <div style="background:var(--bg-secondary); padding:15px; border-radius:20px; text-align:left; border-left: 4px solid ${cardColor};">
                            <div style="font-size:10px; color:var(--text-muted); text-transform:uppercase; font-weight:800; letter-spacing:1px; margin-bottom:4px;">Yük Durumu</div>
                            <div style="font-size:20px; font-weight:800; color:var(--text-primary);">${el.charge || (el.charges ? el.charges.join(', ') : '0')}</div>
                        </div>
                    </div>
                    
                    <div style="display:flex; gap:12px; margin-top: auto;">
                        <button class="btn btn-primary" onclick="APP.speak('${el.name}. ${el.bio.replace(/'/g, "")}')" style="flex:2.5; font-size:16px; padding: 15px; border-radius:20px; background: ${cardColor}; border:none; box-shadow: 0 8px 25px ${cardColor}55;">
                            <span style="font-size:18px;">🔊</span> Sesli Dinleme
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Custom Entrance Animation
        setTimeout(() => {
            const card = overlay.querySelector('.big-element-card');
            card.style.opacity = '1';
            card.style.transform = 'scale(1) translateY(0)';
        }, 50);
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

    // ============ TOURNAMENT SETUP ============
    let tournamentGroups = [];
    let tournamentGroupCount = 2;
    const TOURNAMENT_COLORS = ['#00BFA5', '#7C4DFF', '#FF4081', '#FF6D00'];
    const TOURNAMENT_DEFAULTS = ['Aslanlar 🦁', 'Kartallar 🦅', 'Kurtlar 🐺', 'Şahinler 🦅'];

    function renderTournamentSetup() {
        const container = document.getElementById('main-content');
        const countColors = [
            { bg: 'linear-gradient(135deg, #00BFA5, #00897B)', shadow: 'rgba(0,191,165,0.35)' },
            { bg: 'linear-gradient(135deg, #7C4DFF, #651FFF)', shadow: 'rgba(124,77,255,0.35)' },
            { bg: 'linear-gradient(135deg, #FF4081, #C51162)', shadow: 'rgba(255,64,129,0.35)' }
        ];

        container.innerHTML = `
            <div class="tournament-setup-screen">
                <div class="screen-header">
                    <button class="btn btn-ghost" onclick="APP.navigate('dashboard')">← Geri</button>
                    <h2 class="screen-title">🏆 Turnuva Oluştur</h2>
                    <p class="screen-subtitle">Sınıfı gruplara ayır ve yarışmayı başlat!</p>
                </div>

                <div class="tournament-setup-card">
                    <h3 class="setup-section-title">👥 Kaç Grup Olacak?</h3>
                    <div class="group-count-selector">
                        ${[2,3,4].map((n, idx) => `
                            <button class="btn group-count-btn ${tournamentGroupCount === n ? 'active' : ''}" 
                                    style="--btn-bg: ${countColors[idx].bg}; --btn-shadow: ${countColors[idx].shadow}"
                                    onclick="APP.setGroupCount(${n})">
                                <span class="count-number">${n}</span>
                                <span class="count-label">Grup</span>
                            </button>
                        `).join('')}
                    </div>
                </div>

                <div class="tournament-groups-card">
                    <h3 class="setup-section-title">✏️ Grup İsimlerini Yazın</h3>
                    <p style="font-size:13px;color:var(--text-muted);margin:-10px 0 16px;">Her grup kendi ismini yazsın veya boş bırakarak varsayılan isimleri kullansın.</p>
                    <div class="group-names-list">
                        ${Array.from({length: tournamentGroupCount}, (_, i) => `
                            <div class="group-name-row" style="--group-color: ${TOURNAMENT_COLORS[i]}">
                                <div class="group-color-dot" style="background: ${TOURNAMENT_COLORS[i]}">
                                    <span style="color:white;font-weight:900;font-size:13px;">${i + 1}</span>
                                </div>
                                <input type="text" class="group-name-input" id="group-name-${i}"
                                       placeholder="${TOURNAMENT_DEFAULTS[i]}" value="${tournamentGroups[i]?.name || ''}"
                                       autocomplete="off">
                                <div class="group-name-hint" style="color:${TOURNAMENT_COLORS[i]};font-size:11px;font-weight:600;white-space:nowrap;">Grup ${i + 1}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <button class="btn btn-tournament-continue" onclick="APP.goToTournamentConfig()">
                    Devam Et →
                </button>
            </div>
        `;
        Animations.initRipples();
        const cards = container.querySelectorAll('.tournament-setup-card, .tournament-groups-card, .group-count-btn, .group-name-row');
        Animations.staggeredEntrance(Array.from(cards), 80);
    }

    function setGroupCount(count) {
        if (typeof AUDIO !== 'undefined') AUDIO.playClick();
        tournamentGroupCount = count;
        renderTournamentSetup();
    }

    function goToTournamentConfig() {
        if (typeof AUDIO !== 'undefined') AUDIO.playClick();
        tournamentGroups = [];
        for (let i = 0; i < tournamentGroupCount; i++) {
            const input = document.getElementById(`group-name-${i}`);
            const name = input && input.value.trim() ? input.value.trim() : TOURNAMENT_DEFAULTS[i];
            tournamentGroups.push({ name, color: TOURNAMENT_COLORS[i] });
        }
        navigate('tournamentConfig');
    }

    function renderTournamentConfig() {
        const container = document.getElementById('main-content');
        if (!window._tMode) window._tMode = 'quiz';
        if (!window._tDiff) window._tDiff = 'kolay';
        if (!window._tTable) window._tTable = Object.keys(TABLES)[0];

        container.innerHTML = `
            <div class="tournament-config-screen">
                <div class="screen-header">
                    <button class="btn btn-ghost" onclick="APP.navigate('tournamentSetup')">← Geri</button>
                    <h2 class="screen-title">⚙️ Turnuva Ayarları</h2>
                </div>

                <div class="tournament-groups-preview">
                    ${tournamentGroups.map(g => `
                        <div class="group-preview-chip" style="background:${g.color}18;border:2px solid ${g.color};color:${g.color}">
                            ${g.name}
                        </div>
                    `).join('')}
                </div>

                <div class="tournament-config-card">
                    <h3 class="setup-section-title">🎮 Oyun Modu</h3>
                    <div class="tournament-option-grid">
                        <button class="btn t-opt-btn ${window._tMode==='quiz'?'active':''}" onclick="APP.setTMode('quiz',this)">
                            <span class="t-opt-icon">🧪</span><span>Quiz</span>
                        </button>
                        <button class="btn t-opt-btn ${window._tMode==='flashcard'?'active':''}" onclick="APP.setTMode('flashcard',this)">
                            <span class="t-opt-icon">🃏</span><span>Flashcard</span>
                        </button>
                        <button class="btn t-opt-btn ${window._tMode==='matching'?'active':''}" onclick="APP.setTMode('matching',this)">
                            <span class="t-opt-icon">🔗</span><span>Eşleştirme</span>
                        </button>
                        <button class="btn t-opt-btn ${window._tMode==='fillTable'?'active':''}" onclick="APP.setTMode('fillTable',this)">
                            <span class="t-opt-icon">📝</span><span>Tablo Doldur</span>
                        </button>
                    </div>
                </div>

                <div class="tournament-config-card">
                    <h3 class="setup-section-title">⚡ Zorluk</h3>
                    <div class="tournament-option-grid">
                        <button class="btn t-opt-btn ${window._tDiff==='kolay'?'active':''}" onclick="APP.setTDiff('kolay',this)">🟢 Kolay</button>
                        <button class="btn t-opt-btn ${window._tDiff==='orta'?'active':''}" onclick="APP.setTDiff('orta',this)">🟡 Orta</button>
                        <button class="btn t-opt-btn ${window._tDiff==='zor'?'active':''}" onclick="APP.setTDiff('zor',this)">🔴 Zor</button>
                    </div>
                </div>

                <div class="tournament-config-card">
                    <h3 class="setup-section-title">📋 Tablo</h3>
                    <div class="tournament-option-grid">
                        ${Object.keys(TABLES).map(key => `
                            <button class="btn t-opt-btn ${window._tTable===key?'active':''}" onclick="APP.setTTable('${key}',this)" style="--table-color:${TABLES[key].color}">
                                <span class="t-opt-icon">${TABLES[key].icon}</span><span>${TABLES[key].name}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>

                <button class="btn btn-tournament-go" onclick="APP.launchTournament()">
                    🏆 TURNAYI BAŞLAT!
                </button>
            </div>
        `;
        Animations.initRipples();
        const cards = container.querySelectorAll('.tournament-config-card, .t-opt-btn');
        Animations.staggeredEntrance(Array.from(cards), 60);
    }

    function setTMode(mode, btn) {
        if (typeof AUDIO !== 'undefined') AUDIO.playClick();
        window._tMode = mode;
        btn.closest('.tournament-option-grid').querySelectorAll('.t-opt-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }
    function setTDiff(diff, btn) {
        if (typeof AUDIO !== 'undefined') AUDIO.playClick();
        window._tDiff = diff;
        btn.closest('.tournament-option-grid').querySelectorAll('.t-opt-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }
    function setTTable(table, btn) {
        if (typeof AUDIO !== 'undefined') AUDIO.playClick();
        window._tTable = table;
        btn.closest('.tournament-option-grid').querySelectorAll('.t-opt-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }

    function launchTournament() {
        if (typeof AUDIO !== 'undefined') AUDIO.playSuccess();
        Game.initTournament({
            groups: tournamentGroups,
            mode: window._tMode || 'quiz',
            difficulty: window._tDiff || 'kolay',
            table: window._tTable || 'katyonlar'
        });
    }

    return {
        init, navigate, handleLogin, updatePreview, togglePassword,
        switchTab, searchTable, showElementBio, speak,
        selectDifficulty, startGame, customizeAvatar,
        renderSidebar, renderBottomNav, renderMarket, renderPeriodicLab, showBigElementCard, showDailyChest,
        toggleTheme, toggleAudio, showSettingsModal,
        setGroupCount, goToTournamentConfig, setTMode, setTDiff, setTTable, launchTournament
    };
})();

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => APP.init());
