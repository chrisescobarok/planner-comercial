// --- CONFIGURACIÓN DE ROLES Y USUARIOS ---
const USERS = {
    "editorial": { pass: "metro2026", role: "Editorial", color: "#2563eb" },
    "content": { pass: "content2026", role: "Content", color: "#10b981" },
    "trafico": { pass: "trafico2026", role: "Tráfico y Control", color: "#f59e0b" }
};

let currentUser = null; // Guardará el usuario activo

// --- DATOS DE PRUEBA ---
let tasks = [
    { id: 1, title: 'Nota previa Ecuador vs Costa de Marfil', responsible: 'Christian', project: 'Metro Ecuador', bookingStatus: 'libre', date: '2026-06-13', time: '09:00', client: '', type: 'editorial' },
    { id: 2, title: 'Reel previa Ecuador vs Costa de Marfil', responsible: 'Andrea', project: 'Metro Ecuador', bookingStatus: 'reservado', date: '2026-06-13', time: '16:00', client: 'Suzuki', type: 'comercial' },
    { id: 4, title: 'Resultado final Ecuador vs Costa de Marfil', responsible: 'Christian', project: 'Metro Ecuador', bookingStatus: 'vendido', date: '2026-06-14', time: '18:00', client: 'Supermaxi', type: 'comercial' }
];

let currentView = 'lista'; 
let currentDate = '2026-06-14';
let currentWeekStart = '2026-06-08'; 
let currentMonth = new Date('2026-06-01T00:00:00');

// --- SISTEMA DE LOGIN ---
window.openLogin = () => document.getElementById('loginModal').style.display = 'flex';
window.closeLogin = () => document.getElementById('loginModal').style.display = 'none';

window.attemptLogin = () => {
    const user = document.getElementById('userInput').value;
    const pass = document.getElementById('passInput').value;
    
    if (USERS[user] && USERS[user].pass === pass) {
        currentUser = { name: user, ...USERS[user] };
        document.getElementById('authStatus').innerHTML = `<span style="color:${currentUser.color}">● ${currentUser.role}</span>`;
        document.getElementById('roleLoginBtn').style.display = 'none';
        document.getElementById('logoutBtn').style.display = 'block';
        closeLogin();
        render(); // Refrescamos para mostrar botones según rol
    } else {
        alert("Credenciales incorrectas. Intenta con: editorial / metro2026");
    }
};

window.logout = () => {
    currentUser = null;
    document.getElementById('authStatus').innerText = "👁️ Modo público";
    document.getElementById('roleLoginBtn').style.display = 'block';
    document.getElementById('logoutBtn').style.display = 'none';
    render();
};

// --- RENDERIZADO ---
function render() {
    const content = document.getElementById('content');
    updateStats();
    if (currentView === 'diaria') renderDaily(content);
    else if (currentView === 'semanal') renderWeekly(content);
    else if (currentView === 'mensual') renderMonthly(content);
    else if (currentView === 'lista') renderList(content);
}

function updateStats() {
    document.getElementById('statTotal').innerText = tasks.length;
    document.getElementById('statLibre').innerText = tasks.filter(t => t.bookingStatus === 'libre').length;
    document.getElementById('statReservado').innerText = tasks.filter(t => t.bookingStatus === 'reservado').length;
    document.getElementById('statVendido').innerText = tasks.filter(t => t.bookingStatus === 'vendido').length;
}

function taskCard(t) {
    // Lógica de botones según Rol
    let buttons = "";
    if (currentUser) {
        if (currentUser.role === "Editorial") buttons = `<button class="btn-mini">Editar</button>`;
        if (currentUser.role === "Content" && t.bookingStatus === "libre") buttons = `<button class="btn-mini">Reservar</button>`;
        if (currentUser.role === "Tráfico y Control" && t.bookingStatus === "reservado") buttons = `<button class="btn-mini">Confirmar Venta</button>`;
    }

    return `
        <div class="task-item is-${t.bookingStatus}">
            <div style="display:flex; justify-content:space-between; align-items:start;">
                <div>
                    <span class="badge ${t.bookingStatus}">${t.bookingStatus.toUpperCase()}</span>
                    <div style="font-size:18px; font-weight:bold; margin-top:8px;">${t.title}</div>
                    <div style="color:var(--muted); font-size:13px; margin-top:5px;">🕒 ${t.time} | 👤 ${t.responsible}</div>
                    <div style="margin-top:10px;">${buttons}</div>
                </div>
                ${t.client ? `<div style="text-align:right;"><small>Cliente</small><br><strong>${t.client}</strong></div>` : ''}
            </div>
        </div>
    `;
}

// (Aquí van las funciones renderDaily, renderWeekly, renderMonthly y renderList que ya tienes)
// Asegúrate de copiar las que ya te funcionan de tu archivo actual para no perder las franjas y el diseño.

// IMPORTANTE: Al final del JS, asegúrate de conectar el botón Ingresar:
document.getElementById('roleLoginBtn').onclick = openLogin;
document.getElementById('logoutBtn').onclick = logout;

render();
