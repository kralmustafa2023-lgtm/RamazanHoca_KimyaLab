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
            sessionStartTime: null
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
        if (!raw) {
            const data = getDefaultData();
            data.username = username;
            return data;
        }
        return JSON.parse(raw);
    }

    function saveData(username, data) {
        const key = getKey(username);
        localStorage.setItem(key, JSON.stringify(data));
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

        // Points calculation
        const pointsEarned = Math.round(score * 10 * (1 + combo * 0.1));
        data.totalPoints += pointsEarned;
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
        return { data, pointsEarned, newBadges };
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

    return {
        initUser, getData, saveData, addPoints, updateGameStats,
        updateTableProgress, updateDailyGoal, addStudyTime,
        getOverallAccuracy, getMostMissedElement, getWeeklyComparison,
        formatStudyTime
    };
})();
