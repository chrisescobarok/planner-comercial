let tasks = [
    { id: 1, title: 'Nota previa Ecuador vs Costa de Marfil', category: 'deportes', responsible: 'Christian', project: 'Metro Ecuador', workflowStatus: 'Pendiente', contentType: 'Editorial', bookingStatus: 'libre', date: '2026-06-13', time: '09:00', client: '', event: 'Ecuador vs Costa de Marfil' },
    { id: 2, title: 'Reel previa Ecuador vs Costa de Marfil', category: 'deportes', responsible: 'Andrea', project: 'Metro Ecuador', workflowStatus: 'Producción', contentType: 'Comercial', bookingStatus: 'reservado', date: '2026-06-13', time: '16:00', client: 'Suzuki', event: 'Ecuador vs Costa de Marfil' },
    { id: 4, title: 'Resultado final Ecuador vs Costa de Marfil', category: 'deportes', responsible: 'Christian', project: 'Metro Ecuador', workflowStatus: 'Entregado', contentType: 'Comercial', bookingStatus: 'vendido', date: '2026-06-14', time: '18:00', client: 'Supermaxi', event: 'Ecuador vs Costa de Marfil' }
];

let currentView = 'diaria';
let currentDate = '2026-06-14';
let currentWeekStart = '2026-06-14';
let currentMonth = new Date('2026-06-01T00:00:00');

function render() {
    const content = document.getElementById('content');
    updateStats();
    if (currentView === 'diaria') renderDaily(content);
    if (currentView === 'semanal') renderWeekly(content);
    if (currentView === 'mensual') renderMonthly(content);
    if (currentView === 'lista') renderList(content);
}

function updateStats() {
    document.getElementById('statTotal').innerText = tasks.length;
    document.getElementById('statLibre').innerText = tasks.filter(t => t.bookingStatus === 'libre').length;
    document.getElementById('statReservado').innerText = tasks.filter(t => t.bookingStatus === 'reservado').length;
    document.getElementById('statVendido').innerText = tasks.filter(t => t.bookingStatus === 'vendido').length;
}

function taskCard(task) {
    return `
        <div class="task-item is-${task.bookingStatus}">
            <div style="display:flex; justify-content:space-between; align-items:start;">
                <div>
                    <div style="font-size:18px; font-weight:bold;">${task.title}</div>
                    <div style="color:var(--muted); font-size:13px; margin-top:4px;">
                        🕒 ${task.time} | 👤 ${task.responsible} | 🏢 ${task.project}
                    </div>
                    <div style="margin-top:10px;">
                        <span class="badge ${task.bookingStatus}">${task.bookingStatus.toUpperCase()}</span>
                        <span style="margin-left:10px; font-size:12px; font-weight:bold;">📌 ${task.workflowStatus}</span>
                    </div>
                </div>
                ${task.client ? `<div style="text-align:right; font-weight:bold;">Cliente:<br>${task.client}</div>` : ''}
            </div>
        </div>
    `;
}

function renderDaily(container) {
    const filtered = tasks.filter(t => t.date === currentDate);
    container.innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:20px; align-items:center;">
            <h2>Vista Diaria: ${currentDate}</h2>
            <div>
                <button onclick="moveDay(-1)">Anterior</button>
                <button onclick="moveDay(1)">Siguiente</button>
            </div>
        </div>
        ${filtered.map(t => taskCard(t)).join('') || '<p>No hay acciones para este día.</p>'}
    `;
}

function renderWeekly(container) {
    const start = new Date(currentWeekStart + 'T00:00:00');
    let html = '<div style="display:grid; grid-template-columns:repeat(7, 1fr); gap:12px;">';
    for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const dStr = d.toISOString().slice(0, 10);
        const dayTasks = tasks.filter(t => t.date === dStr);
        html += `
            <div class="card" style="padding:10px; min-height:300px; font-size:12px;">
                <div style="font-weight:bold; border-bottom:1px solid #eee; margin-bottom:8px;">${d.toLocaleDateString('es-EC', {weekday:'short', day:'numeric'})}</div>
                ${dayTasks.map(t => `<div class="task-item is-${t.bookingStatus}" style="padding:5px; font-size:10px; margin-bottom:5px;">${t.time}<br>${t.title}</div>`).join('')}
            </div>`;
    }
    html += '</div>';
    container.innerHTML = `<div style="display:flex; justify-content:space-between; margin-bottom:20px;"><h2>Semana del ${currentWeekStart}</h2><div><button onclick="moveWeek(-7)">Anterior</button><button onclick="moveWeek(7)">Siguiente</button></div></div>${html}`;
}

function renderMonthly(container) {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0).getDate();
    const offset = (firstDay.getDay() + 6) % 7;

    let grid = '<div class="calendar-grid">';
    ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].forEach(d => grid += `<div style="text-align:center; font-weight:bold; padding:10px;">${d}</div>`);
    for(let i=0; i<offset; i++) grid += '<div class="day-cell" style="background:#f9f9f9; opacity:0.5;"></div>';
    for(let d=1; d<=lastDay; d++) {
        const dStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        const count = tasks.filter(t => t.date === dStr).length;
        grid += `<div class="day-cell" onclick="currentDate='${dStr}'; currentView='diaria'; render();">
            <strong>${d}</strong>
            ${count > 0 ? `<div style="margin-top:5px; background:var(--primary); color:white; border-radius:4px; text-align:center; font-size:10px;">${count} act.</div>` : ''}
        </div>`;
    }
    grid += '</div>';
    container.innerHTML = `<div style="display:flex; justify-content:space-between; margin-bottom:20px;"><h2 style="text-transform:capitalize;">${currentMonth.toLocaleDateString('es-EC',{month:'long', year:'numeric'})}</h2><div><button onclick="moveMonth(-1)">Anterior</button><button onclick="moveMonth(1)">Siguiente</button></div></div>${grid}`;
}

function renderList(container) {
    container.innerHTML = `<h2>Lista Completa</h2>` + tasks.map(t => taskCard(t)).join('');
}

// Navegación
window.moveDay = (n) => { let d = new Date(currentDate+'T00:00:00'); d.setDate(d.getDate()+n); currentDate=d.toISOString().slice(0,10); render(); };
window.moveWeek = (n) => { let d = new Date(currentWeekStart+'T00:00:00'); d.setDate(d.getDate()+n); currentWeekStart=d.toISOString().slice(0,10); render(); };
window.moveMonth = (n) => { currentMonth.setMonth(currentMonth.getMonth()+n); render(); };

// Switch de vistas
document.querySelectorAll('.view-switch button').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.view-switch button').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentView = e.target.dataset.view;
        render();
    });
});

render();
