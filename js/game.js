// ============================================
// GAME.JS — All Game Mode Logic
// Ramazan Hoca'nın Kimya Sınıfı
// ============================================

const Game = (() => {
    let currentMode = null;
    let currentDifficulty = null;
    let currentTable = null;
    let currentQuestions = [];
    let currentIndex = 0;
    let score = 0;
    let combo = 0;
    let maxCombo = 0;
    let wrongAnswers = [];
    let timer = null;
    let timeLeft = 0;
    let totalTime = 0;
    let gameStartTime = null;
    let isRetryMode = false;
    let tournamentState = null;

    // ============ FLASHCARD MODE ============
    function startFlashcard(table, difficulty) {
        currentMode = 'flashcard';
        currentDifficulty = difficulty;
        currentTable = table;
        score = 0;
        combo = 0;
        maxCombo = 0;
        wrongAnswers = [];
        currentIndex = 0;
        gameStartTime = Date.now();

        const tableData = TABLES[table];
        let items = [...tableData.items];
        items = shuffleArray(items);

        if (difficulty === 'kolay') {
            currentQuestions = items.slice(0, Math.min(6, items.length)).map(item => ({
                front: item.symbol,
                back: item.name,
                item: item
            }));
        } else if (difficulty === 'orta') {
            currentQuestions = items.slice(0, Math.min(10, items.length)).map(item => ({
                front: item.name,
                back: item.symbol,
                item: item
            }));
            timeLeft = 120;
            startTimer();
        } else {
            currentQuestions = items.map(item => {
                const showSymbol = Math.random() > 0.5;
                return {
                    front: showSymbol ? item.symbol : item.name,
                    back: showSymbol ? item.name : item.symbol,
                    item: item
                };
            });
            timeLeft = 90;
            startTimer();
        }

        renderFlashcard();
    }

    function renderFlashcard() {
        const container = document.getElementById('main-content');
        const q = currentQuestions[currentIndex];
        const total = currentQuestions.length;
        const progress = ((currentIndex) / total) * 100;
        const username = AUTH.getCurrentUser();
        const displayName = AUTH.getDisplayName(username);

        container.innerHTML = `
            <div class="game-screen flashcard-screen">
                <div class="game-header">
                    <button class="btn btn-ghost btn-back" onclick="Game.exitGame()">
                        <span class="btn-icon">←</span> Çık
                    </button>
                    <div class="game-info">
                        <span class="card-counter">${currentIndex + 1} / ${total}</span>
                        ${combo >= 3 ? `<span class="combo-badge">🔥 x${combo}</span>` : ''}
                    </div>
                    ${timeLeft > 0 ? `<div class="timer-display" id="timer-display">⏱️ ${formatTime(timeLeft)}</div>` : '<div></div>'}
                </div>
                
                <div class="progress-bar-container">
                    <div class="progress-bar-fill" style="width: ${progress}%"></div>
                </div>

                <div class="flashcard-container" onclick="Game.flipCurrentCard()">
                    <div class="flashcard ${currentQuestions[currentIndex]._flipped ? 'flipped' : ''}" id="flashcard">
                        <div class="flashcard-front">
                            <div class="flashcard-label">${currentDifficulty === 'kolay' ? 'Sembol' : currentDifficulty === 'orta' ? 'Ad' : '❓'}</div>
                            <div class="flashcard-text">${q.front}</div>
                            <div class="flashcard-hint">Cevabı görmek için dokun</div>
                        </div>
                        <div class="flashcard-back">
                            <div class="flashcard-label">Cevap</div>
                            <div class="flashcard-text">${q.back}</div>
                            ${q.item.charges ? `<div class="flashcard-extra">Yükler: ${q.item.charges.join(', ')}</div>` : ''}
                            ${q.item.charge ? `<div class="flashcard-extra">Yük: ${q.item.charge}</div>` : ''}
                            ${q.item.number ? `<div class="flashcard-extra">Atom No: ${q.item.number}</div>` : ''}
                        </div>
                    </div>
                </div>

                <div class="flashcard-actions">
                    <button class="btn btn-wrong" onclick="Game.flashcardAnswer(false)">
                        Bilmedim ❌
                    </button>
                    <button class="btn btn-correct" onclick="Game.flashcardAnswer(true)">
                        Bildim ✅
                    </button>
                </div>
            </div>
        `;

        const cards = container.querySelectorAll('.flashcard-container, .btn');
        Animations.staggeredEntrance(Array.from(cards), 100);
        Animations.initRipples();
        
        // Update daily goal
        Storage.updateDailyGoal(username);
    }

    function flipCurrentCard() {
        if (typeof AUDIO !== 'undefined') AUDIO.playClick();
        const card = document.getElementById('flashcard');
        if (card) {
            card.classList.toggle('flipped');
            currentQuestions[currentIndex]._flipped = !currentQuestions[currentIndex]._flipped;
        }
    }

    function flashcardAnswer(knew) {
        if (knew) {
            if (typeof AUDIO !== 'undefined') AUDIO.playCorrect();
            score++;
            combo++;
            if (combo > maxCombo) maxCombo = combo;
            if (combo === 3 || combo === 5 || combo === 10) {
                Animations.comboEffect(combo);
            }
            Animations.correctWave(document.querySelector('.flashcard-container'));
        } else {
            if (typeof AUDIO !== 'undefined') AUDIO.playWrong();
            combo = 0;
            wrongAnswers.push({
                question: currentQuestions[currentIndex].front,
                correct: currentQuestions[currentIndex].back,
                userAnswer: 'Bilmedi',
                table: currentTable
            });
            Animations.shake(document.querySelector('.flashcard-container'));
        }

        currentIndex++;
        if (currentIndex >= currentQuestions.length) {
            finishGame();
        } else {
            currentQuestions[currentIndex]._flipped = false;
            renderFlashcard();
        }
    }

    // ============ QUIZ MODE ============
    function startQuiz(table, difficulty, retryQuestions) {
        currentMode = 'quiz';
        currentDifficulty = difficulty;
        currentTable = table;
        score = 0;
        combo = 0;
        maxCombo = 0;
        wrongAnswers = [];
        currentIndex = 0;
        gameStartTime = Date.now();
        isRetryMode = !!retryQuestions;

        if (retryQuestions) {
            currentQuestions = shuffleArray(retryQuestions);
        } else {
            let questions = [...QUESTION_BANKS[table]];
            questions = shuffleArray(questions);

            if (difficulty === 'kolay') {
                currentQuestions = questions.slice(0, 10);
                timeLeft = 0;
            } else if (difficulty === 'orta') {
                currentQuestions = questions.slice(0, 20);
                timeLeft = 30;
            } else {
                // Mix questions from all tables
                let allQuestions = [];
                Object.keys(QUESTION_BANKS).forEach(key => {
                    allQuestions = allQuestions.concat(QUESTION_BANKS[key].slice(0, 10));
                });
                currentQuestions = shuffleArray(allQuestions).slice(0, 30);
                timeLeft = 15;
            }
        }

        renderQuiz();
    }

    function renderQuiz() {
        const container = document.getElementById('main-content');
        const q = currentQuestions[currentIndex];
        const total = currentQuestions.length;
        const progress = ((currentIndex) / total) * 100;

        let timerHTML = '';
        if (currentDifficulty !== 'kolay' && !isRetryMode) {
            if (!timer) startQuizTimer();
            timerHTML = `<div class="timer-display ${timeLeft <= 5 ? 'timer-danger' : ''}" id="timer-display">⏱️ ${timeLeft}s</div>`;
        }

        container.innerHTML = `
            <div class="game-screen quiz-screen">
                <div class="game-header">
                    <button class="btn btn-ghost btn-back" onclick="Game.exitGame()">
                        <span class="btn-icon">←</span> Çık
                    </button>
                    <div class="game-info">
                        <span class="card-counter">Soru ${currentIndex + 1} / ${total}</span>
                        ${combo >= 3 ? `<span class="combo-badge">🔥 x${combo}</span>` : ''}
                    </div>
                    ${timerHTML || '<div></div>'}
                </div>
                
                <div class="progress-bar-container">
                    <div class="progress-bar-fill" style="width: ${progress}%"></div>
                </div>

                <div class="quiz-question-container" id="quiz-container">
                    <div class="quiz-question">
                        <span class="question-number">Soru ${currentIndex + 1}</span>
                        <h2 class="question-text">${q.question}</h2>
                    </div>

                    <div class="quiz-options">
                        ${q.options.map((opt, idx) => `
                            <button class="btn quiz-option" onclick="Game.quizAnswer('${opt.replace(/'/g, "\\'")}', this)" id="opt-${idx}">
                                <span class="option-letter">${String.fromCharCode(65 + idx)}</span>
                                <span class="option-text">${opt}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>

                <div class="score-display">
                    Puan: <span class="score-value">${score}</span> / ${total}
                </div>
            </div>
        `;

        const options = container.querySelectorAll('.quiz-option');
        Animations.staggeredEntrance(Array.from(options), 80);
        Animations.initRipples();
    }

    function quizAnswer(answer, buttonEl) {
        const q = currentQuestions[currentIndex];
        const allButtons = document.querySelectorAll('.quiz-option');
        allButtons.forEach(btn => btn.disabled = true);

        clearQuizTimer();

        if (answer === q.correct) {
            if (typeof AUDIO !== 'undefined') AUDIO.playCorrect();
            score++;
            combo++;
            if (combo > maxCombo) maxCombo = combo;
            buttonEl.classList.add('option-correct');
            Animations.correctWave(document.getElementById('quiz-container'));
            
            if (combo === 3 || combo === 5 || combo === 10) {
                Animations.comboEffect(combo);
            }

            Animations.scorePop(buttonEl, 10);
        } else {
            if (typeof AUDIO !== 'undefined') AUDIO.playWrong();
            combo = 0;
            buttonEl.classList.add('option-wrong');
            Animations.wrongAnswer(buttonEl);
            
            // Show correct answer
            allButtons.forEach(btn => {
                if (btn.querySelector('.option-text').textContent === q.correct) {
                    btn.classList.add('option-correct');
                }
            });

            wrongAnswers.push({
                question: q.question,
                correct: q.correct,
                userAnswer: answer,
                table: currentTable,
                options: q.options
            });
        }

        setTimeout(() => {
            currentIndex++;
            if (currentIndex >= currentQuestions.length) {
                finishGame();
            } else {
                if (currentDifficulty === 'orta') timeLeft = 30;
                if (currentDifficulty === 'zor') timeLeft = 15;
                renderQuiz();
            }
        }, 1200);
    }

    function startQuizTimer() {
        clearQuizTimer();
        timer = setInterval(() => {
            timeLeft--;
            const display = document.getElementById('timer-display');
            if (display) {
                display.textContent = `⏱️ ${timeLeft}s`;
                if (timeLeft <= 5) display.classList.add('timer-danger');
            }
            if (timeLeft <= 0) {
                clearQuizTimer();
                // Auto-wrong for timeout
                const q = currentQuestions[currentIndex];
                combo = 0;
                wrongAnswers.push({
                    question: q.question,
                    correct: q.correct,
                    userAnswer: 'Süre doldu',
                    table: currentTable,
                    options: q.options
                });
                currentIndex++;
                if (currentIndex >= currentQuestions.length) {
                    finishGame();
                } else {
                    if (currentDifficulty === 'orta') timeLeft = 30;
                    if (currentDifficulty === 'zor') timeLeft = 15;
                    renderQuiz();
                }
            }
        }, 1000);
    }

    function clearQuizTimer() {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
    }

    // ============ FILL TABLE MODE ============
    function startFillTable(table, difficulty) {
        currentMode = 'fillTable';
        currentDifficulty = difficulty;
        currentTable = table;
        score = 0;
        combo = 0;
        maxCombo = 0;
        wrongAnswers = [];
        gameStartTime = Date.now();

        const tableData = TABLES[table];
        let items = [...tableData.items];
        
        let emptyCount;
        if (difficulty === 'kolay') emptyCount = 3;
        else if (difficulty === 'orta') emptyCount = 6;
        else emptyCount = Math.ceil(items.length / 2);

        // Choose random cells to be empty
        const indices = shuffleArray(items.map((_, i) => i)).slice(0, emptyCount);
        
        currentQuestions = items.map((item, i) => ({
            ...item,
            isEmpty: indices.includes(i),
            userAnswer: ''
        }));

        renderFillTable();
    }

    function renderFillTable() {
        const container = document.getElementById('main-content');
        const tableData = TABLES[currentTable];
        const emptyCount = currentQuestions.filter(q => q.isEmpty).length;

        container.innerHTML = `
            <div class="game-screen fill-screen">
                <div class="game-header">
                    <button class="btn btn-ghost btn-back" onclick="Game.exitGame()">
                        <span class="btn-icon">←</span> Çık
                    </button>
                    <div class="game-info">
                        <span class="card-counter">${tableData.name} - Boş Tablo</span>
                    </div>
                    <div class="difficulty-badge">${currentDifficulty === 'kolay' ? '🟢 Kolay' : currentDifficulty === 'orta' ? '🟡 Orta' : '🔴 Zor'}</div>
                </div>

                <div class="fill-table-container">
                    <table class="fill-table">
                        <thead>
                            <tr>
                                <th>Sembol</th>
                                <th>Ad</th>
                                ${currentTable === 'metaller' ? '<th>Yükler</th>' : ''}
                                ${currentTable === 'ilk20' ? '<th>Atom No</th>' : ''}
                                ${currentTable !== 'metaller' && currentTable !== 'ilk20' ? '<th>Yük</th>' : ''}
                            </tr>
                        </thead>
                        <tbody>
                            ${currentQuestions.map((item, idx) => `
                                <tr class="fill-row ${item.isEmpty ? 'fill-empty' : ''}" data-index="${idx}">
                                    <td class="fill-cell">
                                        ${item.isEmpty && Math.random() > 0.5 ? 
                                            `<input type="text" class="fill-input" data-field="symbol" data-index="${idx}" placeholder="?" autocomplete="off">` : 
                                            `<span class="fill-value">${item.symbol}</span>`}
                                    </td>
                                    <td class="fill-cell">
                                        ${item.isEmpty && (document.querySelector(`[data-field="symbol"][data-index="${idx}"]`) || Math.random() <= 0.5) ? 
                                            `<input type="text" class="fill-input" data-field="name" data-index="${idx}" placeholder="?" autocomplete="off">` : 
                                            item.isEmpty ? `<input type="text" class="fill-input" data-field="name" data-index="${idx}" placeholder="?" autocomplete="off">` :
                                            `<span class="fill-value">${item.name}</span>`}
                                    </td>
                                    ${currentTable === 'metaller' ? `
                                        <td class="fill-cell">
                                            <span class="fill-value">${item.charges ? item.charges.join(', ') : ''}</span>
                                        </td>` : ''}
                                    ${currentTable === 'ilk20' ? `
                                        <td class="fill-cell">
                                            <span class="fill-value">${item.number || ''}</span>
                                        </td>` : ''}
                                    ${currentTable !== 'metaller' && currentTable !== 'ilk20' ? `
                                        <td class="fill-cell">
                                            <span class="fill-value">${item.charge || ''}</span>
                                        </td>` : ''}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <button class="btn btn-primary btn-lg btn-check" onclick="Game.checkFillTable()">
                    Kontrol Et ✔️
                </button>
            </div>
        `;

        Animations.initRipples();
    }

    function checkFillTable() {
        const inputs = document.querySelectorAll('.fill-input');
        let correct = 0;
        let total = inputs.length;

        inputs.forEach(input => {
            const idx = parseInt(input.dataset.index);
            const field = input.dataset.field;
            const item = currentQuestions[idx];
            const userAnswer = input.value.trim();
            const correctAnswer = field === 'symbol' ? item.symbol : item.name;

            if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
                correct++;
                combo++;
                if (combo > maxCombo) maxCombo = combo;
                input.classList.add('fill-correct');
                input.disabled = true;
            } else {
                combo = 0;
                input.classList.add('fill-wrong');
                // Show correct answer
                const tooltip = document.createElement('span');
                tooltip.className = 'fill-correction';
                tooltip.textContent = correctAnswer;
                input.parentElement.appendChild(tooltip);

                wrongAnswers.push({
                    question: `${field === 'symbol' ? 'Sembol' : 'Ad'}: ${item.name || item.symbol}`,
                    correct: correctAnswer,
                    userAnswer: userAnswer || '(boş)',
                    table: currentTable
                });
            }
        });

        score = correct;
        currentQuestions._total = total;

        if (combo >= 3) Animations.comboEffect(combo);
        
        if (typeof AUDIO !== 'undefined') {
            if (correct === total) AUDIO.playSuccess();
            else if (correct >= total/2) AUDIO.playCorrect();
            else AUDIO.playWrong();
        }

        // Show finish after delay
        setTimeout(() => {
            finishGame(total);
        }, 2000);
    }

    // ============ MATCHING MODE ============
    function startMatching(table, difficulty) {
        currentMode = 'matching';
        currentDifficulty = difficulty;
        currentTable = table;
        score = 0;
        combo = 0;
        maxCombo = 0;
        wrongAnswers = [];
        gameStartTime = Date.now();

        const tableData = TABLES[table];
        let items = shuffleArray([...tableData.items]);

        let pairCount;
        if (difficulty === 'kolay') pairCount = 5;
        else if (difficulty === 'orta') pairCount = Math.min(10, items.length);
        else pairCount = items.length;

        items = items.slice(0, pairCount);
        
        currentQuestions = {
            left: items.map((item, i) => ({ id: i, text: item.symbol, matched: false })),
            right: shuffleArray(items.map((item, i) => ({ id: i, text: item.name, matched: false }))),
            total: items.length
        };

        if (difficulty !== 'kolay') {
            timeLeft = difficulty === 'orta' ? 120 : 60;
            startTimer();
        }

        renderMatching();
    }

    function renderMatching() {
        const container = document.getElementById('main-content');
        const matched = currentQuestions.left.filter(l => l.matched).length;
        const total = currentQuestions.total;
        const progress = (matched / total) * 100;

        container.innerHTML = `
            <div class="game-screen matching-screen">
                <div class="game-header">
                    <button class="btn btn-ghost btn-back" onclick="Game.exitGame()">
                        <span class="btn-icon">←</span> Çık
                    </button>
                    <div class="game-info">
                        <span class="card-counter">Eşleştirme: ${matched} / ${total}</span>
                        ${combo >= 3 ? `<span class="combo-badge">🔥 x${combo}</span>` : ''}
                    </div>
                    ${timeLeft > 0 ? `<div class="timer-display" id="timer-display">⏱️ ${formatTime(timeLeft)}</div>` : '<div></div>'}
                </div>
                
                <div class="progress-bar-container">
                    <div class="progress-bar-fill" style="width: ${progress}%"></div>
                </div>

                <div class="matching-container">
                    <div class="matching-column matching-left">
                        <h3 class="matching-title">Semboller</h3>
                        ${currentQuestions.left.map(item => `
                            <div class="matching-item ${item.matched ? 'matched' : ''} ${item.selected ? 'selected' : ''}" 
                                 data-side="left" data-id="${item.id}" 
                                 onclick="Game.selectMatch(this)">
                                ${item.text}
                            </div>
                        `).join('')}
                    </div>
                    <div class="matching-lines" id="matching-lines"></div>
                    <div class="matching-column matching-right">
                        <h3 class="matching-title">Adlar</h3>
                        ${currentQuestions.right.map(item => `
                            <div class="matching-item ${item.matched ? 'matched' : ''} ${item.selected ? 'selected' : ''}" 
                                 data-side="right" data-id="${item.id}" 
                                 onclick="Game.selectMatch(this)">
                                ${item.text}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        const items = container.querySelectorAll('.matching-item:not(.matched)');
        Animations.staggeredEntrance(Array.from(items), 50);
    }

    let selectedLeft = null;
    let selectedRight = null;

    function selectMatch(element) {
        if (typeof AUDIO !== 'undefined') AUDIO.playClick();
        const side = element.dataset.side;
        const id = parseInt(element.dataset.id);

        if (element.classList.contains('matched')) return;

        if (side === 'left') {
            // Deselect previous
            document.querySelectorAll('.matching-left .matching-item').forEach(el => el.classList.remove('selected'));
            element.classList.add('selected');
            selectedLeft = id;
        } else {
            document.querySelectorAll('.matching-right .matching-item').forEach(el => el.classList.remove('selected'));
            element.classList.add('selected');
            selectedRight = id;
        }

        // Check match
        if (selectedLeft !== null && selectedRight !== null) {
            if (selectedLeft === selectedRight) {
                // Correct match!
                if (typeof AUDIO !== 'undefined') AUDIO.playCorrect();
                score++;
                combo++;
                if (combo > maxCombo) maxCombo = combo;
                
                currentQuestions.left.find(l => l.id === selectedLeft).matched = true;
                currentQuestions.right.find(r => r.id === selectedRight).matched = true;

                // Animate
                const leftEl = document.querySelector(`.matching-left [data-id="${selectedLeft}"]`);
                const rightEl = document.querySelector(`.matching-right [data-id="${selectedRight}"]`);
                if (leftEl) {
                    leftEl.classList.add('matched');
                    Animations.correctWave(leftEl);
                }
                if (rightEl) {
                    rightEl.classList.add('matched');
                    Animations.correctWave(rightEl);
                }

                if (combo === 3 || combo === 5 || combo === 10) {
                    Animations.comboEffect(combo);
                }

                Animations.scorePop(element, 10);

                // Check if all matched
                const allMatched = currentQuestions.left.every(l => l.matched);
                if (allMatched) {
                    clearTimer();
                    setTimeout(() => finishGame(), 500);
                }
            } else {
                // Wrong match
                if (typeof AUDIO !== 'undefined') AUDIO.playWrong();
                combo = 0;
                const leftEl = document.querySelector(`.matching-left [data-id="${selectedLeft}"]`);
                const rightEl = document.querySelector(`.matching-right [data-id="${selectedRight}"]`);
                if (leftEl) Animations.shake(leftEl);
                if (rightEl) Animations.shake(rightEl);

                setTimeout(() => {
                    document.querySelectorAll('.matching-item').forEach(el => el.classList.remove('selected'));
                }, 500);

                const leftItem = currentQuestions.left.find(l => l.id === selectedLeft);
                const rightItem = currentQuestions.right.find(r => r.id === selectedRight);
                let matchedItem = currentQuestions.right.find(r => r.id === selectedLeft);
                wrongAnswers.push({
                    question: leftItem.text,
                    correct: matchedItem ? matchedItem.text : '?',
                    userAnswer: rightItem.text,
                    table: currentTable
                });
            }
            selectedLeft = null;
            selectedRight = null;
        }
    }

    // ============ TIMER ============
    function startTimer() {
        clearTimer();
        timer = setInterval(() => {
            timeLeft--;
            const display = document.getElementById('timer-display');
            if (display) {
                display.textContent = `⏱️ ${formatTime(timeLeft)}`;
                if (timeLeft <= 10) display.classList.add('timer-danger');
            }
            if (timeLeft <= 0) {
                clearTimer();
                finishGame();
            }
        }, 1000);
    }

    function clearTimer() {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
    }

    function formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    // ============ FINISH GAME ============
    function finishGame(overrideTotal) {
        clearTimer();
        clearQuizTimer();

        // Tournament mode redirect
        if (tournamentState) {
            finishTournamentRound(overrideTotal);
            return;
        }
        
        const timeSpent = Math.round((Date.now() - gameStartTime) / 1000);
        const total = overrideTotal || currentQuestions.length || currentQuestions.total || 0;
        const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
        const username = AUTH.getCurrentUser();

        // Update stats
        const result = Storage.updateGameStats(username, currentMode, score, total, maxCombo, wrongAnswers, timeSpent);
        
        // Update table progress
        if (currentTable) {
            Storage.updateTableProgress(username, currentTable, percentage);
        }

        renderResults(score, total, percentage, result.pointsEarned, result.newBadges, timeSpent);
    }

    function renderResults(score, total, percentage, pointsEarned, newBadges, timeSpent) {
        const container = document.getElementById('main-content');
        const username = AUTH.getCurrentUser();
        const displayName = AUTH.getDisplayName(username);

        let emoji, messagePool;
        if (percentage === 100) {
            emoji = '🏆';
            messagePool = RESULT_MESSAGES.perfect;
            if (typeof AUDIO !== 'undefined') AUDIO.playSuccess();
        } else if (percentage >= 70) {
            emoji = '🎉';
            messagePool = RESULT_MESSAGES.great;
            if (typeof AUDIO !== 'undefined') AUDIO.playSuccess();
        } else if (percentage >= 50) {
            emoji = '💪';
            messagePool = RESULT_MESSAGES.good;
        } else {
            emoji = '📚';
            messagePool = RESULT_MESSAGES.needsWork;
        }

        const message = messagePool[Math.floor(Math.random() * messagePool.length)].replace('{name}', displayName);

        container.innerHTML = `
            <div class="game-screen results-screen">
                <div class="results-emoji">${emoji}</div>
                <h2 class="results-title">${isRetryMode ? 'Tekrar Sonuçları' : 'Oyun Bitti!'}</h2>
                
                <div class="results-score-container">
                    <div class="results-circle">
                        <svg class="progress-ring" width="160" height="160">
                            <circle class="progress-ring-bg" cx="80" cy="80" r="70" />
                            <circle class="progress-ring-circle" cx="80" cy="80" r="70" />
                        </svg>
                        <div class="results-percentage" id="results-percentage">0</div>
                    </div>
                    <div class="results-fraction">
                        <span id="results-score">0</span> / ${total}
                    </div>
                </div>

                <div class="results-message">${message}</div>

                <div class="results-stats">
                    <div class="results-stat">
                        <span class="stat-icon">⭐</span>
                        <span class="stat-value" id="stat-points">0</span>
                        <span class="stat-label">Puan</span>
                    </div>
                    <div class="results-stat">
                        <span class="stat-icon">🔥</span>
                        <span class="stat-value">${maxCombo}</span>
                        <span class="stat-label">Max Kombo</span>
                    </div>
                    <div class="results-stat">
                        <span class="stat-icon">⏱️</span>
                        <span class="stat-value">${Storage.formatStudyTime(timeSpent)}</span>
                        <span class="stat-label">Süre</span>
                    </div>
                </div>

                ${newBadges.length > 0 ? `
                    <div class="new-badges-section">
                        <h3>🎖️ Yeni Rozetler!</h3>
                        <div class="new-badges-grid">
                            ${newBadges.map(b => `
                                <div class="new-badge-card">
                                    <span class="badge-big-icon">${b.icon}</span>
                                    <span class="badge-title">${b.name}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                <div class="results-actions">
                    ${wrongAnswers.length > 0 ? `
                        <button class="btn btn-warning btn-lg" onclick="Game.retryWrong()">
                            Yanlışlarını Tekrar Et 🔁
                        </button>
                    ` : ''}
                    <button class="btn btn-primary btn-lg" onclick="Game.playAgain()">
                        Tekrar Oyna 🎮
                    </button>
                    <button class="btn btn-secondary btn-lg" onclick="APP.navigate('dashboard')">
                        Ana Menü 🏠
                    </button>
                </div>
            </div>
        `;

        // Animate
        setTimeout(() => {
            Animations.animateCounter(document.getElementById('results-percentage'), percentage);
            Animations.animateCounter(document.getElementById('results-score'), score);
            Animations.animateCounter(document.getElementById('stat-points'), pointsEarned);
            Animations.animateCircularProgress(document.querySelector('.results-circle'), percentage);
        }, 300);

        if (percentage === 100) {
            setTimeout(() => Animations.confetti(), 500);
        }

        if (newBadges.length > 0) {
            newBadges.forEach((badge, i) => {
                setTimeout(() => Animations.badgeEarned(badge), 1000 + i * 2000);
            });
        }

        const cards = container.querySelectorAll('.results-stat, .btn, .new-badge-card');
        Animations.staggeredEntrance(Array.from(cards), 100);
    }

    function retryWrong() {
        if (currentMode === 'quiz') {
            isRetryMode = true;
            const retryQuestions = wrongAnswers.map(w => ({
                question: w.question,
                correct: w.correct,
                options: w.options || generateOptions(w.correct, [w.correct, w.userAnswer, '?', '??']),
                type: 'retry'
            }));
            startQuiz(currentTable, 'kolay', retryQuestions);
        } else {
            // For other modes, restart
            playAgain();
        }
    }

    function playAgain() {
        if (currentMode === 'flashcard') startFlashcard(currentTable, currentDifficulty);
        else if (currentMode === 'quiz') startQuiz(currentTable, currentDifficulty);
        else if (currentMode === 'fillTable') startFillTable(currentTable, currentDifficulty);
        else if (currentMode === 'matching') startMatching(currentTable, currentDifficulty);
    }

    function exitGame() {
        clearTimer();
        clearQuizTimer();
        if (tournamentState) {
            tournamentState = null;
        }
        APP.navigate('dashboard');
    }

    // ============ TOURNAMENT MODE ============
    function getModeEmoji(mode) {
        return { flashcard: '🃏', quiz: '🧪', fillTable: '📝', matching: '🔗' }[mode] || '🎮';
    }
    function getModeName(mode) {
        return { flashcard: 'Flashcard', quiz: 'Quiz', fillTable: 'Tablo Doldur', matching: 'Eşleştirme' }[mode] || mode;
    }
    function getDiffName(diff) {
        return { kolay: '🟢 Kolay', orta: '🟡 Orta', zor: '🔴 Zor' }[diff] || diff;
    }

    function initTournament(config) {
        tournamentState = {
            groups: config.groups,
            currentGroupIndex: 0,
            mode: config.mode,
            difficulty: config.difficulty,
            table: config.table,
            sharedData: null,
            results: []
        };
        tournamentState.sharedData = prepareTournamentData(config.mode, config.table, config.difficulty);
        renderGroupSplash();
    }

    function prepareTournamentData(mode, table, difficulty) {
        if (mode === 'quiz') {
            let questions;
            if (difficulty === 'zor') {
                let allQ = [];
                Object.keys(QUESTION_BANKS).forEach(key => {
                    allQ = allQ.concat(QUESTION_BANKS[key].slice(0, 10));
                });
                questions = shuffleArray(allQ).slice(0, 30);
            } else {
                questions = shuffleArray([...QUESTION_BANKS[table]]);
                questions = questions.slice(0, difficulty === 'kolay' ? 10 : 20);
            }
            return { type: 'quiz', questions };
        }
        if (mode === 'flashcard') {
            const tableData = TABLES[table];
            let items = shuffleArray([...tableData.items]);
            let cards;
            if (difficulty === 'kolay') {
                cards = items.slice(0, Math.min(6, items.length)).map(item => ({ front: item.symbol, back: item.name, item }));
            } else if (difficulty === 'orta') {
                cards = items.slice(0, Math.min(10, items.length)).map(item => ({ front: item.name, back: item.symbol, item }));
            } else {
                cards = items.map(item => {
                    const s = Math.random() > 0.5;
                    return { front: s ? item.symbol : item.name, back: s ? item.name : item.symbol, item };
                });
            }
            return { type: 'flashcard', cards };
        }
        if (mode === 'matching') {
            const tableData = TABLES[table];
            let items = shuffleArray([...tableData.items]);
            let pairCount = difficulty === 'kolay' ? 5 : difficulty === 'orta' ? Math.min(10, items.length) : items.length;
            items = items.slice(0, pairCount);
            const rightOrder = shuffleArray(items.map((_, i) => i));
            return { type: 'matching', items, rightOrder };
        }
        if (mode === 'fillTable') {
            const tableData = TABLES[table];
            let items = [...tableData.items];
            let emptyCount = difficulty === 'kolay' ? 3 : difficulty === 'orta' ? 6 : Math.ceil(items.length / 2);
            const emptyIndices = shuffleArray(items.map((_, i) => i)).slice(0, emptyCount);
            const fillFields = {};
            emptyIndices.forEach(idx => { fillFields[idx] = Math.random() > 0.5 ? 'symbol' : 'name'; });
            return { type: 'fillTable', items, emptyIndices, fillFields };
        }
        return null;
    }

    function renderGroupSplash() {
        const container = document.getElementById('main-content');
        const group = tournamentState.groups[tournamentState.currentGroupIndex];
        const groupNum = tournamentState.currentGroupIndex + 1;
        const totalGroups = tournamentState.groups.length;

        container.innerHTML = `
            <div class="tournament-splash" style="--group-color: ${group.color}">
                <div class="splash-bg"></div>
                <div class="splash-content">
                    <div class="splash-round-badge">TUR ${groupNum} / ${totalGroups}</div>
                    <div class="splash-trophy">🏆</div>
                    <h1 class="splash-group-name" style="color: ${group.color}">${group.name}</h1>
                    <p class="splash-subtitle">Hazır mısınız?</p>
                    <div class="splash-mode-info">
                        <span class="splash-mode-chip">${getModeEmoji(tournamentState.mode)} ${getModeName(tournamentState.mode)}</span>
                        <span class="splash-diff-chip">${getDiffName(tournamentState.difficulty)}</span>
                    </div>
                    <button class="btn btn-tournament-start" style="background: ${group.color}" onclick="Game.startTournamentRound()">
                        BAŞLA! 🚀
                    </button>
                </div>
                <div class="splash-particles" id="splash-particles"></div>
            </div>
        `;

        if (typeof AUDIO !== 'undefined') AUDIO.playSuccess();
        const pc = document.getElementById('splash-particles');
        for (let i = 0; i < 30; i++) {
            const p = document.createElement('div');
            p.className = 'splash-particle';
            p.style.left = Math.random() * 100 + '%';
            p.style.animationDelay = Math.random() * 2 + 's';
            p.style.animationDuration = (2 + Math.random() * 3) + 's';
            p.style.backgroundColor = group.color;
            p.style.width = p.style.height = (4 + Math.random() * 8) + 'px';
            pc.appendChild(p);
        }
    }

    function startTournamentRound() {
        if (typeof AUDIO !== 'undefined') AUDIO.playClick();
        const data = tournamentState.sharedData;
        const mode = tournamentState.mode;
        const diff = tournamentState.difficulty;
        const table = tournamentState.table;

        currentMode = mode;
        currentDifficulty = diff;
        currentTable = table;
        score = 0; combo = 0; maxCombo = 0;
        wrongAnswers = []; currentIndex = 0;
        gameStartTime = Date.now();
        isRetryMode = false; timeLeft = 0;

        if (mode === 'quiz') {
            currentQuestions = data.questions.map(q => ({ ...q, options: [...q.options] }));
            if (diff === 'orta') timeLeft = 30;
            else if (diff === 'zor') timeLeft = 15;
            renderQuiz();
        } else if (mode === 'flashcard') {
            currentQuestions = data.cards.map(c => ({ ...c, _flipped: false }));
            if (diff === 'orta') { timeLeft = 120; startTimer(); }
            else if (diff === 'zor') { timeLeft = 90; startTimer(); }
            renderFlashcard();
        } else if (mode === 'matching') {
            const items = data.items;
            currentQuestions = {
                left: items.map((item, i) => ({ id: i, text: item.symbol, matched: false })),
                right: data.rightOrder.map(i => ({ id: i, text: items[i].name, matched: false })),
                total: items.length
            };
            selectedLeft = null; selectedRight = null;
            if (diff !== 'kolay') { timeLeft = diff === 'orta' ? 120 : 60; startTimer(); }
            renderMatching();
        } else if (mode === 'fillTable') {
            const { items, emptyIndices, fillFields } = data;
            currentQuestions = items.map((item, i) => ({
                ...item,
                isEmpty: emptyIndices.includes(i),
                userAnswer: '',
                _symbolIsInput: emptyIndices.includes(i) ? fillFields[i] === 'symbol' : false
            }));
            renderFillTable();
        }
    }

    function finishTournamentRound(overrideTotal) {
        clearTimer(); clearQuizTimer();
        const timeSpent = Math.round((Date.now() - gameStartTime) / 1000);
        const total = overrideTotal || currentQuestions.length || currentQuestions.total || 0;
        const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
        const group = tournamentState.groups[tournamentState.currentGroupIndex];

        tournamentState.results.push({ groupName: group.name, groupColor: group.color, score, total, percentage, maxCombo, timeSpent });
        renderTournamentRoundResult(group, score, total, percentage, maxCombo, timeSpent);
    }

    function renderTournamentRoundResult(group, sc, total, percentage, mc, timeSpent) {
        const container = document.getElementById('main-content');
        const isLast = tournamentState.currentGroupIndex >= tournamentState.groups.length - 1;
        if (typeof AUDIO !== 'undefined') { percentage >= 70 ? AUDIO.playSuccess() : AUDIO.playCorrect(); }

        container.innerHTML = `
            <div class="tournament-round-result">
                <div class="round-result-header" style="background: linear-gradient(135deg, ${group.color}, ${group.color}88)">
                    <div class="round-result-group-name">${group.name}</div>
                    <h2 class="round-result-title">Tur Tamamlandı!</h2>
                </div>
                <div class="round-result-body">
                    <div class="round-result-ring">
                        <svg class="progress-ring" width="140" height="140">
                            <circle class="progress-ring-bg" cx="70" cy="70" r="60" />
                            <circle class="progress-ring-circle" cx="70" cy="70" r="60" stroke="${group.color}" />
                        </svg>
                        <div class="round-result-pct" id="round-pct">0</div>
                    </div>
                    <div class="round-result-stats">
                        <div class="round-stat"><span>✅</span><span id="round-sc">0</span><span>Doğru / ${total}</span></div>
                        <div class="round-stat"><span>🔥</span><span>${mc}</span><span>Max Kombo</span></div>
                        <div class="round-stat"><span>⏱️</span><span>${Storage.formatStudyTime(timeSpent)}</span><span>Süre</span></div>
                    </div>
                    <button class="btn btn-tournament-next" style="background: ${group.color}" onclick="Game.nextTournamentGroup()">
                        ${isLast ? '🏆 SONUÇLARI GÖR!' : '▶️ Sıradaki Grup'}
                    </button>
                </div>
            </div>
        `;
        setTimeout(() => {
            Animations.animateCounter(document.getElementById('round-pct'), percentage);
            Animations.animateCounter(document.getElementById('round-sc'), sc);
            Animations.animateCircularProgress(document.querySelector('.round-result-ring'), percentage);
        }, 300);
        if (percentage === 100) setTimeout(() => Animations.confetti(), 500);
    }

    function nextTournamentGroup() {
        if (typeof AUDIO !== 'undefined') AUDIO.playClick();
        tournamentState.currentGroupIndex++;
        if (tournamentState.currentGroupIndex >= tournamentState.groups.length) {
            renderTournamentFinalResults();
        } else {
            renderGroupSplash();
        }
    }

    function renderTournamentFinalResults() {
        const container = document.getElementById('main-content');
        const sorted = [...tournamentState.results].sort((a, b) => {
            if (b.percentage !== a.percentage) return b.percentage - a.percentage;
            return a.timeSpent - b.timeSpent;
        });
        const medals = ['🥇', '🥈', '🥉', '🏅'];
        const rankLabels = ['ŞAMPİYON!', '2. Sıra', '3. Sıra', '4. Sıra'];
        const winner = sorted[0];

        if (typeof AUDIO !== 'undefined') AUDIO.playSuccess();
        setTimeout(() => Animations.confetti(), 300);
        setTimeout(() => Animations.confetti(), 1500);

        container.innerHTML = `
            <div class="tournament-final">
                <div class="tournament-final-header">
                    <div class="final-trophy">🏆</div>
                    <h1 class="final-title">Turnuva Sona Erdi!</h1>
                    <p class="final-winner">Kazanan: <strong style="color:${winner.groupColor}">${winner.groupName}</strong></p>
                </div>
                <div class="tournament-podium">
                    ${sorted.map((r, idx) => `
                        <div class="podium-card ${idx === 0 ? 'podium-winner' : ''}" style="--podium-color:${r.groupColor}; animation-delay:${idx * 0.2}s">
                            <div class="podium-medal">${medals[idx] || '🏅'}</div>
                            <div class="podium-rank-label">${rankLabels[idx] || (idx + 1) + '. Sıra'}</div>
                            <div class="podium-group-name">${r.groupName}</div>
                            <div class="podium-score-bar"><div class="podium-score-fill" style="width:0%;background:${r.groupColor}"></div></div>
                            <div class="podium-details">
                                <span>✅ ${r.score}/${r.total}</span>
                                <span>📊 %${r.percentage}</span>
                                <span>🔥 x${r.maxCombo}</span>
                                <span>⏱️ ${Storage.formatStudyTime(r.timeSpent)}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="tournament-final-actions">
                    <button class="btn btn-primary btn-lg" onclick="Game.endTournament()">🏠 Ana Menüye Dön</button>
                    <button class="btn btn-secondary btn-lg" onclick="Game.restartTournament()">🔁 Turnuvayı Tekrarla</button>
                </div>
            </div>
        `;

        const cards = container.querySelectorAll('.podium-card');
        Animations.staggeredEntrance(Array.from(cards), 200);
        setTimeout(() => {
            container.querySelectorAll('.podium-score-fill').forEach((fill, i) => {
                setTimeout(() => { fill.style.width = sorted[i].percentage + '%'; }, i * 200);
            });
        }, 600);
    }

    function endTournament() {
        tournamentState = null;
        APP.navigate('dashboard');
    }

    function restartTournament() {
        if (tournamentState) {
            const config = { groups: tournamentState.groups, mode: tournamentState.mode, difficulty: tournamentState.difficulty, table: tournamentState.table };
            tournamentState = null;
            initTournament(config);
        }
    }

    return {
        startFlashcard, flipCurrentCard, flashcardAnswer,
        startQuiz, quizAnswer,
        startFillTable, checkFillTable,
        startMatching, selectMatch,
        retryWrong, playAgain, exitGame,
        finishGame,
        initTournament, startTournamentRound, nextTournamentGroup,
        endTournament, restartTournament
    };
})();
