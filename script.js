document.addEventListener('DOMContentLoaded', () => {

    // ── Mobile Nav ──────────────────────────────────────────────
    const hamburger = document.querySelector('.hamburger');
    const navMenu   = document.querySelector('.nav-menu');
    const navLinks  = document.querySelectorAll('.nav-link');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // ── Smooth Scroll ────────────────────────────────────────────
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const id = this.getAttribute('href');
            if (id === '#') return;
            const el = document.querySelector(id);
            if (el) {
                window.scrollTo({
                    top: el.getBoundingClientRect().top + window.pageYOffset - 70,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ── Active Nav on Scroll ──────────────────────────────────────
    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(s => {
            if (window.pageYOffset >= s.offsetTop - s.clientHeight / 3) {
                current = s.id;
            }
        });
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });

    // ── Scroll Reveal ─────────────────────────────────────────────
    const revealEls = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('active');
            revealObserver.unobserve(entry.target);
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => revealObserver.observe(el));

    // ── Stat Counters ─────────────────────────────────────────────
    const statNumbers = document.querySelectorAll('.stat-number[data-target]');
    const countObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el     = entry.target;
            const target = parseInt(el.dataset.target);
            const dur    = 1400;
            const step   = dur / target;
            let current  = 0;

            const timer = setInterval(() => {
                current++;
                el.textContent = current;
                if (current >= target) {
                    el.textContent = target + '+';
                    clearInterval(timer);
                }
            }, step);

            countObserver.unobserve(el);
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(el => countObserver.observe(el));

    // ── Typing Effect ─────────────────────────────────────────────
    const typedSpan  = document.querySelector('.typed-text');
    const cursorSpan = document.querySelector('.cursor');

    if (typedSpan && cursorSpan) {
        const phrases = [
            'PhD Candidate @ Uni Melbourne',
            'Mixed Reality & 360° Imaging',
            'Computer Vision & AI',
            'Novel View Synthesis'
        ];
        let phraseIdx = 0, charIdx = 0;

        function type() {
            const phrase = phrases[phraseIdx];
            if (charIdx < phrase.length) {
                cursorSpan.classList.add('typing');
                typedSpan.textContent += phrase[charIdx++];
                setTimeout(type, 95);
            } else {
                cursorSpan.classList.remove('typing');
                setTimeout(erase, 2200);
            }
        }

        function erase() {
            if (charIdx > 0) {
                cursorSpan.classList.add('typing');
                typedSpan.textContent = phrases[phraseIdx].substring(0, --charIdx);
                setTimeout(erase, 45);
            } else {
                cursorSpan.classList.remove('typing');
                phraseIdx = (phraseIdx + 1) % phrases.length;
                setTimeout(type, 700);
            }
        }

        setTimeout(type, 1200);
    }

    // ── 3D Tilt on Cards ─────────────────────────────────────────
    document.querySelectorAll('.project-card, .blog-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            card.classList.remove('tilt-transition');
            const rect   = card.getBoundingClientRect();
            const mx     = (e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2);
            const my     = (e.clientY - rect.top  - rect.height / 2) / (rect.height / 2);
            card.style.transform = `perspective(900px) rotateX(${my * -8}deg) rotateY(${mx * 8}deg) scale3d(1.02,1.02,1.02)`;
        });
        card.addEventListener('mouseleave', () => {
            card.classList.add('tilt-transition');
            card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
        });
    });

    // ── Point Cloud Background ────────────────────────────────────
    initBackground();
});

// ── Blog Scroll ───────────────────────────────────────────────────
function scrollBlog(dir) {
    const container = document.querySelector('.blog-grid');
    container.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' });
}

// ── Point Cloud + Perspective Grid Background ─────────────────────
function initBackground() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let W, H, points = [];
    const mouse = { x: null, y: null };
    let time = 0;

    function resize() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
        spawnPoints();
    }

    function spawnPoints() {
        const count = Math.min(70, Math.floor(W * H / 14000));
        points = Array.from({ length: count }, () => ({
            x:    Math.random() * W,
            y:    Math.random() * H,
            z:    Math.random(),          // 0 = far/purple, 1 = near/cyan
            vx:   (Math.random() - 0.5) * 0.25,
            vy:   (Math.random() - 0.5) * 0.25,
            size: Math.random() * 1.5 + 0.5,
        }));
    }

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
    window.addEventListener('mouseout',  () => { mouse.x = null; mouse.y = null; });

    function drawGrid() {
        const horizon = H * 0.72;
        const vanish  = W * 0.5 + (mouse.x != null ? (mouse.x / W - 0.5) * 60 : 0);

        // Scrolling horizontal lines (depth scroll effect)
        for (let i = 0; i < 9; i++) {
            const t  = ((i / 9) + time * 0.04) % 1;
            const y  = horizon + (H - horizon) * Math.pow(t, 2);
            const hw = t * W * 0.75;
            const a  = t * 0.09;
            ctx.beginPath();
            ctx.moveTo(vanish - hw, y);
            ctx.lineTo(vanish + hw, y);
            ctx.strokeStyle = `rgba(34,211,238,${a})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
        }

        // Vertical converging lines
        for (let i = 0; i <= 8; i++) {
            const bx = (i / 8) * W;
            ctx.beginPath();
            ctx.moveTo(vanish, horizon);
            ctx.lineTo(bx, H);
            ctx.strokeStyle = 'rgba(167,139,250,0.05)';
            ctx.lineWidth = 0.5;
            ctx.stroke();
        }
    }

    function drawPoints() {
        const maxDist = W / 5.5;

        for (const p of points) {
            // Move
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > W) p.vx *= -1;
            if (p.y < 0 || p.y > H) p.vy *= -1;

            // Mouse repulsion
            if (mouse.x != null) {
                const dx = p.x - mouse.x, dy = p.y - mouse.y;
                const d  = Math.sqrt(dx * dx + dy * dy);
                if (d < 110) {
                    p.x += dx / d * 1.8;
                    p.y += dy / d * 1.8;
                }
            }

            // Draw dot — cyan near, purple far
            const alpha = 0.15 + p.z * 0.45;
            const r = p.z > 0.5 ? 34 : 167, g = p.z > 0.5 ? 211 : 139, b = p.z > 0.5 ? 238 : 250;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * (0.4 + p.z * 0.6), 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
            ctx.fill();
        }

        // Connections
        for (let i = 0; i < points.length; i++) {
            for (let j = i + 1; j < points.length; j++) {
                const dx = points[i].x - points[j].x;
                const dy = points[i].y - points[j].y;
                const d  = Math.sqrt(dx * dx + dy * dy);
                if (d < maxDist) {
                    const a  = (1 - d / maxDist) * 0.12;
                    const az = (points[i].z + points[j].z) / 2;
                    const r  = az > 0.5 ? 34  : 167;
                    const g  = az > 0.5 ? 211 : 139;
                    const b  = az > 0.5 ? 238 : 250;
                    ctx.beginPath();
                    ctx.moveTo(points[i].x, points[i].y);
                    ctx.lineTo(points[j].x, points[j].y);
                    ctx.strokeStyle = `rgba(${r},${g},${b},${a})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, W, H);
        drawGrid();
        drawPoints();
        time += 0.008;
    }

    resize();
    animate();
}
