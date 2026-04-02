// --- DATOS INICIALES ---
let tasks = [
    { id: 1, title: 'Nota previa Ecuador vs Costa de Marfil', responsible: 'Christian', project: 'Metro Ecuador', bookingStatus: 'libre', date: '2026-06-13', time: '09:00' },
    { id: 2, title: 'Reel previa Ecuador vs Costa de Marfil', responsible: 'Andrea', project: 'Metro Ecuador', bookingStatus: 'reservado', date: '2026-06-13', time: '16:00' },
    { id: 4, title: 'Resultado final Ecuador vs Costa de Marfil', responsible: 'Christian', project: 'Metro Ecuador', bookingStatus: 'vendido', date: '2026-06-14', time: '18:00' }
];

let currentUser = null;
let currentView = 'lista';
let currentMonth = new Date('2026-06-01T00:00:00');

// --- FUNCIONES DE NAVEGACIÓN ---
window.moveMonth = (n) => { currentMonth.setMonth(currentMonth.getMonth() + n); render(); };

// --- MOTOR DE DIBUJO ---
function render() {
    const content = document.getElementById('content');
    if (!content) return;

    // Actualizar Números Superiores
    document.getElementById('statTotal').innerText = tasks.length;
    document.getElementById('statLibre').innerText = tasks.filter(t => t.bookingStatus === 'libre').length;
    document.getElementById('statReservado').innerText = tasks.filter(t => t.bookingStatus === 'reservado').length;
    document.getElementById('statVendido').innerText = tasks.filter(t => t.bookingStatus === 'vendido').length;

    if (currentView === 'mensual') renderMonthly(content);
    else renderList(content);
}

function renderMonthly(container) {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    
    let monthOptions = "";
    [2025, 2026, 2027].forEach(y => {
        monthNames.forEach((m, i) => {
            monthOptions += `<option value="${y}-${i}" ${(y===year && i===month) ? 'selected' : ''}>${m} ${y}</option>`;
        });
    });

    container.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
            <div style="display:flex; align-items:center; gap:10px;">
                <h2 style="margin:0;">${monthNames[month]} ${year}</h2>
                <select onchange="let v=this.value.split('-'); currentMonth.setFullYear(v[0]); currentMonth.setMonth(v[1]); render();" style="padding:5px; border-radius:8px;">
                    ${monthOptions}
                </select>
            </div>
            <div>
                <button onclick="moveMonth(-1)">⬅️</button>
                <button onclick="moveMonth(1)">➡️</button>
            </div>
        </div>
        <div style="display:grid; grid-template-columns:repeat(7, 1fr); gap:5px; background:#f1f5f9; padding:5px; border-radius:12px; min-height:300px;">
            ${Array.from({length: 31}, (_, i) => `<div style="background:white; border-radius:8px; padding:10px; min-height:80px;">${i+1}</div>`).join('')}
        </div>`;
}

function renderList(container) {
    let html = '<h2>Cronograma Detallado</h2>';
    tasks.forEach(t => {
        html += `<div style="background:white; padding:15px; margin-bottom:10px; border-radius:12px; border-left:5px solid #1e293b;">
            <strong>${t.date}</strong> - ${t.title} (${t.bookingStatus})
        </div>`;
    });
    container.innerHTML = html;
}

// --- EVENTOS ---
document.querySelectorAll('.view-switch button').forEach(btn => {
    btn.onclick = (e) => {
        currentView = e.target.getAttribute('data-view');
        render();
    };
});

// Arrancar
render();
