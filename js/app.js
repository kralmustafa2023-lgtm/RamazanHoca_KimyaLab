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

    async function init() {
        // Activate Security Shield
        if (typeof AUTH !== 'undefined' && AUTH.initShield) {
            AUTH.initShield();
        }

        // Activate "Suni Teneffüs" (Server Keep-Alive)
        // This pings the server periodically to prevent Aiven Sleep Mode
        startKeepAlive();

        // Global error logging for debugging "invisible" errors
        window.onerror = function(msg, url, line) {
            console.error(`Global Error: ${msg} at ${url}:${line}`);
        };

        const savedTheme = localStorage.getItem('kimyalab_theme');
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
        }

        // Load dynamic question data from MySQL (non-blocking)
        if (typeof loadTablesFromDB === 'function') {
            loadTablesFromDB();
        }

        if (AUTH.isLoggedIn()) {
            // Background sync to catch up if they were already logged in (e.g. on mobile)
            AUTH.sync().then(synced => {
                if (synced && (currentScreen === 'dashboard' || currentScreen === 'statistics' || currentScreen === 'badges')) {
                    console.log("Sync finished, refreshing screen...");
                    navigate(currentScreen);
                }
            });
            if (AUTH.isTeacher()) {
                navigate('adminDashboard');
            } else {
                navigate('dashboard');
                setTimeout(() => { if (typeof ADMIN !== 'undefined') ADMIN.checkInboxForStudent(); }, 1500);
            }
        } else {
            navigate('login');
        }
    }

    // ===== FIREBASE KEEP-ALIVE CHECK =====
    function startKeepAlive() {
        const ping = async () => {
            try {
                // Simple DB read/write to verify connectivity
                if (typeof DB !== 'undefined') await DB.update('appData', { lastPing: new Date().toISOString() });
                console.log('💓 Firebase bağlantısı aktif (Keep-alive)');
            } catch (e) {
                // Silently fail
            }
        };
        // Ping once immediately
        ping();
        // Ping every 10 minutes
        setInterval(ping, 10 * 60 * 1000);
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
                case 'notifications': renderNotifications(); break;
                case 'tournamentSetup': renderTournamentSetup(); break;
                case 'tournamentConfig': renderTournamentConfig(); break;
                case 'adminDashboard': renderAdminDashboard(); break;
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
        let activeTab = 'student';

        container.innerHTML = `
            <div class="login-screen">
                <div class="login-left">
                    <div class="login-form-container" style="transition: all 0.4s ease;" id="login-container-box">
                        <div class="login-logo">
                            <img src="images/logo.png" alt="NSBL Logo" class="logo-image">
                            <h1 class="login-title">Ramazan Hoca'nın<br>KimyaLab</h1>
                            <p class="login-subtitle">Kimyayı Fethedelim! ⚗️</p>
                            
                            <!-- Bulut Sunucu Durumu -->
                            <div id="cloud-status-indicator" onclick="APP.checkCloudStatus()" style="margin-top: 10px; padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; display: inline-flex; align-items: center; justify-content: center; gap: 6px; cursor: pointer; transition: all 0.3s ease; background: rgba(0,0,0,0.05); color: var(--text-muted); border: 2px solid transparent;">
                                <span class="cloud-icon" style="font-size: 14px;">☁️</span>
                                <span id="cloud-status-text">Bulut Sunucu: Kontrol Ediliyor...</span>
                            </div>
                        </div>

                        <!-- Login Tabs -->
                        <div style="display:flex; background: rgba(0,0,0,0.05); padding: 4px; border-radius: 10px; margin-bottom: 15px; gap: 4px;">
                            <button id="tab-student" onclick="APP.switchLoginTab('student')" style="flex:1; padding: 6px; border-radius: 8px; border: none; font-weight: 700; font-size: 11.5px; cursor: pointer; transition: 0.3s; background: var(--bg-card); color: var(--text-primary); box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                                Öğrenci Girişi
                            </button>
                            <button id="tab-vip" onclick="APP.switchLoginTab('vip')" style="flex:1; padding: 6px; border-radius: 8px; border: none; font-weight: 700; font-size: 11.5px; cursor: pointer; transition: 0.3s; background: transparent; color: var(--text-muted);">
                                👑 VIP Kurucu
                            </button>
                            <button id="tab-teacher" onclick="APP.switchLoginTab('teacher')" style="flex:1; padding: 6px; border-radius: 8px; border: none; font-weight: 700; font-size: 11.5px; cursor: pointer; transition: 0.3s; background: transparent; color: var(--text-muted);">
                                👨‍🏫 Öğretmen
                            </button>
                        </div>

                        <!-- Student Form -->
                        <form id="form-student" class="login-form" onsubmit="APP.handleLogin(event)">
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

                        <!-- Teacher Form -->
                        <form id="form-teacher" class="login-form" style="display: none;" onsubmit="APP.handleTeacherLogin(event)">
                            <div class="input-group" style="background: rgba(117, 81, 255, 0.05); border: 2px solid #7551FF; box-shadow: 0 0 10px rgba(117, 81, 255, 0.2);">
                                <span class="input-icon" style="color: #7551FF; filter: drop-shadow(0 0 5px rgba(117, 81, 255, 0.5));">👨‍🏫</span>
                                <input type="text" id="teacher-username" placeholder="Öğretmen Kullanıcı Adı" 
                                       class="input-field" autocomplete="off" style="color: #4318FF; font-weight: 700;">
                            </div>
                            <div class="input-group" style="background: rgba(117, 81, 255, 0.05); border: 2px solid #7551FF; box-shadow: 0 0 10px rgba(117, 81, 255, 0.2);">
                                <span class="input-icon" style="color: #7551FF; filter: drop-shadow(0 0 5px rgba(117, 81, 255, 0.5));">🔑</span>
                                <input type="password" id="teacher-password" placeholder="Yönetici Şifresi" 
                                       class="input-field" autocomplete="off" style="color: #4318FF; font-weight: 700;">
                            </div>
                            <div id="teacher-error" class="login-error" style="color: #FF5252;"></div>
                            <button type="submit" class="btn btn-lg btn-login" style="background: linear-gradient(135deg, #7551FF, #4318FF); color: #FFF; font-weight: 800; box-shadow: 0 0 15px rgba(117, 81, 255, 0.4); text-shadow: none;">
                                KONTROL PANELİNE GİR ✨
                            </button>
                        </form>

                        <!-- VIP Form -->
                        <form id="form-vip" class="login-form" style="display: none;" onsubmit="APP.handleVIPLogin(event)">
                            <div class="input-group" style="background: rgba(255,215,0,0.05); border: 2px solid #FFD700; box-shadow: 0 0 10px rgba(255,215,0,0.2);">
                                <span class="input-icon" style="color: #FFD700; filter: drop-shadow(0 0 5px rgba(255,215,0,0.5));">👑</span>
                                <input type="text" id="vip-username" placeholder="Kurucu Kullanıcı Adı" 
                                       class="input-field" autocomplete="off" style="color: #FFD700; font-weight: 700;">
                            </div>
                            <div class="input-group" style="background: rgba(255,215,0,0.05); border: 2px solid #FFD700; box-shadow: 0 0 10px rgba(255,215,0,0.2);">
                                <span class="input-icon" style="color: #FFD700; filter: drop-shadow(0 0 5px rgba(255,215,0,0.5));">🔑</span>
                                <input type="password" id="vip-password" placeholder="Gizli VIP Şifre" 
                                       class="input-field" autocomplete="off" style="color: #FFD700; font-weight: 700;">
                            </div>
                            <div id="vip-error" class="login-error" style="color: #FF5252;"></div>
                            <button type="submit" class="btn btn-lg btn-login" style="background: linear-gradient(135deg, #FFD700, #FF8C00); color: #000; font-weight: 800; box-shadow: 0 0 15px rgba(255,215,0,0.4); text-shadow: none;">
                                VIP GİRİŞ YAP ✨
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
                                    <span>🏆</span> 20 Rozet
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
        // VIP Enter key event
        const vipPw = document.getElementById('vip-password');
        if (vipPw) {
            vipPw.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') APP.handleVIPLogin();
            });
        }
        
        setTimeout(() => checkCloudStatus(false), 500);
    }

    async function checkCloudStatus(isClick = true) {
        const indicator = document.getElementById('cloud-status-indicator');
        const text = document.getElementById('cloud-status-text');
        if (!indicator || !text) return;

        if (isClick && text.textContent.includes('AKTİF DEĞİL')) {
            window.location.reload();
            return;
        }

        indicator.style.background = 'rgba(0,0,0,0.05)';
        indicator.style.color = 'var(--text-muted)';
        indicator.style.borderColor = 'transparent';
        text.textContent = 'Bağlanılıyor...';

        try {
            await DB.get('users/RamazanHoca');
            indicator.style.background = 'rgba(0, 191, 165, 0.1)';
            indicator.style.color = '#00BFA5';
            indicator.style.borderColor = 'rgba(0, 191, 165, 0.3)';
            text.textContent = 'Bulut Sunucu: AKTİF';
        } catch (e) {
            indicator.style.background = 'rgba(255, 82, 82, 0.1)';
            indicator.style.color = '#FF5252';
            indicator.style.borderColor = 'rgba(255, 82, 82, 0.4)';
            text.textContent = 'Bulut Sunucu: AKTİF DEĞİL (Yenile)';
            if (isClick && typeof Animations !== 'undefined') Animations.shake(indicator);
        }
    }

    function switchLoginTab(tab) {
        if (typeof AUDIO !== 'undefined') AUDIO.playClick();
        const btnStudent = document.getElementById('tab-student');
        const btnVip = document.getElementById('tab-vip');
        const btnTeacher = document.getElementById('tab-teacher');
        const formStudent = document.getElementById('form-student');
        const formVip = document.getElementById('form-vip');
        const formTeacher = document.getElementById('form-teacher');
        const containerBox = document.getElementById('login-container-box');
        const previewGreeting = document.getElementById('preview-greeting');
        const previewSubtitle = document.querySelector('.preview-subtitle');

        if (tab === 'vip') {
            btnStudent.style.background = 'transparent';
            btnStudent.style.color = 'var(--text-muted)';
            btnStudent.style.boxShadow = 'none';
            if (btnTeacher) {
                btnTeacher.style.background = 'transparent';
                btnTeacher.style.color = 'var(--text-muted)';
                btnTeacher.style.boxShadow = 'none';
            }

            btnVip.style.background = 'linear-gradient(135deg, #FFD700, #FF8C00)';
            btnVip.style.color = '#000';
            btnVip.style.boxShadow = '0 4px 15px rgba(255,215,0,0.4)';

            formStudent.style.display = 'none';
            if (formTeacher) formTeacher.style.display = 'none';
            formVip.style.display = 'block'; 
            
            if (previewGreeting) {
                previewGreeting.innerHTML = `<div style="font-size: 38px; margin-bottom: 2px; animation: bounceFloat 2s ease-in-out infinite; filter: drop-shadow(0 0 15px rgba(255,215,0,0.8)); line-height: 1;">👑</div><span style="background: linear-gradient(135deg, #FFD700, #FF8C00); -webkit-background-clip: text; color: transparent; font-weight: 900; font-size: 26px; text-shadow: 0 0 20px rgba(255,215,0,0.2);">Hoş geldin Patron</span>`;
            }
            if (previewSubtitle) {
                previewSubtitle.innerHTML = `<span style="color: #FFD700; font-weight: 800; letter-spacing: 1px; text-shadow: 0 0 10px rgba(255,140,0,0.4);">✨ VIP Özel Erişim</span>`;
            }
            
            setTimeout(() => document.getElementById('vip-username').focus(), 50);
        } else if (tab === 'teacher') {
            btnStudent.style.background = 'transparent';
            btnStudent.style.color = 'var(--text-muted)';
            btnStudent.style.boxShadow = 'none';
            btnVip.style.background = 'transparent';
            btnVip.style.color = 'var(--text-muted)';
            btnVip.style.boxShadow = 'none';

            if (btnTeacher) {
                btnTeacher.style.background = 'linear-gradient(135deg, #7551FF, #4318FF)';
                btnTeacher.style.color = '#FFF';
                btnTeacher.style.boxShadow = '0 4px 15px rgba(117,121,255,0.4)';
            }

            formStudent.style.display = 'none';
            formVip.style.display = 'none';
            if (formTeacher) formTeacher.style.display = 'block';

            if (previewGreeting) {
                previewGreeting.innerHTML = `<div style="font-size: 38px; margin-bottom: 2px; animation: bounceFloat 2s ease-in-out infinite; filter: drop-shadow(0 0 15px rgba(117,81,255,0.6)); line-height: 1;">👨‍🏫</div><span style="background: linear-gradient(135deg, #7551FF, #4318FF); -webkit-background-clip: text; color: transparent; font-weight: 900; font-size: 26px; text-shadow: 0 0 20px rgba(117,81,255,0.2);">Yönetici Paneli</span>`;
            }
            if (previewSubtitle) {
                previewSubtitle.innerHTML = `<span style="color: #7551FF; font-weight: 800; letter-spacing: 1px; text-shadow: 0 0 10px rgba(117,81,255,0.4);">⚙️ Tam Yetkili Erişim</span>`;
            }
            
            setTimeout(() => document.getElementById('teacher-username').focus(), 50);
        } else {
            btnVip.style.background = 'transparent';
            btnVip.style.color = 'var(--text-muted)';
            btnVip.style.boxShadow = 'none';
            if (btnTeacher) {
                btnTeacher.style.background = 'transparent';
                btnTeacher.style.color = 'var(--text-muted)';
                btnTeacher.style.boxShadow = 'none';
            }

            btnStudent.style.background = 'var(--bg-card)';
            btnStudent.style.color = 'var(--text-primary)';
            btnStudent.style.boxShadow = '0 4px 10px rgba(0,0,0,0.05)';

            formVip.style.display = 'none';
            if (formTeacher) formTeacher.style.display = 'none';
            formStudent.style.display = 'block'; 
            
            if (previewSubtitle) {
                previewSubtitle.textContent = "Ramazan Hoca'nın öğrencisi";
            }
            APP.updatePreview(); // Restore student preview name
            
            setTimeout(() => document.getElementById('login-displayname').focus(), 50);
        }
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

    async function handleLogin(event) {
        event.preventDefault();
        const displayName = document.getElementById('login-displayname').value.trim();
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value.trim();
        const errorEl = document.getElementById('login-error');

        if (!username || !password) {
            errorEl.textContent = 'Lütfen kullanıcı adı ve şifre giriniz!';
            if (typeof Animations !== 'undefined') Animations.shake(document.querySelector('.login-form'));
            return;
        }

        if (!displayName) {
            errorEl.textContent = 'Lütfen adınızı girin!';
            if (typeof Animations !== 'undefined') Animations.shake(document.querySelector('.login-form'));
            return;
        }

        errorEl.textContent = '⏳ Giriş yapılıyor...';

        try {
            const result = await AUTH.login(username, password, displayName);
            if (result.success) {
                window.location.reload();
            } else {
                errorEl.textContent = result.message;
                if (typeof Animations !== 'undefined') Animations.shake(document.querySelector('.login-form'));
            }
        } catch (e) {
            errorEl.textContent = 'HATA: ' + e.message;
            alert('Giriş Hatası: ' + e.message);
        }
    }

    async function handleTeacherLogin(event) {
        if(event) event.preventDefault();
        const username = document.getElementById('teacher-username').value.trim();
        const password = document.getElementById('teacher-password').value.trim();
        const errorEl = document.getElementById('teacher-error');

        if (!username || !password) {
            errorEl.textContent = 'Kullanıcı adı ve şifre zorunludur!';
            if (typeof Animations !== 'undefined') Animations.shake(document.getElementById('form-teacher'));
            return;
        }

        errorEl.textContent = '⏳ Giriş yapılıyor...';

        try {
            const result = await AUTH.teacherLogin(username, password);
            if (result.success) {
                window.location.reload();
            } else {
                errorEl.textContent = result.message;
                if (typeof Animations !== 'undefined') Animations.shake(document.getElementById('form-teacher'));
            }
        } catch (e) {
            errorEl.textContent = 'HATA: ' + e.message;
            alert('Öğretmen Giriş Hatası: ' + e.message);
        }
    }

    async function handleVIPLogin(event) {
        if(event) event.preventDefault();
        const username = document.getElementById('vip-username').value.trim();
        const password = document.getElementById('vip-password').value.trim();
        const errorEl = document.getElementById('vip-error');

        if (!username || !password) {
            errorEl.textContent = 'Kullanıcı adı ve şifre zorunludur!';
            Animations.shake(document.getElementById('form-vip'));
            return;
        }

        const result = await AUTH.login(username, password, "👑 VIP Kurucu");
        if (result.success) {
            window.location.reload();
        } else {
            errorEl.textContent = result.message;
            Animations.shake(document.getElementById('form-vip'));
        }
    }

    // ============ REGISTER (Kayıt Ol) ============
    async function handleRegister() {
        const displayName = document.getElementById('login-displayname').value.trim();
        const username = document.getElementById('login-username').value.trim();
        const email = document.getElementById('login-email') ? document.getElementById('login-email').value.trim() : '';
        const password = document.getElementById('login-password').value.trim();
        const errorEl = document.getElementById('login-error');

        if (!displayName || !username || !password || !email) {
            errorEl.textContent = 'Kayıt için tüm alanları doldurun! (Ad, Kullanıcı Adı, E-posta, Şifre)';
            Animations.shake(document.querySelector('.login-form'));
            return;
        }

        if (password.length < 4) {
            errorEl.textContent = 'Şifre en az 4 karakter olmalıdır!';
            Animations.shake(document.querySelector('.login-form'));
            return;
        }

        if (!email.includes('@')) {
            errorEl.textContent = 'Geçerli bir e-posta adresi girin!';
            Animations.shake(document.querySelector('.login-form'));
            return;
        }

        errorEl.textContent = '⏳ Kayıt yapılıyor...';
        const result = await AUTH.register(username, password, email, displayName);

        if (result.success) {
            errorEl.style.color = 'var(--teal)';
            errorEl.textContent = '✅ ' + result.message;
            if (typeof AUDIO !== 'undefined') AUDIO.playSuccess();
        } else {
            errorEl.style.color = 'var(--red)';
            errorEl.textContent = '❌ ' + result.message;
            Animations.shake(document.querySelector('.login-form'));
        }
    }

    // ============ FORGOT PASSWORD (Şifremi Unuttum) ============
    function showForgotPassword() {
        if (typeof AUDIO !== 'undefined') AUDIO.playClick();

        const overlay = document.createElement('div');
        overlay.className = 'forgot-pw-overlay';
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);backdrop-filter:blur(10px);z-index:10000;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.3s;';

        overlay.innerHTML = `
            <div style="background:var(--bg-card);border-radius:24px;padding:30px;width:90%;max-width:420px;box-shadow:0 20px 60px rgba(0,0,0,0.5);transform:translateY(20px) scale(0.95);transition:all 0.4s cubic-bezier(0.175,0.885,0.32,1.275);">
                <div style="text-align:center; margin-bottom:20px;">
                    <div style="font-size:50px; margin-bottom:10px;">🔑</div>
                    <h3 style="color:var(--text-primary); font-size:22px; font-weight:800; margin-bottom:5px;">Şifremi Unuttum</h3>
                    <p style="color:var(--text-muted); font-size:13px;">Kullanıcı adınızı ve e-posta adresinizi girerek şifrenizi sıfırlayabilirsiniz.</p>
                </div>
                <div class="input-group" style="margin-bottom:12px;">
                    <span class="input-icon">👤</span>
                    <input type="text" id="forgot-username" placeholder="Kullanıcı Adınız" class="input-field" autocomplete="off">
                </div>
                <div class="input-group" style="margin-bottom:12px;">
                    <span class="input-icon">📧</span>
                    <input type="email" id="forgot-email" placeholder="Kayıtlı E-posta Adresiniz" class="input-field" autocomplete="off">
                </div>
                <div class="input-group" style="margin-bottom:12px;">
                    <span class="input-icon">🔐</span>
                    <input type="password" id="forgot-newpassword" placeholder="Yeni Şifreniz (en az 4 karakter)" class="input-field" autocomplete="off">
                </div>
                <div id="forgot-error" style="font-size:13px; font-weight:700; text-align:center; min-height:20px; margin-bottom:12px;"></div>
                <div style="display:flex; gap:10px;">
                    <button class="btn" style="flex:1; padding:14px; border-radius:12px; font-weight:800; background:var(--teal); color:white; border:none; box-shadow:0 4px 15px rgba(0,191,165,0.4);" onclick="APP.handleForgotPassword()">
                        Şifreyi Sıfırla ✅
                    </button>
                    <button class="btn" style="flex:1; padding:14px; border-radius:12px; font-weight:700; background:var(--bg-card); color:var(--text-muted); border:2px solid var(--text-muted);" onclick="this.closest('.forgot-pw-overlay').remove()">
                        İptal
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        setTimeout(() => {
            overlay.style.opacity = '1';
            overlay.children[0].style.transform = 'translateY(0) scale(1)';
        }, 10);

        setTimeout(() => document.getElementById('forgot-username').focus(), 300);
    }

    async function handleForgotPassword() {
        const username = document.getElementById('forgot-username').value.trim();
        const email = document.getElementById('forgot-email').value.trim();
        const newPassword = document.getElementById('forgot-newpassword').value.trim();
        const errorEl = document.getElementById('forgot-error');

        if (!username || !email || !newPassword) {
            errorEl.style.color = 'var(--red)';
            errorEl.textContent = 'Tüm alanları doldurun!';
            return;
        }

        if (newPassword.length < 4) {
            errorEl.style.color = 'var(--red)';
            errorEl.textContent = 'Yeni şifre en az 4 karakter olmalı!';
            return;
        }

        errorEl.style.color = 'var(--orange)';
        errorEl.textContent = '⏳ Doğrulanıyor...';

        const result = await AUTH.resetPassword(username, email, newPassword);

        if (result.success) {
            errorEl.style.color = 'var(--teal)';
            errorEl.textContent = '✅ ' + result.message;
            if (typeof AUDIO !== 'undefined') AUDIO.playSuccess();
            setTimeout(() => {
                const overlay = document.querySelector('.forgot-pw-overlay');
                if (overlay) overlay.remove();
            }, 2500);
        } else {
            errorEl.style.color = 'var(--red)';
            errorEl.textContent = '❌ ' + result.message;
            if (typeof Animations !== 'undefined') Animations.shake(document.getElementById('forgot-username').parentElement);
        }
    }

    // ============ SIDEBAR ============
    function renderSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) return;
        
        const username = AUTH.getCurrentUser();
        const data = Storage.getData(username);
        const level = getLevel(data.totalPoints);
        const vip = AUTH.isVIP();

        const sidebarClass = vip ? 'sidebar-content vip-sidebar' : 'sidebar-content';
        const userBadge = vip ? '<span style="background:linear-gradient(135deg,#FFD700,#FF8C00);color:#000;font-size:9px;font-weight:900;padding:2px 6px;border-radius:6px;margin-left:4px;animation:vipPulse 2s infinite;">👑 VIP</span>' : '';
        const avatarBorder = vip ? 'border: 3px solid gold; box-shadow: 0 0 20px rgba(255,215,0,0.5);' : 'border: 2.5px solid var(--white); box-shadow: 0 4px 12px rgba(0,0,0,0.15);';

        // Check unread notifications count
        const unreadCount = getUnreadNotificationCount(data);

        sidebar.innerHTML = `
            <div class="${sidebarClass}">
                <div class="sidebar-logo">
                    <img src="images/logo.png" alt="NSBL" class="sidebar-logo-img">
                    <span class="sidebar-logo-text">${vip ? '👑 KimyaLab VIP' : 'KimyaLab'}</span>
                </div>
                
                <div class="sidebar-user" ${vip ? 'style="background: linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,140,0,0.1)); border: 1px solid rgba(255,215,0,0.3);"' : ''}>
                    <div class="user-avatar" style="width:50px; height:50px; overflow:hidden; display:flex; align-items:center; justify-content:center; background:white; ${avatarBorder} border-radius:50%;">
                        ${data.activeAvatar && data.activeAvatar.includes('<img') ? 
                            data.activeAvatar : 
                            `<img src="images/logo.png" style="width:100%; height:100%; object-fit:cover; image-rendering: -webkit-optimize-contrast;">`
                        }
                    </div>
                    <div class="user-info">
                        <span class="user-name" style="font-size:15px;">${AUTH.getDisplayName(username)} ${userBadge}</span>
                        <span class="user-level" style="color:${vip ? 'gold' : level.color}; font-weight:700;">${vip ? 'Kurucu Patron 👑' : level.name}</span>
                    </div>
                </div>

                <nav class="sidebar-nav">
                    <div class="nav-section-title">ANA MENÜ</div>
                    <a class="nav-item ${currentScreen === 'dashboard' ? 'active' : ''}" style="border: 2px solid var(--teal); background: rgba(0, 191, 165, 0.1); box-shadow: 0 0 12px rgba(0, 191, 165, 0.3); border-radius: 12px; margin-bottom: 8px;" onclick="APP.navigate('dashboard')">
                        <span class="nav-icon">🏠</span>
                        <span class="nav-text" style="color:var(--teal); font-weight:700;">Ana Sayfa</span>
                    </a>
                    
                    <a class="nav-item ${currentScreen === 'modeSelect' ? 'active' : ''}" style="border: 2px solid var(--orange); background: rgba(255, 109, 0, 0.1); box-shadow: 0 0 12px rgba(255, 109, 0, 0.3); border-radius: 12px; margin-bottom: 8px;" onclick="APP.navigate('modeSelect')">
                        <span class="nav-icon">🎮</span>
                        <span class="nav-text" style="color:var(--orange); font-weight:700;">Oyun Modları</span>
                    </a>
                    
                    <a class="nav-item ${currentScreen === 'periodicLab' ? 'active' : ''}" style="border: 2px solid var(--purple); background: rgba(124, 77, 255, 0.1); box-shadow: 0 0 12px rgba(124, 77, 255, 0.3); border-radius: 12px; margin-bottom: 8px;" onclick="APP.navigate('periodicLab')">
                        <span class="nav-icon">🔬</span>
                        <span class="nav-text" style="color:var(--purple); font-weight:700;">P. Tablo Lab.</span>
                    </a>

                    <a class="nav-item ${currentScreen === 'notifications' ? 'active' : ''}" style="border: 2px solid #FF9800; background: rgba(255, 152, 0, 0.1); box-shadow: 0 0 12px rgba(255, 152, 0, 0.3); border-radius: 12px; margin-bottom: 8px; position:relative;" onclick="APP.navigate('notifications')">
                        <span class="nav-icon">🔔</span>
                        <span class="nav-text" style="color:#FF9800; font-weight:700;">Bildirimler</span>
                        ${unreadCount > 0 ? `<span style="position:absolute;top:6px;right:10px;background:#F44336;color:white;font-size:10px;font-weight:900;min-width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;animation:pulse 2s infinite;">${unreadCount}</span>` : ''}
                    </a>
                    
                    <div class="nav-section-title" style="margin-top: 10px;">İSTATİSTİKLER</div>
                    <a class="nav-item ${currentScreen === 'statistics' ? 'active' : ''}" style="border: 2px solid var(--pink); background: rgba(255, 64, 129, 0.1); box-shadow: 0 0 12px rgba(255, 64, 129, 0.3); border-radius: 12px; margin-bottom: 8px;" onclick="APP.navigate('statistics')">
                        <span class="nav-icon">📊</span>
                        <span class="nav-text" style="color:var(--pink); font-weight:700;">İstatistikler</span>
                    </a>
                    
                    <a class="nav-item ${currentScreen === 'badges' ? 'active' : ''}" style="border: 2px solid var(--teal-dark); background: rgba(0, 137, 123, 0.1); box-shadow: 0 0 12px rgba(0, 137, 123, 0.3); border-radius: 12px; margin-bottom: 8px;" onclick="APP.navigate('badges')">
                        <span class="nav-icon">🎖️</span>
                        <span class="nav-text" style="color:var(--teal-dark); font-weight:700;">Rozetler</span>
                    </a>
                    <div class="nav-section-title" style="margin-top: 10px;">DİĞER</div>
                    <a class="nav-item" style="border: 2px solid var(--text-muted); background: rgba(136, 150, 171, 0.1); box-shadow: 0 0 12px rgba(136, 150, 171, 0.2); border-radius: 12px; margin-bottom: 8px;" onclick="APP.showSettingsModal()">
                        <span class="nav-icon">⚙️</span>
                        <span class="nav-text" style="color:var(--text-muted); font-weight:700;">Ayarlar</span>
                    </a>
                </nav>

                <div class="sidebar-footer">
                    <div class="level-progress-mini">
                        <div class="level-bar-mini">
                            <div class="level-fill-mini" style="width: ${getLevelProgress(data.totalPoints)}%"></div>
                        </div>
                        <span class="level-points-mini" style="display:flex; align-items:center; gap:6px;">
                            ${data.totalPoints} Puan - <b style="color:#FFC107; display:flex; align-items:center; gap:4px;">${data.coins || 0} ${getGoldIcon(16)} Altın</b>
                        </span>
                    </div>
                </div>
            </div>
        `;
    }

    // Helper: Count unread notifications
    function getUnreadNotificationCount(data) {
        if (!data.inbox) return 0;
        return data.inbox.filter(m => !m.read).length;
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
            <div style="background: var(--bg-card); padding: 30px 20px; border-radius: 24px; width: 90%; max-width: 360px; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.5); transform: translateY(30px) scale(0.9); transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.25); border: 1px solid rgba(255,255,255,0.08);">
                <div style="font-size: 40px; margin-bottom: 10px;">⚙️</div>
                <h3 style="margin-bottom: 25px; font-weight: 800; color: var(--text-primary); font-family: 'Poppins', sans-serif;">Ayarlar</h3>
                
                <div style="text-align:left; margin-bottom:20px;">
                    <label style="font-size:13px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px; margin-bottom:8px; display:block;">🎨 Tema Seçimi</label>
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
                        <button class="btn" style="padding:8px; border-radius:8px; background:#F0F4F8; border:2px solid #8896AB; color:#1A2138; font-weight:600; font-size:12px;" onclick="APP.setTheme('light')">☀️ Açık</button>
                        <button class="btn" style="padding:8px; border-radius:8px; background:#1E1E2A; border:2px solid #6B7A90; color:#F0F4F8; font-weight:600; font-size:12px;" onclick="APP.setTheme('dark')">🌙 Koyu</button>
                        <button class="btn" style="padding:8px; border-radius:8px; background:#001529; border:2px solid #285973; color:#64FFDA; font-weight:600; font-size:12px;" onclick="APP.setTheme('ocean')">🌊 Okyanus</button>
                        <button class="btn" style="padding:8px; border-radius:8px; background:#000000; border:2px solid #330044; color:#BC13FE; font-weight:600; font-size:12px; text-shadow: 0 0 5px #BC13FE;" onclick="APP.setTheme('neon')">⚡ Neon</button>
                        <button class="btn" style="padding:8px; border-radius:8px; background:#2A1B18; border:2px solid #8E6A5A; color:#FF9F1C; font-weight:600; font-size:12px;" onclick="APP.setTheme('sunset')">🌇 Sunset</button>
                        <button class="btn" style="padding:8px; border-radius:8px; background:#0D0221; border:2px solid #FF0055; color:#00FF41; font-weight:600; font-size:12px;" onclick="APP.setTheme('cyberpunk')">🕹️ Cyberpunk</button>
                        <button class="btn" style="padding:8px; border-radius:8px; background:#102516; border:2px solid #4CAF50; color:#00E676; font-weight:600; font-size:12px;" onclick="APP.setTheme('forest')">🌲 Orman</button>
                        <button class="btn" style="padding:8px; border-radius:8px; background:#FFF0F5; border:2px solid #D194C0; color:#FF66A3; font-weight:600; font-size:12px;" onclick="APP.setTheme('candy')">🍬 Candy</button>
                        <button class="btn" style="padding:8px; border-radius:8px; background:#05060A; border:2px solid #7209B7; color:#00D2FF; font-weight:600; font-size:12px; grid-column: span 2;" onclick="APP.setTheme('galaxy')">🌌 Galaksi (Galaxy)</button>
                    </div>
                </div>
                
                <div style="text-align:left; margin-bottom:25px;">
                    <label style="font-size:13px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px; margin-bottom:8px; display:block;">🔊 Ses ve Efektler</label>
                    <button class="btn" id="modal-audio-btn" style="width: 100%; padding: 14px; border-radius: 12px; font-weight: 700; background: rgba(0, 191, 165, 0.1); color: var(--teal); border: 2px solid rgba(0, 191, 165, 0.3); margin-bottom: 8px;" onclick="APP.toggleAudio(); this.innerHTML='🔊 Ses Durumu: ' + (typeof AUDIO !== 'undefined' && AUDIO.isEnabled() ? 'AÇIK' : 'KAPALI')">
                        🔊 Ses Durumu: ${audioState}
                    </button>
                    <button class="btn" style="width:100%; padding:10px; font-size:12px; background:rgba(0,0,0,0.05); color:var(--text-muted); border:1px dashed var(--text-muted); border-radius:10px;" onclick="if(typeof AUDIO!=='undefined'){AUDIO.init(); this.textContent='✅ Çözüldü'; setTimeout(()=>this.textContent='🔊 Tıklama Sesi Gelmiyorsa Tıkla', 2000);}">🔊 Tıklama Sesi Gelmiyorsa Tıkla</button>
                </div>
                
                <button class="btn" style="width: 100%; padding: 14px; border-radius: 12px; font-weight: 700; background: var(--red); color: white; border: none; box-shadow: 0 4px 15px rgba(244,67,54,0.3); margin-bottom: 10px;" onclick="AUTH.logout()">
                    🚪 Çıkış Yap
                </button>
                <button class="btn" style="width: 100%; padding: 14px; border-radius: 12px; font-weight: 700; background: var(--bg-card); color: var(--text-muted); border: 2px solid var(--text-muted);" onclick="this.closest('.settings-overlay').remove()">
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
            <a class="bottom-nav-item ${currentScreen === 'notifications' ? 'active' : ''}" onclick="APP.navigate('notifications')">
                <span class="bottom-nav-icon">🔔</span>
                <span class="bottom-nav-text">Bildirimler</span>
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
        const vip = AUTH.isVIP();

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
                <div class="dashboard-topbar" ${vip ? 'style="background: linear-gradient(135deg, rgba(255,215,0,0.1), rgba(255,140,0,0.05)); border: 1px solid rgba(255,215,0,0.2); border-radius: 20px; padding: 20px;"' : ''}>
                    <div class="topbar-greeting">
                        <h2>${vip ? '👑 Hoş geldin Patron ' + displayName + '!' : 'Hoş geldin ' + displayName + '! 🧪'}</h2>
                        <p class="topbar-subtitle" style="display:flex; align-items:center; gap:6px;">
                            ${vip ? '✨ VIP Kurucu Erişimi Aktif' : "Ramazan Hoca'nın Öğrencisi"} - ${data.coins || 0} Altın Ganimeti ${getGoldIcon(18)}
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
                            <div class="mode-card mode-tournament" style="background: linear-gradient(135deg, #FFD600, #FF6D00);" onclick="APP.navigate('tournamentSetup')">
                                <div class="mode-icon">🏆</div>
                                <h4 class="mode-name">Turnuva</h4>
                                <p class="mode-desc">Dünya çapında yarış</p>
                                <div class="mode-best">Meydan oku!</div>
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
                    <!-- Navigation Buttons -->
                    <div class="dash-nav-buttons">
                        <button class="btn btn-outline btn-lg" onclick="APP.navigate('notifications')">
                            🔔 Bildirimler
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

    // ============ NOTIFICATIONS SCREEN ============
    function renderNotifications() {
        const container = document.getElementById('main-content');
        const username = AUTH.getCurrentUser();
        const data = Storage.getData(username);
        const inbox = data.inbox || [];

        // Sort newest first
        const sortedInbox = [...inbox].reverse();

        let notifCards = '';
        if (sortedInbox.length === 0) {
            notifCards = `
                <div style="text-align:center; padding: 60px 20px;">
                    <div style="font-size:80px; margin-bottom:15px; opacity:0.5;">🔔</div>
                    <h3 style="color:var(--text-muted); font-weight:700;">Henüz bildirim yok</h3>
                    <p style="color:var(--text-muted); font-size:14px; margin-top:8px;">Ramazan Hoca mesaj gönderdiğinde burada görünecek.</p>
                </div>
            `;
        } else {
            notifCards = sortedInbox.map((msg, idx) => {
                const isRead = msg.read;
                const date = msg.date ? new Date(msg.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
                return `
                    <div class="dash-card" style="margin-bottom:15px; border-left: 4px solid ${isRead ? 'var(--text-muted)' : '#7551FF'}; opacity: ${isRead ? '0.75' : '1'}; cursor:pointer; transition: all 0.3s;" onclick="APP.openNotification(${inbox.length - 1 - idx})">
                        <div style="display:flex; align-items:flex-start; gap:15px;">
                            <div style="font-size:30px; flex-shrink:0;">${isRead ? '📭' : '📩'}</div>
                            <div style="flex:1; min-width:0;">
                                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:5px;">
                                    <h4 style="margin:0; font-weight:800; color:var(--text-primary); font-size:16px;">${msg.title || 'Bildirim'}</h4>
                                    ${!isRead ? '<span style="background:#F44336;color:white;font-size:9px;font-weight:900;padding:2px 8px;border-radius:10px;">YENİ</span>' : ''}
                                </div>
                                <p style="margin:8px 0 0 0; color:var(--text-muted); font-size:13px; line-height:1.4; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${(msg.body || '').substring(0, 100)}...</p>
                                <div style="margin-top:8px; font-size:11px; color:var(--text-muted); display:flex; align-items:center; gap:8px;">
                                    <span>👨‍🏫 ${msg.sender || 'Ramazan Hoca'}</span>
                                    <span>•</span>
                                    <span>${date}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        container.innerHTML = `
            <div class="notifications-screen" style="padding:20px; max-width:800px; margin:0 auto;">
                <div class="screen-header" style="margin-bottom:25px;">
                    <h2 class="screen-title">🔔 Bildirimler</h2>
                    <p class="screen-subtitle">Ramazan Hoca'dan gelen mesajlar ve duyurular</p>
                </div>
                ${inbox.length > 0 ? `
                    <div style="display:flex; justify-content:flex-end; margin-bottom:15px;">
                        <button class="btn btn-ghost btn-sm" onclick="APP.markAllNotificationsRead()" style="font-size:12px; color:var(--teal);">
                            ✅ Tümünü okundu işaretle
                        </button>
                    </div>
                ` : ''}
                ${notifCards}
            </div>
        `;

        const cards = container.querySelectorAll('.dash-card');
        Animations.staggeredEntrance(Array.from(cards), 60);
    }

    function openNotification(index) {
        const username = AUTH.getCurrentUser();
        const data = Storage.getData(username);
        if (!data.inbox || !data.inbox[index]) return;

        const msg = data.inbox[index];
        msg.read = true;
        Storage.saveData(username, data);

        if (typeof AUDIO !== 'undefined') AUDIO.playClick();

        const overlay = document.createElement('div');
        overlay.className = 'notif-overlay';
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);backdrop-filter:blur(10px);z-index:10000;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.3s;';
        
        const date = msg.date ? new Date(msg.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
        
        overlay.innerHTML = `
            <div style="background:var(--bg-card);border-radius:24px;padding:30px;width:90%;max-width:500px;box-shadow:0 20px 60px rgba(0,0,0,0.5);transform:translateY(20px) scale(0.95);transition:all 0.4s cubic-bezier(0.175,0.885,0.32,1.275);">
                <div style="text-align:center; margin-bottom:20px;">
                    <div style="font-size:50px; margin-bottom:10px;">📩</div>
                    <h3 style="color:var(--text-primary); font-size:22px; font-weight:800; margin-bottom:5px;">${msg.title || 'Bildirim'}</h3>
                    <div style="font-size:12px; color:var(--text-muted);">👨‍🏫 ${msg.sender || 'Ramazan Hoca'} • ${date}</div>
                </div>
                <div style="background:rgba(117,81,255,0.05); padding:20px; border-radius:16px; border-left:4px solid #7551FF; color:var(--text-primary); font-weight:500; line-height:1.7; font-size:14px; margin-bottom:25px; white-space:pre-wrap;">
                    ${(msg.body || '').replace(/\n/g, '<br>')}
                </div>
                <button class="btn" style="width:100%; padding:14px; border-radius:12px; font-weight:800; background:#7551FF; color:white; border:none; box-shadow:0 4px 15px rgba(117,81,255,0.4);" onclick="this.closest('.notif-overlay').remove(); APP.navigate('notifications')">
                    Anladım, Kapat ✓
                </button>
            </div>
        `;
        document.body.appendChild(overlay);
        setTimeout(() => {
            overlay.style.opacity = '1';
            overlay.children[0].style.transform = 'translateY(0) scale(1)';
        }, 10);

        renderSidebar(); // Update badge count
    }

    function markAllNotificationsRead() {
        const username = AUTH.getCurrentUser();
        const data = Storage.getData(username);
        if (data.inbox) {
            data.inbox.forEach(m => m.read = true);
            Storage.saveData(username, data);
        }
        renderNotifications();
        renderSidebar();
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
                    <div class="mode-select-card card-tournament" style="background: linear-gradient(135deg, #FFD600, #FF6D00);" onclick="APP.navigate('tournamentSetup')">
                        <div class="mode-select-icon">🏆</div>
                        <h3 class="mode-select-name">Turnuva</h3>
                        <p class="mode-select-desc">Rakiplerinle yarış, kupayı kazan ve şampiyon ol!</p>
                        <div class="mode-select-best">🏅 Büyük Ödüller</div>
                        <button class="btn btn-mode-select">Meydan Oku →</button>
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

    function setTheme(theme) {
        if (typeof AUDIO !== 'undefined') AUDIO.playClick();
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('kimyalab_theme', theme);
    }

    function toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        setTheme(current === 'dark' ? 'light' : 'dark');
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

    // ============ VIP LOGIN MODAL (MIGRATED TO TABS) ============
    // Kept to avoid undefined errors if any old button holds ref, but logic is now inside renderLogin tabs.
    function showVIPLogin() {
        switchLoginTab('vip');
    }

    async function handleVIPLogin(e) {
        if (e) e.preventDefault();
        const username = document.getElementById('vip-username').value.trim();
        const password = document.getElementById('vip-password').value.trim();
        const errorEl = document.getElementById('vip-error');

        if (!username || !password) {
            errorEl.textContent = 'Tüm alanları doldurun!';
            return;
        }

        const result = await AUTH.login(username, password, username);
        if (result.success && AUTH.isVIP()) {
            window.location.reload();
        } else {
            errorEl.textContent = 'VIP bilgileri hatalı! Sadece kurucu giriş yapabilir.';
            if (typeof Animations !== 'undefined') Animations.shake(document.getElementById('vip-password').parentElement);
        }
    }

    function renderAdminDashboard() {
        const container = document.getElementById('main-content');
        const sidebar = document.getElementById('sidebar');
        const bottomNav = document.getElementById('bottom-nav');
        
        // Hide Student UI Elements
        if (sidebar) sidebar.style.display = 'none';
        if (bottomNav) bottomNav.style.display = 'none';
        document.body.classList.remove('has-sidebar');
        
        container.innerHTML = `
            <div class="admin-layout" style="flex-direction:column;">
                <div class="admin-header" style="flex-wrap:wrap;gap:10px;">
                    <div style="display:flex;align-items:center;gap:12px;">
                        <span style="font-size:30px;">👨‍🏫</span>
                        <h1 style="margin:0;font-size:22px;">KimyaLab Kontrol Merkezi</h1>
                    </div>
                    <div style="display:flex;align-items:center;gap:15px;">
                        <span style="font-weight:700;color:#2B3674;">Ramazan Hoca</span>
                        <button class="admin-btn btn-danger" onclick="AUTH.logout()" style="padding:8px 15px;">🚪 Çıkış</button>
                    </div>
                </div>

                <div class="admin-tabs" style="display:flex;gap:0;background:#fff;border-bottom:2px solid #F4F7FE;padding:0 20px;overflow-x:auto;">
                    <button class="admin-tab-btn active" data-tab="dashboard" onclick="ADMIN.switchTab('dashboard')">📊 Skor Tablosu</button>
                    <button class="admin-tab-btn" data-tab="students" onclick="ADMIN.switchTab('students')">👥 Öğrenciler</button>
                    <button class="admin-tab-btn" data-tab="messages" onclick="ADMIN.switchTab('messages')">📩 Mesajlar</button>
                    <button class="admin-tab-btn" data-tab="questions" onclick="ADMIN.switchTab('questions')">📝 Sorular</button>
                    <button class="admin-tab-btn" data-tab="preview" onclick="ADMIN.switchTab('preview')">👁️ Önizleme</button>
                    <button class="admin-tab-btn" data-tab="settings" onclick="ADMIN.switchTab('settings')">⚙️ Ayarlar</button>
                </div>

                <div class="admin-content" style="flex:1;">
                    <div class="admin-body" id="admin-tab-content">
                        <div style="text-align:center;padding:50px;color:#A3AED0;">Yükleniyor...</div>
                    </div>
                </div>
            </div>
        `;

        // Apply saved theme
        const savedTheme = localStorage.getItem('admin_theme');
        if (savedTheme === 'dark') ADMIN.setAdminTheme('dark');

        // Fetch data and render first tab
        ADMIN.fetchAllUsers();
    }

    return {
        init, navigate, handleLogin, updatePreview, togglePassword, switchLoginTab,
        switchTab, searchTable, showElementBio, speak,
        selectDifficulty, startGame, customizeAvatar,
        renderSidebar, renderBottomNav, renderMarket, renderPeriodicLab, showBigElementCard, showDailyChest,
        toggleTheme, toggleAudio, showSettingsModal, setTheme,
        setGroupCount, goToTournamentConfig, setTMode, setTDiff, setTTable, launchTournament,
        handleVIPLogin, handleTeacherLogin, renderAdminDashboard,
        openNotification, markAllNotificationsRead, checkCloudStatus,
        handleRegister, handleForgotPassword, showForgotPassword
    };
})();

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => APP.init());
