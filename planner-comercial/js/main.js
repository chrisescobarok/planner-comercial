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

let currentView = 'lista'; 
let currentDate = '2026-06-13';
let currentWeekStart = new Date('2026-06-08T00:00:00'); 
let currentMonth = new Date('2026-06-01T00:00:00');

// --- 2. LOGIN Y MODALES ---
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

// --- 3. GUARDAR ACCIÓN ---
window.saveNewAction = () => {
    const title = document.getElementById('newTitle').value;
    const date = document.getElementById('newDate').value;
    const time = document.getElementById('newTime').value;
    const resp = document.getElementById('newResp').value;
    const status = document.getElementById('newStatus').value;
    if(!title || !date || !time) return alert("Completa los campos");
    tasks.push({ id: Date.now(), title, date, time, responsible: resp, project: "Metro Ecuador", bookingStatus: status, client: "" });
    closeActionModal();
    render();
};

// --- 4. MOTOR DE RENDERIZADO ---
function render() {
    const content = document.getElementById('content');
    if(!content) return;
    document.getElementById('statTotal').innerText = tasks.length;
    document.getElementById('statLibre').innerText = tasks.filter(t => t.bookingStatus === 'libre').length;
    document.getElementById('statReservado').innerText = tasks.filter(t => t.bookingStatus === 'reservado').length;
    document.getElementById('statVendido').innerText = tasks.filter(t => t.bookingStatus === 'vendido').length;

    if (currentView === 'diaria') renderDaily(content);
    else if (currentView === 'semanal') renderWeekly(content);
    else if (currentView === 'mensual') renderMonthly(content);
    else renderList(
