// ============================================
// ANIMATIONS.JS — All Animation Effects
// Ramazan Hoca'nın Kimya Sınıfı
// ============================================

const Animations = (() => {

    // Confetti explosion
    function confetti(container) {
        const colors = ['#00BFA5', '#7C4DFF', '#FF4081', '#FF6D00', '#FFD600', '#00E5FF', '#76FF03'];
        const count = 80;
        
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'confetti-particle';
            particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 0.5 + 's';
            particle.style.animationDuration = (Math.random() * 2 + 1.5) + 's';
            const size = Math.random() * 8 + 4;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            particle.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
            (container || document.body).appendChild(particle);
            
            setTimeout(() => particle.remove(), 3500);
        }
    }

    // Ripple effect on button click
    function ripple(event) {
        const btn = event.currentTarget;
        const existing = btn.querySelector('.ripple-effect');
        if (existing) existing.remove();

        const circle = document.createElement('span');
        circle.className = 'ripple-effect';
        const diameter = Math.max(btn.clientWidth, btn.clientHeight);
        const radius = diameter / 2;
        
        const rect = btn.getBoundingClientRect();
        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${event.clientX - rect.left - radius}px`;
        circle.style.top = `${event.clientY - rect.top - radius}px`;
        
        btn.appendChild(circle);
        setTimeout(() => circle.remove(), 600);
    }

    // Counter animation
    function animateCounter(element, target, duration = 1000) {
        const start = parseInt(element.textContent) || 0;
        const diff = target - start;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            element.textContent = Math.round(start + diff * eased);
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        requestAnimationFrame(update);
    }

    // Shake animation
    function shake(element) {
        element.classList.add('shake-animation');
        setTimeout(() => element.classList.remove('shake-animation'), 500);
    }

    // Green wave animation
    function correctWave(element) {
        element.classList.add('correct-wave');
        setTimeout(() => element.classList.remove('correct-wave'), 800);
    }

    // Wrong answer effect
    function wrongAnswer(element) {
        element.classList.add('wrong-shake');
        setTimeout(() => element.classList.remove('wrong-shake'), 500);
    }

    // Combo animation
    function comboEffect(count) {
        const overlay = document.createElement('div');
        overlay.className = 'combo-overlay';
        
        let text = '';
        let emoji = '';
        if (count >= 10) {
            text = 'EFSANE KOMBO!';
            emoji = '👑';
            overlay.classList.add('combo-legendary');
            confetti();
        } else if (count >= 5) {
            text = 'SÜPER KOMBO!';
            emoji = '⚡';
            overlay.classList.add('combo-super');
        } else if (count >= 3) {
            text = 'KOMBO!';
            emoji = '🔥';
            overlay.classList.add('combo-normal');
        }
        
        overlay.innerHTML = `
            <div class="combo-content">
                <span class="combo-emoji">${emoji}</span>
                <span class="combo-text">${text}</span>
                <span class="combo-count">x${count}</span>
            </div>
        `;
        
        document.body.appendChild(overlay);
        setTimeout(() => {
            overlay.classList.add('combo-exit');
            setTimeout(() => overlay.remove(), 500);
        }, 1500);
    }

    // Badge earned animation
    function badgeEarned(badge) {
        const overlay = document.createElement('div');
        overlay.className = 'badge-overlay';
        overlay.innerHTML = `
            <div class="badge-earned-card">
                <div class="badge-earned-glow"></div>
                <div class="badge-earned-icon">${badge.icon}</div>
                <h3 class="badge-earned-title">Yeni Rozet!</h3>
                <p class="badge-earned-name">${badge.name}</p>
                <p class="badge-earned-desc">${badge.description}</p>
            </div>
        `;
        
        document.body.appendChild(overlay);
        confetti();
        
        setTimeout(() => {
            overlay.classList.add('badge-exit');
            setTimeout(() => overlay.remove(), 500);
        }, 3000);
    }

    // Staggered entrance
    function staggeredEntrance(elements, delay = 100) {
        elements.forEach((el, idx) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            setTimeout(() => {
                el.style.transition = 'all 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, idx * delay);
        });
    }

    // Page transition (Ultra Premium with View Transitions API)
    function pageTransition(container, callback) {
        if (document.startViewTransition) {
            document.startViewTransition(() => {
                callback();
            });
        } else {
            // Fallback for older browsers
            container.classList.add('page-exit');
            setTimeout(() => {
                callback();
                container.classList.remove('page-exit');
                container.classList.add('page-enter');
                setTimeout(() => container.classList.remove('page-enter'), 500);
            }, 300);
        }
    }

    // Circular progress animation
    function animateCircularProgress(element, percentage, duration = 1500) {
        const circle = element.querySelector('.progress-ring-circle');
        if (!circle) return;
        
        const radius = circle.r.baseVal.value;
        const circumference = 2 * Math.PI * radius;
        circle.style.strokeDasharray = circumference;
        
        const startTime = performance.now();
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const offset = circumference - (eased * percentage / 100) * circumference;
            circle.style.strokeDashoffset = offset;
            
            if (progress < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
    }

    // Card flip
    function flipCard(cardElement) {
        cardElement.classList.toggle('flipped');
    }

    // Pulse glow
    function pulseGlow(element) {
        element.classList.add('pulse-glow');
        setTimeout(() => element.classList.remove('pulse-glow'), 2000);
    }

    // Float animation
    function floatElement(element) {
        element.classList.add('floating');
    }

    // Initialize ripple for all buttons
    function initRipples() {
        document.querySelectorAll('.btn, .mode-card, .nav-item').forEach(btn => {
            btn.addEventListener('click', ripple);
        });
    }

    // Score pop animation
    function scorePop(container, points) {
        const pop = document.createElement('div');
        pop.className = 'score-pop';
        pop.textContent = `+${points}`;
        container.appendChild(pop);
        setTimeout(() => pop.remove(), 1200);
    }

    return {
        confetti, ripple, animateCounter, shake, correctWave,
        wrongAnswer, comboEffect, badgeEarned, staggeredEntrance,
        pageTransition, animateCircularProgress, flipCard,
        pulseGlow, floatElement, initRipples, scorePop
    };
})();
