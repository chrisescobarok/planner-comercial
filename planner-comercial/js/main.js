// --- DATOS INICIALES ---
let tasks = [
    { id: 1, title: 'Nota previa Ecuador vs Costa de Marfil', category: 'deportes', responsible: 'Christian', project: 'Metro Ecuador', workflowStatus: 'Pendiente', contentType: 'Editorial', bookingStatus: 'libre', date: '2026-06-13', time: '09:00', client: '', event: 'Ecuador vs Costa de Marfil' },
    { id: 2, title: 'Reel previa Ecuador vs Costa de Marfil', category: 'deportes', responsible: 'Andrea', project: 'Metro Ecuador', workflowStatus: 'Producción', contentType: 'Comercial', bookingStatus: 'reservado', date: '2026-06-13', time: '16:00', client: 'Suzuki', event: 'Ecuador vs Costa de Marfil' },
    { id: 4, title: 'Resultado final Ecuador vs Costa de Marfil', category: 'deportes', responsible: 'Christian', project: 'Metro Ecuador', workflowStatus: 'Entregado', contentType: 'Comercial', bookingStatus: 'vendido', date: '2026-06-14', time: '18:00', client: 'Supermaxi', event: 'Ecuador vs Costa de Marfil' }
];

const catalogs = {
    categories: ['deportes', 'automovilismo', 'alimentos', 'entretenimiento', 'corporativo'],
    projects: ['Metro Ecuador', 'Nueva Mujer'],
    workflowStatuses: ['Pendiente', 'Producción', 'Entregado', 'Cancelado'],
    contentTypes: ['Comercial', 'Editorial']
};

// --- VARIABLES DE ESTADO ---
let currentView = 'diaria';
let currentDate = '2026-06-14';
let currentWeekStart = '2026-06-14';
let currentMonth = new Date('2026-06-01T00:00:00');

// --- RENDERIZADO PRINCIPAL ---
function render() {
    updateStats();
    const content = document.getElementById('content');
    if (currentView === 'diaria') renderDaily(content);
    if (currentView === 'semanal') renderWeekly(content);
    if (currentView === 'mensual') renderMonthly(content);
    if (currentView === 'lista') renderList(content);
}

function updateStats() {
    const filtered = getFilteredTasks();
    document.getElementById('statTotal').textContent = filtered.length;
    document.getElementById('statLibre').textContent = filtered.filter(t => t.bookingStatus === 'libre').length;
    document.getElementById('statReservado').textContent = filtered.filter(t => t.bookingStatus === 'reservado').length;
    document.getElementById('statVendido').textContent = filtered.filter(t => t.bookingStatus === 'vendido').length;
}

function getFilteredTasks() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    return tasks.filter(t => t.title.toLowerCase().includes(search) || (t.client && t.client.toLowerCase().includes(search)));
}

// --- VISTA DIARIA ---
function renderDaily(container) {
    const filtered = getFilteredTasks().filter(t => t.date === currentDate);
    container.innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:20px; align-items:center;">
            <h3>Día: ${currentDate}</h3>
            <div>
                <button onclick="moveDay(-1)">⬅️</button>
                <button onclick="moveDay(1)">➡️</button>
            </div>
        </div>
        ${filtered.map(t => taskCard(t)).join('') || '<p class="muted">No hay acciones.</p>'}
    `;
}

// --- VISTA SEMANAL ---
function renderWeekly(container) {
    const start = new Date(currentWeekStart + 'T00:00:00');
    const weekDates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        return d.toISOString().slice(0, 10);
    });

    container.innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:20px;">
            <h3>Semana del ${currentWeekStart}</h3>
            <div>
                <button onclick="moveWeek(-7)">Semana Anterior</button>
                <button onclick="moveWeek(7)">Semana Siguiente</button>
            </div>
        </div>
        <div class="week-grid" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap:10px;">
            ${weekDates.map(date => `
                <div class="card" style="padding:10px; min-height:200px;">
                    <strong style="font-size:12px;">${date}</strong>
                    <hr>
                    ${getFilteredTasks().filter(t => t.date === date).map(t => `
                        <div style="font-size:11px; margin-bottom:5px; padding:5px; background:#f0f4f8; border-radius:5px;">
                            ${t.time} - ${t.title}
                        </div>
                    `).join('')}
                </div>
            `).join('')}
        </div>
    `;
}

// --- VISTA MENSUAL ---
function renderMonthly(container) {
    const monthLabel = currentMonth.toLocaleDateString('es-EC', { month: 'long', year: 'numeric' });
    container.innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:20px;">
            <h3 style="text-transform: capitalize;">${monthLabel}</h3>
            <div>
                <button onclick="moveMonth(-1)">Mes Anterior</button>
                <button onclick="moveMonth(1)">Mes Siguiente</button>
            </div>
        </div>
        <div style="text-align:center; padding:40px; color:gray;">Cargando calendario interactivo...</div>
    `;
}

function taskCard(task) {
    return `
        <div class="task-item">
            <strong>${task.time} - ${task.title}</strong><br>
            <small>${task.project} | ${task.category}</small>
            <div style="margin-top:5px;">
                <span class="badge ${task.bookingStatus}">${task.bookingStatus}</span>
            </div>
        </div>
    `;
}

// --- NAVEGACIÓN ---
window.moveDay = (n) => {
    let d = new Date(currentDate + 'T00:00:00');
    d.setDate(d.getDate() + n);
    currentDate = d.toISOString().slice(0, 10);
    render();
};

window.moveWeek = (n) => {
    let d = new Date(currentWeekStart + 'T00:00:00');
    d.setDate(d.getDate() + n);
    currentWeekStart = d.toISOString().slice(0, 10);
    render();
};

window.moveMonth = (n) => {
    currentMonth.setMonth(currentMonth.getMonth() + n);
    render();
};

// --- INICIALIZACIÓN ---
document.querySelectorAll('.view-switch button').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.view-switch button').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentView = e.target.dataset.view;
        render();
    });
});

document.getElementById('searchInput').addEventListener('input', render);

render();
