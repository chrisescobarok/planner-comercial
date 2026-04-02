// --- 1. USUARIOS Y ROLES ---
const USERS = {
    "editorial": { pass: "metro2026", role: "Editorial", color: "#2563eb" },
    "content": { pass: "content2026", role: "Content", color: "#10b981" },
    "trafico": { pass: "trafico2026", role: "Tráfico y Control", color: "#f59e0b" }
};

let currentUser = null; 

// --- 2. DATOS (SIEMPRE VISIBLES) ---
let tasks = [
    { id: 1, title: 'Nota previa Ecuador vs Costa de Marfil', responsible: 'Christian', project: 'Metro Ecuador', bookingStatus: 'libre', date: '2026-06-13', time: '09:00', client: '' },
    { id: 2, title: 'Reel previa Ecuador vs Costa de Marfil', responsible: 'Andrea', project: 'Metro Ecuador', bookingStatus: 'reservado', date: '2026-06-13', time: '16:00', client: 'Suzuki' },
    { id: 4, title: 'Resultado final Ecuador vs Costa de Marfil', responsible: 'Christian', project: 'Metro Ecuador', bookingStatus: 'vendido', date: '2026-06-14', time: '18:00', client: 'Supermaxi' },
    { id: 5, title: 'Análisis Post-Partido', responsible: 'Carlos Bolaños', project: 'Metro Ecuador', bookingStatus: 'libre', date: '2026-06-15', time: '10:00', client: '' }
];

// --- 3. ESTADO INICIAL ---
let currentView = 'lista'; // Forzamos lista para que SIEMPRE veas algo al cargar
let currentDate = '2026-06-14';
let currentWeekStart = '2026-06-08'; 
let currentMonth = new Date('2026-06-01T00:00:00');

// --- 4. FUNCIONES DE LOGIN ---
window.openLogin = () => { document.getElementById('loginModal').style.display = 'flex'; };
window.closeLogin = () => { document.getElementById('loginModal').style.display = 'none'; };

window.attemptLogin = () => {
    const u = document.getElementById('userInput').value;
    const p = document.getElementById('passInput').value;
    if (USERS[u] && USERS[u].pass === p) {
        currentUser = { name: u, ...USERS[u] };
        document.getElementById('authStatus').innerHTML = `<span style="color:${currentUser.color}; font-weight:bold;">● ${currentUser.role}</span>`;
        document.getElementById('roleLoginBtn').style.display = 'none';
        document.getElementById('logoutBtn').style.display = 'block';
        closeLogin();
        render();
    } else {
        alert("Usuario o clave incorrectos");
    }
};

window.logout = () => {
    currentUser = null;
    document.getElementById('authStatus').innerText = "👁️ Modo público";
    document.getElementById('roleLoginBtn').style.display = 'block';
    document.getElementById('logoutBtn').style.display = 'none';
    render();
};

// --- 5. MOTOR DE DIBUJO ---
function render() {
    const content = document.getElementById('content');
    if(!content) return;
    
    // Actualizar contadores superiores
    document.getElementById('statTotal').innerText = tasks.length;
    document.getElementById('statLibre').innerText = tasks.filter(t => t.bookingStatus === 'libre').length;
    document.getElementById('statReservado').innerText = tasks.filter(t => t.bookingStatus === 'reservado').length;
    document.getElementById('statVendido').innerText = tasks.filter(t => t.bookingStatus === 'vendido').length;

    if (currentView === 'diaria') renderDaily(content);
    else if (currentView === 'semanal') renderWeekly(content);
    else if (currentView === 'mensual') renderMonthly(content);
    else renderList(content);
}

