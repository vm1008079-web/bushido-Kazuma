// Funciones comunes para todas las páginas del tema Bushido

function toggleMenu() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    const dropdown = document.getElementById('profile-dropdown');
    if (sidebar) sidebar.classList.toggle('active');
    if (overlay) overlay.classList.toggle('active');
    if (dropdown) dropdown.classList.remove('active');
}

function toggleDropdown(event) {
    if (event) event.stopPropagation();
    const dropdown = document.getElementById('profile-dropdown');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    if (dropdown) dropdown.classList.toggle('active');
    if (sidebar) sidebar.classList.remove('active');
    if (overlay && dropdown) overlay.classList.toggle('active', dropdown.classList.contains('active'));
}

function closeAllPanels() {
    const sidebar = document.getElementById('sidebar');
    const dropdown = document.getElementById('profile-dropdown');
    const overlay = document.getElementById('overlay');
    if (sidebar) sidebar.classList.remove('active');
    if (dropdown) dropdown.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
}

function toggleTheme() {
    Swal.fire({
        title: 'Modo claro no disponible',
        text: 'El camino del guerrero solo se recorre en la oscuridad.',
        icon: 'info',
        background: 'var(--bushido-card)',
        color: 'var(--bushido-text)',
        toast: true,
        timer: 2000
    });
}

function logout() {
    localStorage.clear();
    document.cookie.split(";").forEach(function(c) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    window.location.href = '/login';
}

function copyKey(key) {
    navigator.clipboard.writeText(key);
    Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Sello copiado',
        showConfirmButton: false,
        timer: 1500,
        background: 'var(--bushido-card)',
        color: 'var(--bushido-text)'
    });
}

function toggleEye(keyElementId, userKey) {
    const el = document.getElementById(keyElementId);
    if (el.innerText.includes('••••')) {
        el.innerText = userKey;
    } else {
        el.innerText = '••••••••••••••••';
    }
}

// Cierre de paneles al hacer clic fuera
document.addEventListener('click', function(e) {
    const dropdown = document.getElementById('profile-dropdown');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    if (dropdown && !dropdown.contains(e.target)) {
        dropdown.classList.remove('active');
        if (sidebar && !sidebar.classList.contains('active') && overlay) {
            overlay.classList.remove('active');
        }
    }
});

// Redirigir si no hay usuario logueado (para páginas protegidas)
function checkAuth(redirectIfMissing = true) {
    const user = localStorage.getItem('kazuma_user');
    if (!user && redirectIfMissing) {
        window.location.href = '/login';
        return null;
    }
    return user ? JSON.parse(user) : null;
}