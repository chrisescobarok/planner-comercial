const tasks = [
    { id: 1, title: 'Nota previa Ecuador vs Costa de Marfil', responsible: 'Christian', project: 'Metro Ecuador', bookingStatus: 'libre', date: '2026-06-13', time: '09:00', client: '' },
    { id: 2, title: 'Reel previa Ecuador vs Costa de Marfil', responsible: 'Andrea', project: 'Metro Ecuador', bookingStatus: 'reservado', date: '2026-06-13', time: '16:00', client: 'Suzuki' },
    { id: 4, title: 'Resultado final Ecuador vs Costa de Marfil', responsible: 'Christian', project: 'Metro Ecuador', bookingStatus: 'vendido', date: '2026-06-14', time: '18:00', client: 'Supermaxi' }
];

let currentView = 'diaria';
let currentDate = '2026-06-14';
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

function renderDaily(container) {
    const filtered = tasks.filter(t => t.date === currentDate);
    container.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
            <h2>Día: ${currentDate}</h2>
            <div><button onclick="moveDay(-1)">Anterior</button> <button onclick="moveDay(1)">Siguiente</button></div>
        </div>
        ${filtered.map(t => taskCard(t)).join('') || '<p>Sin acciones.</p>'}
    `;
}

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
            ${count > 0 ? `<div style="background:#111827; color:white; border-radius:4px; font-size:10px; text-align:center;">${count} act.</div>` : ''}
        </div>`;
    }
    grid += '</div>';
    container.innerHTML = `<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;"><h2 style="text-transform:capitalize;">${currentMonth.toLocaleDateString('es-EC',{month:'long', year:'numeric'})}</h2><div><button onclick="moveMonth(-1)">Anterior</button> <button onclick="moveMonth(1)">Siguiente</button></div></div>${grid}`;
}

window.moveDay = (n) => { let d = new Date(currentDate+'T00:00:00'); d.setDate(d.getDate()+n); currentDate=d.toISOString().slice(0,10); render(); };
window.moveMonth = (n) => { currentMonth.setMonth(currentMonth.getMonth()+n); render(); };

document.querySelectorAll('.view-switch button').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.view-switch button').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentView = e.target.dataset.view;
        render();
    });
});

render();
