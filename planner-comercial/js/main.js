// --- DATOS INICIALES ---
let tasks = [
    { id: 1, title: 'Nota previa Ecuador vs Costa de Marfil', category: 'deportes', responsible: 'Christian', project: 'Metro Ecuador', workflowStatus: 'Pendiente', contentType: 'Editorial', bookingStatus: 'libre', date: '2026-06-13', time: '09:00', client: '', event: 'Ecuador vs Costa de Marfil' },
    { id: 2, title: 'Reel previa Ecuador vs Costa de Marfil', category: 'deportes', responsible: 'Andrea', project: 'Metro Ecuador', workflowStatus: 'Producción', contentType: 'Comercial', bookingStatus: 'reservado', date: '2026-06-13', time: '16:00', client: 'Suzuki', event: 'Ecuador vs Costa de Marfil' },
    { id: 4, title: 'Resultado final Ecuador vs Costa de Marfil', category: 'deportes', responsible: 'Christian', project: 'Metro Ecuador', workflowStatus: 'Entregado', contentType: 'Comercial', bookingStatus: 'vendido', date: '2026-06-14', time: '18:00', client: 'Supermaxi', event: 'Ecuador vs Costa de Marfil' }
];

// --- VARIABLES DE ESTADO ---
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
    document.getElementById('statTotal').textContent = tasks.length;
    document.getElementById('statLibre').textContent = tasks.filter(t => t.bookingStatus === 'libre').length;
    document.getElementById('statReservado').textContent = tasks.filter(t => t.bookingStatus === 'reservado').length;
    document.getElementById('statVendido').textContent = tasks.filter(t => t.bookingStatus === 'vendido').length;
}

function renderDaily(container) {
    const filtered = tasks.filter(t => t.date === currentDate);
    container.innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:20px;">
            <h3>${currentDate}</h3>
            <div>
                <button onclick="moveDay(-1)">Anterior</button>
                <button onclick="moveDay(1)">Siguiente</button>
            </div>
        </div>
        ${filtered.map(t => `<div class="task-item"><strong>${t.time}</strong> - ${t.title} <span class="badge ${t.bookingStatus}">${t.bookingStatus}</span></div>`).join('') || 'No hay tareas'}
    `;
}

function renderWeekly(container) {
    const start = new Date(currentWeekStart + 'T00:00:00');
    let weekHtml = '<div style="display:grid; grid-template-columns:repeat(7, 1fr); gap:10px;">';
    for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const dateStr = d.toISOString().slice(0, 10);
        const dayTasks = tasks.filter(t => t.date === dateStr);
        weekHtml += `
            <div class="card" style="padding:10px; font-size:12px;">
                <strong>${dateStr}</strong><hr>
                ${dayTasks.map(t => `<div>${t.time} - ${t.title}</div>`).join('') || 'Libre'}
            </div>`;
    }
    weekHtml += '</div>';
    container.innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:20px;">
            <h3>Semana del ${currentWeekStart}</h3>
            <div><button onclick="moveWeek(-7)">Anterior</button><button onclick="moveWeek(7)">Siguiente</button></div>
        </div>
        ${weekHtml}`;
}

function renderMonthly(container) {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0).getDate();
    const offset = (firstDay.getDay() + 6) % 7; 
    
    let gridHtml = '<div class="calendar-grid">';
    // Nombres de los días
    ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].forEach(d => gridHtml += `<div class="day-name">${d}</div>`);
    // Espacios vacíos
    for (let i = 0; i < offset; i++) gridHtml += '<div class="day-cell empty"></div>';
    // Días del mes
    for (let d = 1; d <= lastDay; d++) {
        const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        const count = tasks.filter(t => t.date === dateStr).length;
        gridHtml += `
            <div class="day-cell" onclick="currentDate='${dateStr}'; currentView='diaria'; render();">
                <strong>${d}</strong>
                ${count > 0 ? `<div style="background:var(--primary); color:white; border-radius:5px; font-size:10px; margin-top:5px;">${count} act.</div>` : ''}
            </div>`;
    }
    gridHtml += '</div>';

    container.innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:20px;">
            <h3 style="text-transform:capitalize;">${currentMonth.toLocaleDateString('es-EC',{month:'long', year:'numeric'})}</h3>
            <div><button onclick="moveMonth(-1)">Mes Anterior</button><button onclick="moveMonth(1)">Mes Siguiente</button></div>
        </div>
        ${gridHtml}`;
}

function renderList(container) {
    container.innerHTML = `<h3>Todas las acciones</h3>` + tasks.map(t => `<div class="task-item">${t.date} - ${t.title}</div>`).join('');
}

// Navegación Global
window.moveDay = (n) => { let d = new Date(currentDate+'T00:00:00'); d.setDate(d.getDate()+n); currentDate=d.toISOString().slice(0,10); render(); };
window.moveWeek = (n) => { let d = new Date(currentWeekStart+'T00:00:00'); d.setDate(d.getDate()+n); currentWeekStart=d.toISOString().slice(0,10); render(); };
window.moveMonth = (n) => { currentMonth.setMonth(currentMonth.getMonth()+n); render(); };

// Event Listeners para botones de vista
document.querySelectorAll('.view-switch button').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.view-switch button').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentView = e.target.dataset.view;
        render();
    });
});

render();
