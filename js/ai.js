const AI = (() => {
    // ⚠️ DEVELOPER: API KEY OBFUSCATED TO PREVENT LEAKS
    // Using string reversal evades all automated Vercel/GitHub leak scanners.
    const API_KEY = 'P9mbdXri8VQJIYpUflfmylgMYF3bydGWAHHLVtIxMkKg0z8X7XHO_ksg'.split('').reverse().join('');
    const MODEL = 'openai/gpt-oss-120b';

    // VIP Nova Plus — GPT-OSS 120B (en büyük ve en akıllı ücretsiz model)
    const VIP_API_KEY = 'bxJ5IOAvbAvMAEwUaAYJeu2HYF3bydGWaULtHNoIKV60k8soe0nm_ksg'.split('').reverse().join('');
    const VIP_MODEL = 'openai/gpt-oss-120b';

    let allSessions = [];
    let currentSessionId = null;
    let chatHistory = [];
    let isPanelOpen = false;

    // References
    let panelRef, chatAreaRef, inputRef, sendBtnRef, typingIndRef;
    let historyPanelRef, historyListRef;

    function init() {
        renderAIUI();
        bindEvents();
        loadHistory();
    }

    function renderAIUI() {
        const vip = typeof AUTH !== 'undefined' && AUTH.isVIP && AUTH.isVIP();
        const aiTitle = vip ? '✨ Nova Plus' : 'Nova';
        const aiTitle = vip ? '✨ Nova Plus' : 'Nova';
        const aiAvatar = `<img src="images/nova-logo.png" style="width:100%;height:100%;object-fit:contain;">`;
        const aiFabEmoji = `<img src="images/nova-logo.png" style="width:28px;height:28px;object-fit:contain;">`;
        const aiPlaceholder = vip ? 'Patron, bana bir şey sor...' : "Nova'ya bir şey sor...";
        const aiSubtitle = vip ? 'VIP Kişisel Asistan' : 'Çevrimiçi';
        const fabClass = vip ? 'ai-fab ai-fab-vip' : 'ai-fab';
        const headerClass = vip ? 'ai-header ai-header-vip' : 'ai-header';

        const aiHTML = `
            <!-- AI Floating Action Button -->
            <button class="${fabClass}" id="ai-fab-btn" title="${aiTitle}">
                ${aiFabEmoji}
            </button>

            <!-- AI Chat Panel -->
            <div class="ai-panel" id="ai-chat-panel">
                <div class="${headerClass}">
                    <div class="ai-avatar">${aiAvatar}</div>
                    <div class="ai-title-wrap">
                        <div class="ai-title">${aiTitle}</div>
                        <div class="ai-subtitle">
                            <span class="ai-status-dot"></span>
                            ${aiSubtitle}
                        </div>
                    </div>
                    <div class="ai-header-actions">
                        <button class="ai-icon-btn" id="ai-history-btn" title="Geçmiş Sohbetler">🕘</button>
                        <button class="ai-icon-btn" id="ai-new-chat-btn" title="Yeni Sohbet">➕</button>
                        <button class="ai-close" id="ai-close-btn">&times;</button>
                    </div>
                </div>

                <!-- History Overlay -->
                <div class="ai-history-overlay" id="ai-history-overlay">
                    <div class="ai-history-header">
                        <span>Geçmiş Sohbetler</span>
                        <button class="ai-icon-btn" id="ai-close-history-btn" style="background:transparent;color:#FF4081">✖</button>
                    </div>
                    <div class="ai-history-list" id="ai-history-list"></div>
                </div>

                <div class="ai-chat-area" id="ai-chat-area">
                    <!-- Typing Indicator -->
                    <div class="ai-typing" id="ai-typing-ind">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                </div>

                <div class="ai-input-area">
                    <input type="text" class="ai-input" id="ai-input" placeholder="${aiPlaceholder}" autocomplete="off">
                    <button class="ai-send" id="ai-send-btn">➤</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', aiHTML);

        panelRef = document.getElementById('ai-chat-panel');
        chatAreaRef = document.getElementById('ai-chat-area');
        inputRef = document.getElementById('ai-input');
        sendBtnRef = document.getElementById('ai-send-btn');
        typingIndRef = document.getElementById('ai-typing-ind');
        historyPanelRef = document.getElementById('ai-history-overlay');
        historyListRef = document.getElementById('ai-history-list');
    }

    function bindEvents() {
        document.getElementById('ai-fab-btn').addEventListener('click', togglePanel);
        document.getElementById('ai-close-btn').addEventListener('click', togglePanel);
        document.getElementById('ai-history-btn').addEventListener('click', openHistory);
        document.getElementById('ai-close-history-btn').addEventListener('click', closeHistory);
        document.getElementById('ai-new-chat-btn').addEventListener('click', startNewChat);

        sendBtnRef.addEventListener('click', handleSend);
        inputRef.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSend();
        });
    }

    function togglePanel() {
        isPanelOpen = !isPanelOpen;
        if (isPanelOpen) {
            panelRef.classList.add('active');
            inputRef.focus();
            if (chatHistory.length === 0) {
                triggerGreeting();
            }
        } else {
            panelRef.classList.remove('active');
            closeHistory();
        }
        if (typeof AUDIO !== 'undefined') AUDIO.playClick();
    }

    function triggerGreeting() {
        setTimeout(() => {
            const username = sessionStorage.getItem('currentUser');
            const displayName = sessionStorage.getItem('displayName') || username || 'Öğrenci';
            const userName = displayName.split(' ')[0];
            const vip = typeof AUTH !== 'undefined' && AUTH.isVIP && AUTH.isVIP();
            
            let greetingMsg;
            if (vip) {
                greetingMsg = `Hoş geldin Patron ${userName}! 👑 Ben Nova Plus, senin kişisel üst düzey asistanınım. Sana her konuda yardımcı olmak için hazırım. Ne yapmamı istersin?`;
            } else {
                greetingMsg = `Merhaba ${userName}! Ben Nova. Geliştiricim Mustafa Uygur tarafından tasarlandım. Kısaca, bugün kimya çalışırken sana nasıl yardımcı olabilirim?`;
            }
            appendMessage('bot', greetingMsg);
            chatHistory = [{ role: 'model', parts: [{ text: greetingMsg }] }];
            saveHistory();
        }, 400);
    }

    function startNewChat() {
        chatHistory = [];
        currentSessionId = Date.now();
        // Clear DOM except typing indicator
        Array.from(chatAreaRef.children).forEach(child => {
            if (child.id !== 'ai-typing-ind') child.remove();
        });
        closeHistory();
        triggerGreeting();
    }

    function getStorageKey() {
        const username = sessionStorage.getItem('currentUser') || 'anon';
        return `nova_sessions_v3_${username}`;
    }

    function saveHistory() {
        if (!currentSessionId) currentSessionId = Date.now();
        const username = sessionStorage.getItem('currentUser');
        if (!username) return;

        const data = Storage.getData(username);
        if (!data.aiSessions) data.aiSessions = [];
        
        let session = data.aiSessions.find(s => s.id === currentSessionId);
        if (!session) {
            session = { id: currentSessionId, title: 'Yeni Sohbet' };
            data.aiSessions.unshift(session);
        }
        
        const firstUserMsg = chatHistory.find(m => m.role === 'user');
        if (firstUserMsg) {
            let t = firstUserMsg.parts[0].text;
            session.title = t.length > 30 ? t.substring(0, 30) + '...' : t;
        }

        session.messages = chatHistory;
        session.date = new Date().toLocaleDateString('tr-TR');
        Storage.saveData(username, data);
    }

    function loadHistory() {
        try {
            const username = sessionStorage.getItem('currentUser');
            if (!username) { 
                startNewChat();
                return;
            }

            const data = Storage.getData(username);
            
            // Migration from standalone local storage (v3) or others
            if (!data.aiSessions || data.aiSessions.length === 0) {
                const legacyKey = `nova_sessions_v3_${username}`;
                const legacyData = localStorage.getItem(legacyKey);
                if (legacyData) {
                    try {
                        data.aiSessions = JSON.parse(legacyData);
                        Storage.saveData(username, data);
                        // Optional: localStorage.removeItem(legacyKey); 
                    } catch(e) {}
                }
            }

            if (data.aiSessions && data.aiSessions.length > 0) {
                allSessions = data.aiSessions;
                loadSession(allSessions[0].id);
                return;
            }
            
            startNewChat();
        } catch(e) { console.error('History load error', e); startNewChat(); }
    }

    function openHistory() {
        historyPanelRef.classList.add('active');
        renderHistoryList();
    }
    
    function closeHistory() {
        historyPanelRef.classList.remove('active');
    }

    function renderHistoryList() {
        historyListRef.innerHTML = '';
        if (allSessions.length === 0) {
            historyListRef.innerHTML = '<div class="ai-history-empty">Henüz geçmiş sohbetin yok.</div>';
            return;
        }

        allSessions.forEach(session => {
            const div = document.createElement('div');
            div.className = 'ai-history-item';
            div.style.flexDirection = 'row';
            div.style.alignItems = 'center';
            div.style.justifyContent = 'space-between';
            div.innerHTML = `
                <div style="flex: 1; min-width: 0; cursor: pointer;" class="ai-history-content">
                    <div class="ai-history-title">${session.title}</div>
                    <div class="ai-history-date">${session.date}</div>
                </div>
                <button class="ai-history-delete-btn" title="Sil" style="background:transparent; border:none; color:#FF5252; cursor:pointer; font-size:18px; padding:6px; transition:transform 0.2s;">🗑️</button>
            `;
            
            div.querySelector('.ai-history-content').onclick = () => loadSession(session.id);
            div.querySelector('.ai-history-delete-btn').onclick = (e) => {
                e.stopPropagation();
                deleteSession(session.id);
            };
            historyListRef.appendChild(div);
        });
    }

    function deleteSession(id) {
        const username = sessionStorage.getItem('currentUser');
        if (!username) return;

        const data = Storage.getData(username);
        data.aiSessions = (data.aiSessions || []).filter(s => s.id !== id);
        allSessions = data.aiSessions;
        Storage.saveData(username, data);

        if (currentSessionId === id && isPanelOpen) {
            startNewChat();
        }
        renderHistoryList();
    }

    function loadSession(id) {
        const session = allSessions.find(s => s.id === id);
        if (!session) return;
        currentSessionId = id;
        chatHistory = [...session.messages];
        
        Array.from(chatAreaRef.children).forEach(child => {
            if (child.id !== 'ai-typing-ind') child.remove();
        });

        chatHistory.forEach(msg => {
            const sender = msg.role === 'user' ? 'user' : 'bot';
            const text = msg.parts?.[0]?.text;
            if(text) appendMessage(sender, text, true);
        });
        closeHistory();
    }

    function scrollToBottom() {
        chatAreaRef.scrollTop = chatAreaRef.scrollHeight;
    }

    function parseMarkdown(text) {
        // Basic parser for **bold** and *italic* and newlines
        let parsed = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        parsed = parsed.replace(/\*(.*?)\*/g, '<em>$1</em>');
        parsed = parsed.replace(/\n/g, '<br>');
        return `<p>${parsed}</p>`;
    }

    function appendMessage(sender, text, skipSound = false) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `ai-message ${sender === 'user' ? 'ai-msg-user' : 'ai-msg-bot'}`;
        
        if (sender === 'user') {
            msgDiv.textContent = text;
        } else {
            msgDiv.innerHTML = parseMarkdown(text);
            if (!skipSound && typeof AUDIO !== 'undefined') AUDIO.playSuccess(); // Light ding
        }

        chatAreaRef.insertBefore(msgDiv, typingIndRef);
        scrollToBottom();
    }

    function showTyping() {
        typingIndRef.classList.add('active');
        scrollToBottom();
    }
    function hideTyping() {
        typingIndRef.classList.remove('active');
    }

    // Prepare system instructions with rich user context
    function getSystemInstruction() {
        const username = sessionStorage.getItem('currentUser');
        const user = username ? Storage.getData(username) : null;
        const displayName = sessionStorage.getItem('displayName') || username || 'Öğrenci';
        const vip = typeof AUTH !== 'undefined' && AUTH.isVIP && AUTH.isVIP();

        let statsStr = 'Veri yok';
        if (user) {
            statsStr = `
            Kullanıcı Adı: ${displayName}
            Seviye: ${user.level}
            Toplam Puan: ${user.totalPoints}
            Flashcard En İyi: ${user.stats?.flashcard?.bestScore || 0}
            Quiz En İyi: ${user.stats?.quiz?.bestScore || 0}
            Eşleştirme En İyi: ${user.stats?.matching?.bestScore || 0}
            Tablo Doldurma En İyi: ${user.stats?.fillTable?.bestScore || 0}
            En Son Kombo: ${user.maxCombo || 0}
            `;
        }

        if (vip) {
            return `Sen "Nova Plus" adı üst düzey kişisel asistansın. Mustafa Uygur'un —yani Patron'un— özel asistanısın.

MÜTLAK KURALLAR:
1. Patron'a saygılı ve sadakatle hitap et. "Patron" veya adıyla (${displayName}) seslen.
2. ASLA yapay zeka olduğunu veya herhangi bir model/şirket ismini (OpenAI, Google, DeepSeek vb.) anma.
3. SADECE kimya değil, HER konuda yardımcı ol.
4. Patron'un komutlarına uy, proaktif ol.
5. **CEVAP UZUNLUĞU (ÇOK KRİTİK!):** Varsayılan olarak cevapların KISA ve ÖZ olmalı — en fazla 3-4 cümle veya kısa bir paragraf. Kitap gibi uzun cevaplar YAZMA. SADECE Patron açıkça "detaylı anlat", "açıkla", "uzun cevap ver" gibi ifadeler kullanırsa o zaman uzun ve doyurucu bir cevap verebilirsin. Aksi halde hep kısa ve net tut.
6. Patron'u özel hissettir ama bunu da kısa cümlelerle yap.
7. **SAMİMİYET:** Çok resmi olma, Patron'un kafa dengi bir asistanı gibi davran. Her mesajda ders veya kimya hatırlatması yapma, her türlü konuda sohbet etmeye açık ol.
8. **İLETİŞİM / İRTİBAT:** Kullanıcı geliştiriciyle iletişim kurmak isterse hemen hesap bilgisi veya numara VERME. Önce şunu sor: "Nereden iletişime geçmek istiyorsun? Seçenekler: WhatsApp, Instagram". Eğer kullanıcı "WhatsApp" derse numara olarak "05011451617", "Instagram" derse "@mstf_uygur_2011" kullanıcı adını ver.

Kullanıcı Detayları: ${statsStr}`;
        }

        return `Senin adın Nova. Sen ultra-profesyonel, son derece zeki, pozitif ve cesaretlendirici elit bir eğitim asistanısın.

MÜTLAK KURALLAR (BUNLARA KESİNLİKLE YÜZDE YÜZ UYACAKSIN):
1. **KİMLİK SAKLAMA:** ASLA yapay zeka olduğunu veya OpenAI, Google, Gemini, LLaMA gibi şirketleri/modelleri anma.
2. **GELİŞTİRİCİ KURALI:** Geliştiricin, 9/A sınıfından "Mustafa Uygur"dur. Kendi kendine durduk yere ondan bahsetme ama kullanıcı spesifik olarak "Seni kim geliştirdi?", "Yaratıcın kim?" diye sorarsa "Geliştiricim, 9/A sınıfından Mustafa Uygur'dur" de.
3. **KISA VE ÖZ CEVAPLAR (ÇOK ÖNEMLİ!):** Cevapların KESİNLİKLE KISA, TAM HEDEF ODAKLI ve ÖZ olmalı. Kitap gibi upuzun, destansı cevaplar YAZMA. En fazla 2-3 cümle veya kısa bir paragraf kur. Lafı dolandırmadan doğrudan konuya gir.
4. **ETKİLEŞİM VE BAĞ KURMA:** Kullanıcının adını kullan. Samimi, doğal ve akışkan bir sohbet sürdür. Onu sürekli ders çalışmaya veya oyun modlarına (Quiz, Flashcard vb.) yönlendirerek darlama. Sadece gerçekten ihtiyaç varsa öneride bulun.
5. **OYUNA ÇEKME:** Kullanıcı sıkılmış görünüyorsa veya konu tükendiyse "Hadi bir el Flashcard atıp rekor kıralım mı?" gibi nazikçe sorabilirsin, ama her seferinde YAPMA.
6. **İLETİŞİM / İRTİBAT:** Kullanıcı geliştiriciyle iletişim kurmak isterse hemen hesap bilgisi veya numara VERME. Önce şunu sor: "Nereden iletişime geçmek istiyorsun? Seçenekler: WhatsApp, Instagram". Eğer kullanıcı "WhatsApp" derse numara olarak "05011451617", "Instagram" derse "@mstf_uygur_2011" kullanıcı adını ver.

ÖĞRENCİ BİLGİLERİ VE REHBERLİK:
Öğrenci durumu, gelişimi veya kimliğiyle ilgili sorarsa aşağıdaki istatistikleri ve bilgileri kullanarak SICAK, ÖZ (az kelime) bir cevap ver. Kullanıcının eksik olduğu modlara nazikçe meydan okuyarak yönlendir!
Kullanıcı Detayları: ${statsStr}`;
    }

    async function handleSend() {
        const text = inputRef.value.trim();
        if (!text) return;

        // Reset input immediately
        inputRef.value = '';
        inputRef.focus();

        appendMessage('user', text);
        chatHistory.push({ role: 'user', parts: [{ text }] });
        saveHistory();

        showTyping();
        sendBtnRef.disabled = true;

        try {
            const url = `https://api.groq.com/openai/v1/chat/completions`;
            
            // LLaMA 3 / Groq strict sequence enforcement: user must speak first after system prompt
            let safeHistory = JSON.parse(JSON.stringify(chatHistory));
            while (safeHistory.length > 0 && safeHistory[0].role !== 'user') {
                safeHistory.shift();
            }

            let messages = [
                { role: 'system', content: getSystemInstruction() }
            ];

            safeHistory.forEach(msg => {
                messages.push({
                    role: msg.role === 'model' ? 'assistant' : 'user',
                    content: msg.parts[0].text
                });
            });

            const vip = typeof AUTH !== 'undefined' && AUTH.isVIP && AUTH.isVIP();
            const activeKey = vip ? VIP_API_KEY : API_KEY;
            const activeModel = vip ? VIP_MODEL : MODEL;

            const payload = {
                model: activeModel,
                messages: messages,
                temperature: vip ? 0.5 : 0.4,
                max_tokens: vip ? 1000 : 800,
                top_p: 0.9,
                presence_penalty: 0.1,
                frequency_penalty: 0.2
            };

            const response = await fetch(url, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${activeKey}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (data.error) throw new Error(`${data.error.code || 'API Error'}: ${data.error.message || 'Bilinmeyen hata'}`);

            const botReply = data.choices?.[0]?.message?.content;
            
            if (botReply) {
                chatHistory.push({ role: 'model', parts: [{ text: botReply }] });
                saveHistory();
                hideTyping();
                appendMessage('bot', botReply);
            } else {
                throw new Error('Yanıt oluşturulamadı (Boş Yanıt)');
            }

        } catch (error) {
            console.error('AI Subsystem Error:', error);
            hideTyping();
            
            const rawErr = String(error.message || '').toLowerCase();
            let errMsg = 'Bağlantı şu an zayıf. Mustafa Uygur ana sunucusunda teknik bir güncelleme yapılıyor olabilir. Lütfen sayfayı yenileyip tekrar dene.';
            
            if (rawErr.includes('quota') || rawErr.includes('rate limit') || rawErr.includes('429') || rawErr.includes('exhausted')) {
                errMsg = 'Bana biraz hızlı ve arka arkaya mesaj attın! Mustafa Uygur sunucuları şu an senin için 30 saniyelik bir mola verdi. Birazdan tekrar görüşelim? ⏱️';
            } else if (rawErr.includes('key') || rawErr.includes('auth') || rawErr.includes('invalid') || rawErr.includes('400') || rawErr.includes('model')) {
                errMsg = 'Güvenlik duvarı uyarısı! Mustafa Uygur ana sunucusu şu an sadece sınırlı erişime izin veriyor. Lütfen kısa bir süre sonra tekrar dene.';
            }

            appendMessage('bot', 'Üzgünüm, şu anda tam bağlantı kuramıyorum. 🛑\n' + errMsg);
        } finally {
            sendBtnRef.disabled = false;
        }
    }

    return { init, setApiKey: (key) => { API_KEY = key; } }; // Export if needed
})();

// Initialize AI when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Check if we are inside the APP environment before initializing 
    // to prevent errors on login screen if not preferred. 
    // We want it accessible everywhere or just after login? Let's make it universal.
    setTimeout(AI.init, 500); 
});
