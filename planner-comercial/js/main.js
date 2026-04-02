// --- 1. CONFIGURACIÓN Y DATOS ---
const USERS = {
    "editorial": { pass: "metro2026", role: "Editorial", color: "#2563eb" },
    "content": { pass: "content2026", role: "Content", color: "#10b981" },
    "trafico": { pass: "trafico2026", role: "Tráfico y Control", color: "#f59e0b" }
};

let currentUser = null; 
let tasks = [
    { id: 1, title: 'Nota previa Ecuador vs Costa de Marfil', responsible: 'Christian', project: 'Metro Ecuador', bookingStatus: 'libre', date: '2026-06-13', time: '09:00', client: '' },
    { id: 2, title: 'Reel previa Ecuador vs Costa de Marfil', responsible: 'Andrea', project: 'Metro Ecuador', bookingStatus: 'reservado', date: '2026-06-13', time: '16:00', client: 'Suzuki' },
    { id: 4, title: 'Resultado final Ecuador vs Costa de Marfil', responsible: 'Christian', project: 'Metro Ecuador', bookingStatus: 'vendido', date: '2026-06-14', time: '18:00', client: 'Supermaxi' }
];

// Variables de navegación (Mundial 2026)
let currentView = 'lista'; 
let currentDate = '2026-06-13';
let currentWeekStart = new Date('2026-06-08T00:00:00'); 
let currentMonth = new Date('2026-06-01T00:00:00');

// --- 2. SISTEMA DE LOGIN Y MODALES ---
window.openLogin = () => document.getElementById('loginModal').style.display = 'flex';
window.closeLogin = () => document.getElementById('loginModal').style.display = 'none';
window.openActionModal = () => document.getElementById('actionModal').style.display = 'flex';
window.closeActionModal = () => document.getElementById('actionModal').style.display = 'none';

window.attemptLogin = () => {
    const u = document.getElementById('userInput').value;
    const p = document.getElementById('passInput').value;
    if (USERS[u] && USERS[u].pass === p) {
        currentUser = { name: u, ...USERS[u] };
        document.getElementById('authStatus').innerHTML = `<span style="color:${currentUser.color}; font-weight:bold;">● ${currentUser.role}</span>`;
        document.getElementById('roleLoginBtn').style.display = 'none';
        document.getElementById('logoutBtn').style.display = 'block';
        if(currentUser.role === "Editorial") document.getElementById('btnNuevaAccion').style.display = 'inline-block';
        closeLogin();
        render();
    } else { alert("Usuario o clave incorrectos"); }
};

window.logout = () => {
    currentUser = null;
    document.getElementById('authStatus').innerText = "👁️ Modo público";
    document.getElementById('roleLoginBtn').style.display = 'block';
    document.getElementById('logoutBtn').style.display = 'none';
    document.getElementById('btnNuevaAccion').style.display = 'none';
    render();
};

// --- 3. GUARDAR NUEVA ACCIÓN ---
window.saveNewAction = () => {
    const title = document.getElementById('newTitle').value;
    const date = document.getElementById('newDate').value;
    const time = document.getElementById('newTime').value;
    const resp = document.getElementById('newResp').value;
    const status = document.getElementById('newStatus').value;
    if(!title || !date || !time) return alert("Completa Título, Fecha y Hora");
    tasks.push({ id: Date.now(), title, date, time, responsible: resp, project: "Metro Ecuador", bookingStatus: status, client: "" });
    closeActionModal();
    render();
    document.getElementById('newTitle').value = "";
};

// --- 4. MOTOR DE RENDERIZADO (DISEÑO BLOQUEADO) ---
function render() {
    const content = document.getElementById('content');
    if(!content) return;
    
    // Contadores
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
    return `<div class="task-item is-${t.bookingStatus}"><div style="display:flex; justify-content:space-between; align-items:start;"><div><span class="badge ${t.bookingStatus}">${t.bookingStatus}</span><div style="font-size:18px; font-weight:bold; margin-top:8px;">${t.title}</div><div style="color:gray; font-size:13px; margin-top:5px;">🕒 ${t.time} | 👤 ${t.responsible}</div><div style="margin-top:10px;">${btn}</div></div>${t.client ? `<div style="text-align:right;"><small>Cliente</small><br><strong>${t.client}</strong></div>` : ''}</div></div>`;
}

function renderDaily(container) {
    const filtered = tasks.filter(t => t.date === currentDate);
    container.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
            <h2 style="margin:0;">Día: ${currentDate}</h2>
            <div style="display:flex; gap:10px;">
                <button onclick="moveDay(-1)" style="padding:5px 12px; cursor:pointer; border-radius:8px; border:1px solid #ddd; background:white;">⬅️ Anterior</button>
                <button onclick="moveDay(1)" style="padding:5px 12px; cursor:pointer; border-radius:8px; border:1px solid #ddd; background:white;">Siguiente ➡️</button>
            </div>
        </div>` + (filtered.map(t => taskCard(t)).join('') || '<p>Sin acciones.</p>');
}

function renderWeekly(container) {
    let html = '<div style="display:grid; grid-template-columns:repeat(7, 1fr); gap:10px;">';
    for (let i = 0; i < 7; i++) {
        let d = new Date(currentWeekStart);
        d.setDate(currentWeekStart.getDate() + i);
        const dStr = d.toISOString().slice(0, 10);
        const dayTasks = tasks.filter(t => t.date === dStr);
        html += `<div onclick="currentDate='${dStr}'; currentView='diaria'; render();" style="background:white; border:1px solid #eee; border-radius:10px; padding:10px; min-height:300px; cursor:pointer; border-top: 4px solid #1e293b;"><div style="font-weight:bold; font-size:11px; margin-bottom:10px;">${dStr}</div>${dayTasks.map(t => `<div class="badge ${t.bookingStatus}" style="font-size:9px; margin-bottom:4px; display:block; padding:2px;">${t.time} ${t.title.substring(0,12)}...</div>`).join('')}</div>`;
    }
    container.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
            <h2 style="margin:0;">Vista Semanal</h2>
            <div style="display:flex; gap:10px;">
                <button onclick="moveWeek(-7)" style="padding:5px 12px; cursor:pointer; border-radius:8px; border:1px solid #ddd; background:white;">⬅️ Anterior</button>
                <button onclick="moveWeek(7)" style="padding:5px 12px; cursor:pointer; border-radius:8px; border:1px solid #ddd; background:white;">Siguiente ➡️</button>
            </div>
        </div>${html}</div>`;
}

