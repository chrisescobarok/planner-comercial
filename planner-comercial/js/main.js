// --- DATOS INICIALES (Simulados hasta conectar base de datos) ---
const tasks = [
    { id: 1, title: 'Nota previa Ecuador vs Costa de Marfil', category: 'deportes', responsible: 'Christian', project: 'Metro Ecuador', workflowStatus: 'Pendiente', contentType: 'Editorial', bookingStatus: 'libre', date: '2026-06-13', time: '09:00', client: '', reservedBy: '', reservationDate: '', event: 'Ecuador vs Costa de Marfil', notes: 'Espacio web premium del día previo.' },
    { id: 2, title: 'Reel previa Ecuador vs Costa de Marfil', category: 'deportes', responsible: 'Andrea', project: 'Metro Ecuador', workflowStatus: 'Producción', contentType: 'Comercial', bookingStatus: 'reservado', date: '2026-06-13', time: '16:00', client: 'Suzuki', reservedBy: 'Andrea', reservationDate: '2026-03-31 10:15', event: 'Ecuador vs Costa de Marfil', notes: 'Incluye branding de apertura.' },
    { id: 4, title: 'Resultado final Ecuador vs Costa de Marfil', category: 'deportes', responsible: 'Christian', project: 'Metro Ecuador', workflowStatus: 'Entregado', contentType: 'Comercial', bookingStatus: 'vendido', date: '2026-06-14', time: '18:00', client: 'Supermaxi', reservedBy: 'Christian', reservationDate: '2026-03-31 12:30', event: 'Ecuador vs Costa de Marfil', notes: 'Pieza final con call to action.' }
];

const USERS = [
    { username: 'master.metro', aliases: ['master'], password: 'Mundial2026!', role: 'master' },
    { username: 'reserva.metro', aliases: ['reserva'], password: 'Mundial2026?', role: 'reserve' }
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
let currentRole = 'public';
let currentUser = null;
let pendingReserveId = null;
let editingTaskId = null;

// --- ELEMENTOS DEL DOM ---
const content = document.getElementById('content');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const statusFilter = document.getElementById('statusFilter');

// --- FUNCIONES DE AYUDA ---
function isMaster() { return currentRole === 'master'; }
function canReserve() { return currentRole === 'master' || currentRole === 'reserve'; }

function nowStamp() {
    const d = new Date();
    return d.toISOString().slice(0, 10) + ' ' + d.toTimeString().slice(0, 5);
}

function formatLongDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

// --- RENDERIZADO ---
function render() {
    updateStats();
    if (currentView === 'diaria') renderDaily();
    if (currentView === 'semanal') renderWeekly();
    if (currentView === 'mensual') renderMonthly();
    if (currentView === 'lista') renderList();
}

function updateStats() {
    const filtered = getFilteredTasks();
    document.getElementById('statTotal').textContent = filtered.length;
    document.getElementById('statLibre').textContent = filtered.filter(t => t.bookingStatus === 'libre').length;
    document.getElementById('statReservado').textContent = filtered.filter(t => t.bookingStatus === 'reservado').length;
    document.getElementById('statVendido').textContent = filtered.filter(t => t.bookingStatus === 'vendido').length;
}

function getFilteredTasks() {
    const search = searchInput.value.toLowerCase();
    const cat = categoryFilter.value;
    const stat = statusFilter.value;

    return tasks.filter(t => {
        const matchSearch = t.title.toLowerCase().includes(search) || (t.client && t.client.toLowerCase().includes(search));
        const matchCat = cat === 'todas' || t.category === cat;
        const matchStat = stat === 'todas' || t.bookingStatus === stat;
        return matchSearch && matchCat && matchStat;
    }).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
}

function taskCard(task) {
    return `
        <div class="task-item">
            <div style="display:flex; justify-content:space-between;">
                <div>
                    <h3 style="margin:0;">${task.title}</h3>
                    <div style="font-size:12px; color:gray;">${task.time} | ${task.category} | ${task.project}</div>
                    <div style="margin-top:5px;">
                        <span class="badge ${task.bookingStatus}">${task.bookingStatus.toUpperCase()}</span>
                        <span class="workflow-badge ${task.workflowStatus.toLowerCase()}">${task.workflowStatus}</span>
                    </div>
                    ${task.client ? `<div style="font-weight:bold; margin-top:5px;">Cliente: ${task.client}</div>` : ''}
                </div>
                <div>
                    ${canReserve() && task.bookingStatus === 'libre' ? `<button onclick="openReserveModal(${task.id})">Reservar</button>` : ''}
                    ${isMaster() ? `<button onclick="openEditModal(${task.id})">Editar</button>` : ''}
                </div>
            </div>
        </div>
    `;
}

function renderDaily() {
    const filtered = getFilteredTasks().filter(t => t.date === currentDate);
    content.innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:15px;">
            <h2>${formatLongDate(currentDate)}</h2>
            <div>
                <button onclick="moveDay(-1)">Anterior</button>
                <button onclick="moveDay(1)">Siguiente</button>
            </div>
        </div>
        ${filtered.map(taskCard).join('') || '<p>No hay acciones para hoy.</p>'}
    `;
}

// Funciones de navegación
window.moveDay = (delta) => {
    let d = new Date(currentDate + 'T00:00:00');
    d.setDate(d.getDate() + delta);
    currentDate = d.toISOString().slice(0, 10);
    render();
};

// --- LOGIN LÓGICA ---
function attemptLogin() {
    const user = document.getElementById('loginUser').value;
    const pass = document.getElementById('loginPass').value;
    const found = USERS.find(u => u.username === user && u.password === pass);

    if (found) {
        currentRole = found.role;
        currentUser = found;
        document.getElementById('loginBackdrop').classList.remove('open');
        updateRoleUI();
        render();
    } else {
        alert('Credenciales incorrectas');
    }
}

function updateRoleUI() {
    const auth = document.getElementById('authStatus');
    const loginBtn = document.getElementById('roleLoginBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    if (currentRole === 'public') {
        auth.textContent = '👁️ Modo público';
        loginBtn.style.display = 'block';
        logoutBtn.style.display = 'none';
    } else {
        auth.textContent = currentRole === 'master' ? '🟢 Master activo' : '🟡 Reserva activo';
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'block';
    }
}

// --- EVENT LISTENERS ---
document.getElementById('loginSubmitBtn')?.addEventListener('click', attemptLogin);
document.getElementById('roleLoginBtn')?.addEventListener('click', () => document.getElementById('loginBackdrop').classList.add('open'));
document.getElementById('closeLoginBtn')?.addEventListener('click', () => document.getElementById('loginBackdrop').classList.remove('open'));
document.getElementById('logoutBtn')?.addEventListener('click', () => { currentRole = 'public'; updateRoleUI(); render(); });
searchInput.addEventListener('input', render);

// --- INICIO ---
function init() {
    // Llenar select de categorías
    const catSelect = document.getElementById('categoryFilter');
    catSelect.innerHTML = '<option value="todas">Todas las categorías</option>' + 
        catalogs.categories.map(c => `<option value="${c}">${c}</option>`).join('');
    
    updateRoleUI();
    render();
}

init();

// Exponer funciones necesarias globalmente para los onclick del HTML
window.openReserveModal = (id) => { /* lógica modal reserva */ alert('Lógica de reserva para ID: ' + id); };
window.openEditModal = (id) => { /* lógica modal edición */ alert('Lógica de edición para ID: ' + id); };