function taskCard(t) {
    let btn = "";
    if (currentUser) {
        if (currentUser.role === "Editorial") btn = `<button class="btn-mini">Editar</button>`;
        else if (currentUser.role === "Content" && t.bookingStatus === "libre") btn = `<button class="btn-mini">Reservar</button>`;
        else if (currentUser.role === "Tráfico y Control" && t.bookingStatus === "reservado") btn = `<button class="btn-mini">Vender</button>`;
    }
    return `
        <div class="task-item is-${t.bookingStatus}">
            <div style="display:flex; justify-content:space-between; align-items:start;">
                <div>
                    <span class="badge ${t.bookingStatus}">${t.bookingStatus}</span>
                    <div style="font-size:18px; font-weight:bold; margin-top:8px;">${t.title}</div>
                    <div style="color:gray; font-size:13px; margin-top:5px;">🕒 ${t.time} | 👤 ${t.responsible}</div>
                    <div style="margin-top:10px;">${btn}</div>
                </div>
                ${t.client ? `<div style="text-align:right;"><small>Cliente</small><br><strong>${t.client}</strong></div>` : ''}
            </div>
        </div>`;
}

// --- VISTAS ---
function renderDaily(container) {
    const filtered = tasks.filter(t => t.date === currentDate);
    container.innerHTML = `<h2>Día: ${currentDate}</h2>` + filtered.map(t => taskCard(t)).join('') || '<p>Sin acciones.</p>';
}

function renderWeekly(container) {
    const start = new Date(currentWeekStart + 'T00:00:00');
    let html = '<div style="display:grid; grid-template-columns:repeat(7, 1fr); gap:10px;">';
    for (let i = 0; i < 7; i++) {
        const d = new Date(start); d.setDate(start.getDate() + i);
        const dStr = d.toISOString().slice(0, 10);
        const dayTasks = tasks.filter(t => t.date === dStr);
        html += `<div onclick="currentDate='${dStr}'; currentView='diaria'; render();" style="background:white; border:1px solid #eee; border-radius:10px; padding:10px; min-height:300px; cursor:pointer;">
            <div style="font-weight:bold; font-size:11px; margin-bottom:10px;">${dStr}</div>
            ${dayTasks.map(t => `<div class="badge ${t.bookingStatus}" style="font-size:9px; margin-bottom:4px;">${t.time} ${t.title.substring(0,15)}...</div>`).join('')}
        </div>`;
    }
    container.innerHTML = `<h2>Vista Semanal</h2>` + html + '</div>';
}

function renderMonthly(container) {
    const year = currentMonth.getFullYear(); const month = currentMonth.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();
    let grid = '<div style="display:grid; grid-template-columns:repeat(7, 1fr); gap:5px; background:#f1f5f9; padding:5px; border-radius:12px;">';
    for(let d=1; d<=lastDay; d++) {
        const dStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        const dayTasks = tasks.filter(t => t.date === dStr);
        grid += `<div onclick="currentDate='${dStr}'; currentView='diaria'; render();" style="min-height:80px; background:white; border-radius:8px; padding:5px; cursor:pointer;">
            <strong>${d}</strong>
            ${dayTasks.map(t => `<div class="badge ${t.bookingStatus}" style="height:4px; margin-top:2px;"></div>`).join('')}
        </div>`;
    }
    container.innerHTML = `<h2>${currentMonth.toLocaleDateString('es-EC',{month:'long', year:'numeric'})}</h2>` + grid + '</div>';
}

function renderList(container) {
    let html = '<h2>Cronograma de Acciones</h2>';
    let lastDate = null;
    [...tasks].sort((a,b)=>a.date.localeCompare(b.date)).forEach(t => {
        if (t.date !== lastDate) {
            html += `<div style="background:#e2e8f0; padding:10px; margin:20px 0 10px 0; border-radius:8px; font-weight:bold;">📅 ${t.date}</div>`;
            lastDate = t.date;
        }
        html += taskCard(t);
    });
    container.innerHTML = html;
}

// --- NAVEGACIÓN Y EVENTOS ---
window.moveDay = (n) => { /* ... similar logic ... */ };

// IMPORTANTE: Conectar botones de arriba
document.querySelectorAll('.view-switch button').forEach(btn => {
    btn.onclick = (e) => {
        document.querySelectorAll('.view-switch button').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentView = e.target.getAttribute('data-view');
        render();
    };
});

// Botón login
document.getElementById('roleLoginBtn').onclick = window.openLogin;
document.getElementById('logoutBtn').onclick = window.logout;

// Ejecución inicial
render();
