// --- DATOS DE PRUEBA (MUNDIAL JUNIO 2026) ---
let tasks = [
    { id: 1, title: 'Nota previa Ecuador vs Costa de Marfil', responsible: 'Christian', project: 'Metro Ecuador', bookingStatus: 'libre', date: '2026-06-13', time: '09:00', client: '' },
    { id: 2, title: 'Reel previa Ecuador vs Costa de Marfil', responsible: 'Andrea', project: 'Metro Ecuador', bookingStatus: 'reservado', date: '2026-06-13', time: '16:00', client: 'Suzuki' },
    { id: 4, title: 'Resultado final Ecuador vs Costa de Marfil', responsible: 'Christian', project: 'Metro Ecuador', bookingStatus: 'vendido', date: '2026-06-14', time: '18:00', client: 'Supermaxi' },
    { id: 5, title: 'Análisis Post-Partido', responsible: 'Carlos Bolaños', project: 'Metro Ecuador', bookingStatus: 'libre', date: '2026-06-15', time: '10:00', client: '' }
];

// --- VARIABLES DE ESTADO INICIAL ---
let currentView = 'lista'; // Empezamos en lista para que veas contenido de una
let currentDate = '2026-06-14';
let currentWeekStart = '2026-06-08'; 
let currentMonth = new Date('2026-06-01T00:00:00');

// --- MOTOR DE RENDERIZADO ---
function render() {
    const content = document.getElementById('content');
    if (!content) return;
    
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
    return `
        <div class="task-item is-${t.bookingStatus}">
            <div style="display:flex; justify-content:space-between; align-items:start;">
                <div>
                    <span class="badge ${t.bookingStatus}">${t.bookingStatus}</span>
                    <div style="font-size:18px; font-weight:bold; margin-top:8px;">${t.title}</div>
                    <div style="color:var(--muted); font-size:13px; margin-top:5px;">🕒 ${t.time} | 👤 ${t.responsible}</div>
                </div>
                ${t.client ? `<div style="text-align:right;"><small>Cliente</small><br><strong>${t.client}</strong></div>` : ''}
            </div>
        </div>
    `;
}

// --- VISTA DIARIA ---
function renderDaily(container) {
    const filtered = tasks.filter(t => t.date === currentDate);
    container.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
            <h2>Vista Diaria</h2>
            <div style="display:flex; gap:10px; align-items:center;">
                <button onclick="moveDay(-1)">Anterior</button>
                <input type="date" value="${currentDate}" onchange="currentDate=this.value; render();" style="padding:8px; border-radius:8px; border:1px solid #ddd;">
                <button onclick="moveDay(1)">Siguiente</button>
            </div>
        </div>
        ${filtered.map(t => taskCard(t)).join('') || '<p>Sin acciones para esta fecha.</p>'}
    `;
}

// --- VISTA SEMANAL ---
function renderWeekly(container) {
    const start = new Date(currentWeekStart + 'T00:00:00');
    let html = '<div style="display:grid; grid-template-columns:repeat(7, 1fr); gap:12px;">';
    for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const dStr = d.toISOString().slice(0, 10);
        const dayTasks = tasks.filter(t => t.date === dStr);
        html += `
            <div style="background:white; border:1px solid #eee; border-radius:12px; padding:10px; min-height:250px;">
                <div style="font-weight:bold; font-size:11px; border-bottom:1px solid #eee; padding-bottom:5px; margin-bottom:10px; color:#1e293b;">${dStr}</div>
                ${dayTasks.map(t => `<div class="badge ${t.bookingStatus}" style="font-size:9px; margin-bottom:4px; display:block;">${t.time} ${t.title.substring(0,12)}...</div>`).join('')}
            </div>`;
    }
    html += '</div>';
    container.innerHTML = `<div style="display:flex; justify-content:space-between; margin-bottom:20px;"><h2>Vista Semanal</h2><div><button onclick="moveWeek(-7)">Semana Anterior</button> <button onclick="moveWeek(7)">Semana Siguiente</button></div></div>${html}`;
}

// --- VISTA MENSUAL ---
function renderMonthly(container) {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0).getDate();
    const offset = (firstDay.getDay() + 6) % 7; 

    let grid = '<div class="calendar-grid">';
    ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].forEach(d => grid += `<div class="day-name">${d}</div>`);
    for(let i=0; i<offset; i++) grid += '<div class="day-cell" style="opacity:0.2;"></div>';
    for(let d=1; d<=lastDay; d++) {
        const dStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        const count = tasks.filter(t => t.date === dStr).length;
        grid += `<div class="day-cell" onclick="currentDate='${dStr}'; currentView='diaria'; render();">
            <strong>${d}</strong>
            ${count > 0 ? `<div style="background:#111827; color:white; border-radius:4px; font-size:10px; text-align:center; margin-top:5px;">${count} act.</div>` : ''}
        </div>`;
    }
    grid += '</div>';
    container.innerHTML = `<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;"><h2 style="text-transform:capitalize;">${currentMonth.toLocaleDateString('es-EC',{month:'long', year:'numeric'})}</h2><div><button onclick="moveMonth(-1)">Anterior</button> <button onclick="moveMonth(1)">Siguiente</button></div></div>${grid}`;
}

// --- VISTA LISTA (CON FRANJAS) ---
function renderList(container) {
    const sortedTasks = [...tasks].sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.time.localeCompare(b.time);
    });

    let html = '<h2>Cronograma de Acciones</h2>';
    let lastDate = null;

    sortedTasks.forEach(t => {
        if (t.date !== lastDate) {
            const dateObj = new Date(t.date + 'T00:00:00');
            const dayLabel = dateObj.toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'long' });
            html += `
                <div style="background: #e2e8f0; padding: 12px 20px; margin: 30px 0 15px 0; border-radius: 12px; display: flex; align-items: center; gap: 10px; border-left: 6px solid #1e293b;">
                    <span style="text-transform: capitalize; font-weight: 800; color: #1e293b; font-size: 16px;">📅 ${dayLabel}</span>
                </div>`;
            lastDate = t.date;
        }
        html += taskCard(t);
    });
    container.innerHTML = html || '<p>No hay acciones registradas.</p>';
}

// --- NAVEGACIÓN ---
window.moveDay = (n) => { let d = new Date(currentDate+'T00:00:00'); d.setDate(d.getDate()+n); currentDate=d.toISOString().slice(0,10); render(); };
window.moveWeek = (n) => { let d = new Date(currentWeekStart+'T00:00:00'); d.setDate(d.getDate()+n); currentWeekStart=d.toISOString().slice(0,10); render(); };
window.moveMonth = (n) => { currentMonth.setMonth(currentMonth.getMonth()+n); render(); };

// --- EVENTOS INICIALES ---
document.getElementById('roleLoginBtn').onclick = () => alert('Acceso restringido: El sistema de login se activará con la base de datos.');

// Conectamos los botones de las pestañas
document.querySelectorAll('.view-switch button').forEach(btn => {
    btn.onclick = (e) => {
        document.querySelectorAll('.view-switch button').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentView = e.target.getAttribute('data-view');
        render();
    };
});

// Arrancamos la web
render();
