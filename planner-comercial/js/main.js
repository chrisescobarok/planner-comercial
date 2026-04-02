// --- DATOS Y CONFIGURACIÓN ---
let tasks = [
    { id: 1, title: 'Nota previa Ecuador vs Costa de Marfil', responsible: 'Christian', project: 'Metro Ecuador', bookingStatus: 'libre', date: '2026-06-13', time: '09:00', client: '' },
    { id: 2, title: 'Reel previa Ecuador vs Costa de Marfil', responsible: 'Andrea', project: 'Metro Ecuador', bookingStatus: 'reservado', date: '2026-06-13', time: '16:00', client: 'Suzuki' },
    { id: 4, title: 'Resultado final Ecuador vs Costa de Marfil', responsible: 'Christian', project: 'Metro Ecuador', bookingStatus: 'vendido', date: '2026-06-14', time: '18:00', client: 'Supermaxi' },
    { id: 5, title: 'Análisis Post-Partido', responsible: 'Carlos Bolaños', project: 'Metro Ecuador', bookingStatus: 'libre', date: '2026-06-15', time: '10:00', client: '' }
];

let currentView = 'diaria';
let currentDate = '2026-06-14';
let currentWeekStart = '2026-06-08'; 
let currentMonth = new Date('2026-06-01T00:00:00');

// --- MOTOR DE RENDERIZADO ---
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

// --- VISTA LISTA CON FRANJAS DE DÍA ---
function renderList(container) {
    const sortedTasks = [...tasks].sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.time.localeCompare(b.time);
    });

    let html = '<h2>Cronograma Detallado</h2>';
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

// --- VISTAS RESTANTES ---
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
        ${filtered
