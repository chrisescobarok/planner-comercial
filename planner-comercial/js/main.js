// --- CONFIGURACIÓN DE ROLES Y USUARIOS ---
const USERS = {
    "editorial": { pass: "metro2026", role: "Editorial", color: "#2563eb" },
    "content": { pass: "content2026", role: "Content", color: "#10b981" },
    "trafico": { pass: "trafico2026", role: "Tráfico y Control", color: "#f59e0b" }
};

let currentUser = null; 

// --- DATOS DE PRUEBA (MUNDIAL JUNIO 2026) ---
let tasks = [
    { id: 1, title: 'Nota previa Ecuador vs Costa de Marfil', responsible: 'Christian', project: 'Metro Ecuador', bookingStatus: 'libre', date: '2026-06-13', time: '09:00', client: '' },
    { id: 2, title: 'Reel previa Ecuador vs Costa de Marfil', responsible: 'Andrea', project: 'Metro Ecuador', bookingStatus: 'reservado', date: '2026-06-13', time: '16:00', client: 'Suzuki' },
    { id: 4, title: 'Resultado final Ecuador vs Costa de Marfil', responsible: 'Christian', project: 'Metro Ecuador', bookingStatus: 'vendido', date: '2026-06-14', time: '18:00', client: 'Supermaxi' },
    { id: 5, title: 'Análisis Post-Partido', responsible: 'Carlos Bolaños', project: 'Metro Ecuador', bookingStatus: 'libre', date: '2026-06-15', time: '10:00', client: '' }
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
        document.getElementById('authStatus').innerHTML = `<span style="color:${currentUser.color}; font-weight:bold;">● ${currentUser.role}</span>`;
        document.getElementById('roleLoginBtn').style.display = 'none';
        document.getElementById('logoutBtn').style.display = 'block';
        closeLogin();
        render();
    } else {
        alert("Credenciales incorrectas.");
    }
};

window.logout = () => {
    currentUser = null;
    document.getElementById('authStatus').innerText = "👁️ Modo público";
    document.getElementById('roleLoginBtn').style.display = 'block';
    document.getElementById('logoutBtn').style.display = 'none';
    render();
};

// --- RENDERIZADO PRINCIPAL ---
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
        </div>`;
}

// --- TODAS LAS VISTAS ---
function renderDaily(container) {
    const filtered = tasks.filter(t => t.date === currentDate);
    container.innerHTML = `<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;"><h2>Vista Diaria</h2><div style="display:flex; gap:10px; align-items:center;"><button onclick="moveDay(-1)">Anterior</button><input type="date" value="${currentDate}" onchange="currentDate=this.value; render();" style="padding:8px; border-radius:8px; border:1px solid #ddd;"><button onclick="moveDay(1)">Siguiente</button></div></div>${filtered.map(t => taskCard(t)).join('') || '<p>Sin acciones.</p>'}`;
}

function renderWeekly(container) {
    const start = new Date(currentWeekStart + 'T00:00:00');
    let html = '<div style="display:grid; grid-template-columns:repeat(7, 1fr); gap:12px;">';
    for (let i = 0; i < 7; i++) {
        const d = new Date(start); d.setDate(start.getDate() + i);
        const dStr = d.toISOString().slice(0, 10);
        const dayTasks = tasks.filter(t => t.date === dStr);
        html += `<div onclick="currentDate='${dStr}'; currentView='diaria'; render();" style="background:white; border:1px solid #eee; border-radius:12px; padding:12px; min-height:350px; cursor:pointer; border-top: 4px solid #1e293b;"><div style="font-weight:bold; font-size:13px; margin-bottom:10px;">${dStr}</div>${dayTasks.map(t => `<div class="badge ${t.bookingStatus}" style="font-size:10px; margin-bottom:6px; display:block; padding:4px;">${t.time} ${t.title.substring(0,20)}...</div>`).join('') || '<small style="color:#ccc;">Libre</small>'}</div>`;
    }
    html += '</div>';
    container.innerHTML = `<div style="display:flex; justify-content:space-between; margin-bottom:20px;"><h2>Vista Semanal</h2><div><button onclick="moveWeek(-7)">Anterior</button> <button onclick="moveWeek(7)">Siguiente</button></div></div>${html}`;
}

function renderMonthly(container) {
    const year = currentMonth.getFullYear(); const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1); const lastDay = new Date(year, month + 1, 0).getDate();
    const offset = (firstDay.getDay() + 6) % 7; 
    let grid = '<div style="display:grid; grid-template-columns:repeat(7, 1fr); gap:5px; background:#f1f5f9; padding:5px; border-radius:12px;">';
    ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].forEach(d => grid += `<div style="text-align:center; font-weight:bold; font-size:11px; color:#64748b; padding:10px;">${d}</div>`);
    for(let i=0; i<offset; i++) grid += '<div style="background:#f8fafc; border-radius:8px;"></div>';
    for(let d=1; d<=lastDay; d++) {
        const dStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        const dayTasks = tasks.filter(t => t.date === dStr);
        grid += `<div onclick="currentDate='${dStr}'; currentView='diaria'; render();" style="min-height:100px; background:white; border-radius:8px; padding:6px; cursor:pointer; display:flex; flex-direction:column; gap:3px;"><strong>${d}</strong>${dayTasks.map(t => `<div class="badge ${t.bookingStatus}" style="font-size:8px; padding:2px 4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${t.time} ${t.title}</div>`).join('')}</div>`;
    }
    grid += '</div>';
    container.innerHTML = `<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;"><h2 style="text-transform:capitalize;">${currentMonth.toLocaleDateString('es-EC',{month:'long', year:'numeric'})}</h2><div><button onclick="moveMonth(-1)">Anterior</button> <button onclick="moveMonth(1)">Siguiente</button
