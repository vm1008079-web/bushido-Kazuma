// Dashboard específico: carga de datos, contadores, uptime

function updateUptime(startTime) {
    setInterval(() => {
        const now = Date.now();
        const diff = Math.floor((now - startTime) / 1000);
        const h = Math.floor(diff / 3600).toString().padStart(2, '0');
        const m = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
        const s = (diff % 60).toString().padStart(2, '0');
        const uptimeEl = document.getElementById('uptime-val');
        if (uptimeEl) uptimeEl.innerText = `${h}:${m}:${s}`;
    }, 1000);
}

function animateCounter(element, target, duration = 800) {
    if (!element) return;
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
        start += step;
        if (start >= target) {
            element.innerText = target;
            clearInterval(timer);
        } else {
            element.innerText = start;
        }
    }, 16);
}

async function loadDash() {
    const userData = checkAuth(true);
    if (!userData) return;

    // reCAPTCHA v3 solo si existe la función
    if (typeof grecaptcha !== 'undefined' && grecaptcha.ready) {
        grecaptcha.ready(function() {
            grecaptcha.execute('6Lfw-dwsAAAAACc6y5K4sfFnplSqbskYPia1ADh5', { action: 'dashboard_load' }).then(function(token) {
                // token enviado automáticamente en fetch? El backend debería esperarlo.
                console.log('reCAPTCHA v3 activado');
            });
        });
    }

    const area = document.getElementById('content-area');
    const preloader = document.getElementById('preloader');
    if (userData.role === 'admin') {
        const adminNav = document.getElementById('admin-nav');
        if (adminNav) adminNav.style.display = 'block';
    }

    try {
        const [resGlobal, resMe] = await Promise.all([
            fetch('/api/auth/dashboard-global'),
            fetch(`/api/auth/me?apiKey=${userData.key}`)
        ]);
        const data = await resGlobal.json();
        const me = await resMe.json();

        if (me.status) {
            const updatedUser = { ...userData, ...me.data };
            localStorage.setItem('kazuma_user', JSON.stringify(updatedUser));
        }
        const finalAvatar = me.data?.profile_img || 'https://files.catbox.moe/9ssbf9.jpg';
        const avatarImg = document.getElementById('avatar-trigger-img');
        if (avatarImg) avatarImg.src = finalAvatar;

        area.innerHTML = `
        <section style="text-align: center; padding: 15px 0 25px 0;">
            <img src="${finalAvatar}" class="hero-img" alt="Avatar samurai">
            <h1 style="font-size: 1.35rem; font-weight: 800; margin: 0; letter-spacing: -0.5px; font-family: 'Noto Serif JP', serif;">⚔️ 侍 ⚔️</h1>
            <p style="color:var(--bushido-muted); font-weight: 600; font-size: 0.8rem; margin-top: 4px;">@${userData.username.toLowerCase()} <span class="kanji">(武士)</span></p>
        </section>

        <div class="api-card">
            <div class="card-title"><i class="fas fa-key"></i> <span class="kanji">🔑 鍵</span> Credenciales</div>
            <div class="key-box">
                <span id="key-display" style="font-family: 'monospace'; font-size: 0.85rem; letter-spacing:1px;">••••••••••••••••</span>
                <div style="display:flex; gap:15px">
                    <i class="fas fa-eye" onclick="toggleEye('key-display', '${userData.key}')" style="color:var(--bushido-muted); cursor:pointer;"></i>
                    <i class="fas fa-copy" onclick="copyKey('${userData.key}')" style="color:var(--bushido-gold); cursor:pointer;"></i>
                </div>
            </div>
        </div>

        <div class="api-card">
            <div class="card-title"><i class="fas fa-microchip"></i> <span class="kanji">📊 統計</span> Monitor del Guerrero</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div class="stat-box" style="grid-column: span 2; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-size: 0.65rem; color: var(--bushido-muted); font-weight: 700; text-transform: uppercase;">Comunidad</div>
                        <div style="font-size: 1.05rem; font-weight: 700;"><span class="counter" id="total-users">${data.totalUsers}</span> Guerreros</div>
                    </div>
                    <i class="fas fa-users" style="font-size: 1.2rem; opacity: 0.2;"></i>
                </div>
                <div class="stat-box">
                    <div style="font-size: 0.65rem; color: var(--bushido-muted); font-weight: 700; text-transform: uppercase;">Tiempo de batalla</div>
                    <div id="uptime-val" style="font-size: 1.05rem; font-weight: 700; color:var(--bushido-gold)">00:00:00</div>
                </div>
                <div class="stat-box">
                    <div style="font-size: 0.65rem; color: var(--bushido-muted); font-weight: 700; text-transform: uppercase;">Usos hoy</div>
                    <div style="font-size: 1.05rem; font-weight: 700;"><span class="counter" id="requests-today">${me.data?.requests.today || 0}</span> / <span id="requests-limit">${me.data?.requests.limit || 0}</span></div>
                </div>
            </div>
        </div>

        <div class="api-card">
            <div class="card-title"><i class="fas fa-ranking-star"></i> <span class="kanji">🏆 勇者</span> Top Consumo Global</div>
            ${data.top5.map((u, i) => `
                <div class="user-card">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="width: 28px; height: 28px; clip-path: polygon(20% 0%, 80% 0%, 100% 50%, 80% 100%, 20% 100%, 0% 50%); background: rgba(196,154,28,0.2); color: var(--bushido-gold); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.8rem;">
                            ${i+1}
                        </div>
                        <span style="font-size:0.85rem; font-weight:600">${u.username}</span>
                    </div>
                    <span style="color:var(--bushido-muted); font-weight:700; font-size:0.75rem;">${u.total} ataques</span>
                </div>
            `).join('')}
        </div>`;

        // Animar contadores
        document.querySelectorAll('.counter').forEach(el => {
            const target = parseInt(el.innerText, 10);
            if (!isNaN(target)) animateCounter(el, target);
        });
        updateUptime(data.uptime);
    } catch (e) {
        console.error("Error al cargar el tablero:", e);
        area.innerHTML = "<p style='text-align:center; color:#ef4444; font-weight:600; margin-top:50px;'>ERROR: No se pudo conectar con el espíritu del servidor</p>";
    }

    if (preloader) {
        setTimeout(() => { preloader.style.display = 'none'; }, 600);
    }
}