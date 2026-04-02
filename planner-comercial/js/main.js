// 1. DATOS INICIALES (PARA QUE NO SALGA EN 0)
let tasks = [
    { id: 1, title: 'Nota previa Ecuador vs Costa de Marfil', responsible: 'Christian', project: 'Metro Ecuador', bookingStatus: 'libre', date: '2026-06-13', time: '09:00' },
    { id: 2, title: 'Reel previa Ecuador vs Costa de Marfil', responsible: 'Andrea', project: 'Metro Ecuador', bookingStatus: 'reservado', date: '2026-06-13', time: '16:00' },
    { id: 4, title: 'Resultado final Ecuador vs Costa de Marfil', responsible: 'Christian', project: 'Metro Ecuador', bookingStatus: 'vendido', date: '2026-06-14', time: '18:00' }
];

let currentView = 'lista'; // Iniciamos en lista que es la más segura
let currentMonth = new Date('2026-06-01T00:00:00');

// 2. MOTOR DE DIBUJO
function render() {
    const content = document.getElementById('content');
    if (!content) return;

    // Actualizar contadores
    document.getElementById('statTotal').innerText = tasks.length;
    document.getElementById('statLibre').innerText = tasks.filter(t => t.bookingStatus === 'libre').length;
    document.getElementById('statReservado').innerText = tasks.filter(t => t.bookingStatus === 'reservado').length;
    document.getElementById('statVendido').innerText = tasks.filter(t => t.bookingStatus === 'vendido').length;

    // Dibujar lista por defecto
    let html = '<h2 style="margin-bottom:20px;">Cronograma Detallado</h2>';
    tasks.forEach(t => {
        html += `
        <div style="background:white; padding:15px; margin-bottom:10px; border-radius:12px; border-left:5px solid #1e293b; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <div style="font-weight:bold; color:#1e293b;">📅 ${t.date} | 🕒 ${t.time}</div>
            <div style="font-size:18px; margin-top:5px;">${t.title}</div>
            <div style="color:gray; font-size:13px; margin-top:5px;">👤 ${t.responsible} | <span style="text-transform:uppercase; font-weight:bold;">${t.bookingStatus}</span></div>
        </div>`;
    });
    content.innerHTML = html;
}

// 3. EVENTOS DE LOS BOTONES
document.querySelectorAll('.view-switch button').forEach(btn => {
    btn.onclick = (e) => {
        // Solo para probar que los botones responden
        document.querySelectorAll('.view-switch button').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        render();
    };
});

// Lanzar el render apenas cargue
window.onload = render;
render();
