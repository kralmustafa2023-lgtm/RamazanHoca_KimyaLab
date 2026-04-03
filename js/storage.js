// ============================================
// STORAGE.JS — LocalStorage Management
// Ramazan Hoca'nın Kimya Sınıfı
// ============================================

const Storage = (() => {
    const PREFIX = 'ramazan_hoca_';

    function getKey(username) {
        return PREFIX + username;
    }

    function getDefaultData() {
        return {
            username: '',
            totalPoints: 0,
            level: 'Çaylak',
            badges: [],
            stats: {
                flashcard: { bestScore: 0, gamesPlayed: 0, totalCorrect: 0, totalAttempted: 0 },
                fillTable: { bestScore: 0, gamesPlayed: 0, totalCorrect: 0, totalAttempted: 0 },
                matching: { bestScore: 0, bestTime: null, gamesPlayed: 0, totalCorrect: 0, totalAttempted: 0 },
                quiz: { bestScore: 0, gamesPlayed: 0, totalCorrect: 0, totalAttempted: 0 }
            },
            studyTime: 0,
            streak: 0,
            lastPlayedDate: null,
            wrongAnswers: [],
            progress: {
                katyonlar: 0,
                anyonlar: 0,
                metaller: 0,
                ilk20: 0
            },
            weeklyStats: [],
            gamesPlayed: 0,
            maxCombo: 0,
            hasPerfectScore: false,
            tablesCompleted: 0,
            dailyCardsFlipped: 0,
            dailyGoalDate: null,
            sessionStartTime: null,
            coins: 0,
            dailyChestDate: null,
            ownedAvatars: [],
            activeAvatar: null,
            ownedThemes: ['light', 'dark'],
            activeTheme: 'light',
            aiSessions: []
        };
    }

    function initUser(username) {
        const key = getKey(username);
        if (!localStorage.getItem(key)) {
            const data = getDefaultData();
            data.username = username;
            localStorage.setItem(key, JSON.stringify(data));
        }
        // Update streak
        updateStreak(username);
        // Set session start
        const data = getData(username);
        data.sessionStartTime = Date.now();
        saveData(username, data);
    }

    function getData(username) {
        const key = getKey(username);
        const raw = localStorage.getItem(key);
        const def = getDefaultData();
        def.username = username;

        if (!raw) return def;

        try {
            const parsed = JSON.parse(raw);
            
            // Deep merge stats safely
            if (!parsed.stats) parsed.stats = def.stats;
            else {
                for (let k in def.stats) {
                    if (!parsed.stats[k]) parsed.stats[k] = def.stats[k];
                }
            }
            
            // Deep merge progress safely
            if (!parsed.progress) parsed.progress = def.progress;
            else {
                for (let k in def.progress) {
                    if (parsed.progress[k] === undefined) parsed.progress[k] = def.progress[k];
                }
            }

            // Also ensure default structures for other nested objects if they were added later
            if (!parsed.ownedAvatars) parsed.ownedAvatars = def.ownedAvatars;
            if (!parsed.ownedThemes) parsed.ownedThemes = def.ownedThemes;
            if (!parsed.weeklyStats) parsed.weeklyStats = def.weeklyStats;
            
            return Object.assign({}, def, parsed);
        } catch (e) {
            console.error("Storage parse error, falling back to defaults", e);
            return def;
        }
    }

    function saveData(username, data) {
        const key = getKey(username);
        localStorage.setItem(key, JSON.stringify(data));

        // 🔥 Background Firebase Sync (Fire & Forget)
        if (typeof DB !== 'undefined') {
            DB.update('users/' + username, { data: data }).catch(err => {
                // Silently fail if offline
            });
        }
    }

    function updateStreak(username) {
        const data = getData(username);
        const today = new Date().toDateString();
        const lastPlayed = data.lastPlayedDate;

        if (lastPlayed) {
            const lastDate = new Date(lastPlayed);
            const todayDate = new Date(today);
            const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                data.streak += 1;
            } else if (diffDays > 1) {
                data.streak = 1;
            }
            // Same day → keep streak
        } else {
            data.streak = 1;
        }

        data.lastPlayedDate = today;
        saveData(username, data);
    }

    function addPoints(username, points) {
        const data = getData(username);
        data.totalPoints += points;
        data.level = getLevel(data.totalPoints).name;
        saveData(username, data);
        return data;
    }

    function updateGameStats(username, mode, score, total, combo, wrongOnes, timeSpent) {
        const data = getData(username);
        
        // Update mode stats
        if (data.stats[mode]) {
            data.stats[mode].gamesPlayed += 1;
            data.stats[mode].totalCorrect += score;
            data.stats[mode].totalAttempted += total;
            if (score > data.stats[mode].bestScore) {
                data.stats[mode].bestScore = score;
            }
            if (mode === 'matching' && timeSpent) {
                if (!data.stats[mode].bestTime || timeSpent < data.stats[mode].bestTime) {
                    data.stats[mode].bestTime = timeSpent;
                }
            }
        }

        // Update overall stats
        data.gamesPlayed += 1;
        if (combo > data.maxCombo) data.maxCombo = combo;
        if (score === total && total > 0) data.hasPerfectScore = true;

        // Study time
        if (timeSpent) {
            data.studyTime += timeSpent;
        }

        // Wrong answers
        if (wrongOnes && wrongOnes.length > 0) {
            wrongOnes.forEach(w => {
                const existing = data.wrongAnswers.find(wa => wa.question === w.question);
                if (existing) {
                    existing.count += 1;
                    existing.lastDate = new Date().toISOString();
                } else {
                    data.wrongAnswers.push({
                        question: w.question,
                        correct: w.correct,
                        userAnswer: w.userAnswer,
                        count: 1,
                        lastDate: new Date().toISOString(),
                        table: w.table
                    });
                }
            });
        }

        // Points and Coins calculation
        const pointsEarned = Math.round(score * 10 * (1 + combo * 0.1));
        const coinsEarned = Math.round(pointsEarned / 2); // 1 coin per 2 points
        
        data.totalPoints += pointsEarned;
        data.coins = (data.coins || 0) + coinsEarned;
        data.level = getLevel(data.totalPoints).name;

        // Check badges
        const newBadges = [];
        BADGES.forEach(badge => {
            if (!data.badges.includes(badge.id) && badge.check(data)) {
                data.badges.push(badge.id);
                newBadges.push(badge);
            }
        });

        // Weekly stats
        const today = new Date().toDateString();
        const weekEntry = data.weeklyStats.find(w => w.date === today);
        if (weekEntry) {
            weekEntry.points += pointsEarned;
            weekEntry.games += 1;
            weekEntry.correct += score;
            weekEntry.total += total;
        } else {
            data.weeklyStats.push({
                date: today,
                points: pointsEarned,
                games: 1,
                correct: score,
                total: total
            });
        }

        // Keep only last 14 days
        if (data.weeklyStats.length > 14) {
            data.weeklyStats = data.weeklyStats.slice(-14);
        }

        saveData(username, data);
        return { data, pointsEarned, coinsEarned, newBadges };
    }

    function updateTableProgress(username, table, percentage) {
        const data = getData(username);
        if (percentage > data.progress[table]) {
            data.progress[table] = percentage;
        }
        // Count completed tables
        data.tablesCompleted = Object.values(data.progress).filter(p => p >= 80).length;
        saveData(username, data);
    }

    function updateDailyGoal(username) {
        const data = getData(username);
        const today = new Date().toDateString();
        if (data.dailyGoalDate !== today) {
            data.dailyGoalDate = today;
            data.dailyCardsFlipped = 0;
        }
        data.dailyCardsFlipped += 1;
        saveData(username, data);
        return data.dailyCardsFlipped;
    }

    function addStudyTime(username, seconds) {
        const data = getData(username);
        data.studyTime += seconds;
        saveData(username, data);
    }

    function getOverallAccuracy(username) {
        const data = getData(username);
        let totalCorrect = 0;
        let totalAttempted = 0;
        Object.values(data.stats).forEach(s => {
            totalCorrect += s.totalCorrect;
            totalAttempted += s.totalAttempted;
        });
        if (totalAttempted === 0) return 0;
        return Math.round((totalCorrect / totalAttempted) * 100);
    }

    function getMostMissedElement(username) {
        const data = getData(username);
        if (data.wrongAnswers.length === 0) return null;
        return data.wrongAnswers.sort((a, b) => b.count - a.count)[0];
    }

    function getWeeklyComparison(username) {
        const data = getData(username);
        if (data.weeklyStats.length < 2) return null;
        
        const today = new Date();
        const thisWeek = data.weeklyStats.filter(w => {
            const d = new Date(w.date);
            return (today - d) / (1000 * 60 * 60 * 24) <= 7;
        });
        const lastWeek = data.weeklyStats.filter(w => {
            const d = new Date(w.date);
            const diff = (today - d) / (1000 * 60 * 60 * 24);
            return diff > 7 && diff <= 14;
        });

        const thisWeekAccuracy = thisWeek.reduce((a, w) => a + w.correct, 0) / (thisWeek.reduce((a, w) => a + w.total, 0) || 1);
        const lastWeekAccuracy = lastWeek.reduce((a, w) => a + w.correct, 0) / (lastWeek.reduce((a, w) => a + w.total, 0) || 1);

        if (lastWeekAccuracy === 0) return null;
        const diff = Math.round((thisWeekAccuracy - lastWeekAccuracy) * 100);
        return diff;
    }

    function formatStudyTime(seconds) {
        if (seconds < 60) return `${seconds} saniye`;
        const mins = Math.floor(seconds / 60);
        if (mins < 60) return `${mins} dakika`;
        const hours = Math.floor(mins / 60);
        const remainMins = mins % 60;
        return `${hours} saat ${remainMins} dk`;
    }

    function openDailyChest(username) {
        const data = getData(username);
        const today = new Date().toDateString();
        if (data.dailyChestDate === today) return null; // Zaten açılmış
        
        data.dailyChestDate = today;
        const reward = Math.floor(Math.random() * 400) + 100; // 100 ile 500 arası altın
        data.coins = (data.coins || 0) + reward;
        saveData(username, data);
        return reward;
    }

    function buyItem(username, type, itemId, price) {
        const data = getData(username);
        if ((data.coins || 0) < price) return false;
        
        data.coins -= price;
        if (type === 'avatar') {
            if (!data.ownedAvatars) data.ownedAvatars = ['Çaylak'];
            data.ownedAvatars.push(itemId);
            data.activeAvatar = itemId;
        } else if (type === 'theme') {
            if (!data.ownedThemes) data.ownedThemes = ['light', 'dark'];
            data.ownedThemes.push(itemId);
            data.activeTheme = itemId;
        }
        saveData(username, data);
        return true;
    }

    function equipItem(username, type, itemId) {
        const data = getData(username);
        if (type === 'avatar' && data.ownedAvatars && data.ownedAvatars.includes(itemId)) {
            data.activeAvatar = itemId;
        } else if (type === 'theme' && data.ownedThemes && data.ownedThemes.includes(itemId)) {
            data.activeTheme = itemId;
        }
        saveData(username, data);
    }

    return {
        initUser, getData, saveData, addPoints, updateGameStats,
        updateTableProgress, updateDailyGoal, addStudyTime,
        getOverallAccuracy, getMostMissedElement, getWeeklyComparison,
        formatStudyTime, openDailyChest, buyItem, equipItem
    };
})();