function renderMonthly(container) {
    const year = currentMonth.getFullYear(); 
    const month = currentMonth.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1);
    const offset = (firstDay.getDay() + 6) % 7;

    // Generador de Menú Desplegable
    let monthOptions = "";
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    [2025, 2026, 2027].forEach(y => {
        monthNames.forEach((m, i) => {
            const isSelected = (y === year && i === month) ? "selected" : "";
            monthOptions += `<option value="${y}-${i}" ${isSelected}>${m} ${y}</option>`;
        });
    });

    let grid = '<div style="display:grid; grid-template-columns:repeat(7, 1fr); gap:5px; background:#f1f5f9; padding:5px; border-radius:12px;">';
    ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].forEach(d => grid += `<div style="text-align:center; font-weight:bold; font-size:11px; color:#64748b; padding:5px;">${d}</div>`);
    for(let i=0; i<offset; i++) grid += '<div style="background:#f8fafc; border-radius:8px;"></div>';
    
    for(let d=1; d<=lastDay; d++) {
        const dStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        const dayTasks = tasks.filter(t => t.date === dStr);
        grid += `<div onclick="currentDate='${dStr}'; currentView='diaria'; render();" style="min-height:100px; background:white; border-radius:8px; padding:8px; cursor:pointer; border-top: 1px solid #eee;">
            <strong style="font-size:12px;">${d}</strong>
            ${dayTasks.map(t => `<div class="badge ${t.bookingStatus}" style="font-size:8px; padding:2px; margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${t.title}</div>`).join('')}
        </div>`;
    }
    grid += '</div>';

    container.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; gap:10px; flex-wrap:wrap;">
            <div style="display:flex; align-items:center; gap:12px;">
                <h2 style="text-transform:capitalize; margin:0; font-size:20px;">${currentMonth.toLocaleDateString('es-EC',{month:'long', year:'numeric'})}</h2>
                <select onchange="let v=this.value.split('-'); currentMonth.setFullYear(v[0]); currentMonth.setMonth(v[1]); render();" 
                        style="padding:6px 10px; border-radius:8px; border:1px solid #cbd5e1; background:white; font-size:14px; cursor:pointer; font-weight:500; color:#334155;">
                    ${monthOptions}
                </select>
            </div>
            <div style="display:flex; gap:8px;">
                <button onclick="moveMonth(-1)" style="padding:6px 12px; cursor:pointer; border-radius:8px; border:1px solid #cbd5e1; background:white; font-weight:bold;">⬅️</button>
                <button onclick="moveMonth(1)" style="padding:6px 12px; cursor:pointer; border-radius:8px; border:1px solid #cbd5e1; background:white; font-weight:bold;">➡️</button>
            </div>
        </div>
        ${grid}`;
}
}

function renderList(container) {
    let html = '<h2>Cronograma Detallado</h2>';
    let lastDate = null;
    [...tasks].sort((a,b)=>a.date.localeCompare(b.date)).forEach(t => {
        if (t.date !== lastDate) {
            html += `<div style="background:#e2e8f0; padding:12px; margin:25px 0 10px 0; border-radius:10px; font-weight:bold; border-left:5px solid #1e293b;">📅 ${t.date}</div>`;
            lastDate = t.date;
        }
        html += taskCard(t);
    });
    container.innerHTML = html;
}

// --- 5. FUNCIONES DE NAVEGACIÓN ---
window.moveDay = (n) => { 
    let d = new Date(currentDate + 'T00:00:00'); 
    d.setDate(d.getDate() + n); 
    currentDate = d.toISOString().slice(0,10); 
    render(); 
};
window.moveWeek = (n) => { 
    currentWeekStart.setDate(currentWeekStart.getDate() + n); 
    render(); 
};
window.moveMonth = (n) => { 
    currentMonth.setMonth(currentMonth.getMonth() + n); 
    render(); 
};

// --- 6. EVENTOS ---
document.getElementById('roleLoginBtn').onclick = window.openLogin;
document.getElementById('logoutBtn').onclick = window.logout;
document.getElementById('btnNuevaAccion').onclick = window.openActionModal;
document.querySelectorAll('.view-switch button').forEach(btn => {
    btn.onclick = (e) => {
        document.querySelectorAll('.view-switch button').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentView = e.target.getAttribute('data-view');
        render();
    };
});

render();
