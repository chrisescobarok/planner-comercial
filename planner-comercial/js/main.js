document.addEventListener('DOMContentLoaded', () => {
    // 1. Mostrar Fecha Actual
    const dateElement = document.getElementById('current-date');
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateElement.textContent = new Date().toLocaleDateString('es-ES', options);

    // 2. Simular Datos de Tabla de Posiciones (Liga Pro)
    const leagueData = [
        { pos: 1, team: 'Independiente del Valle', pts: 25 },
        { pos: 2, team: 'LDU Quito', pts: 22 },
        { pos: 3, team: 'Barcelona SC', pts: 20 },
        { pos: 4, team: 'Aucas', pts: 19 },
        { pos: 5, team: 'Emelec', pts: 17 }
    ];

    const tableBody = document.querySelector('#league-table tbody');
    leagueData.forEach(item => {
        const row = `<tr>
            <td>${item.pos}</td>
            <td>${item.team}</td>
            <td>${item.pts}</td>
        </tr>`;
        tableBody.innerHTML += row;
    });

    // 3. Simular Noticias de Metro Ecuador
    const newsData = [
        { title: "Moisés Caicedo brilla en la victoria del Chelsea", time: "Hace 2 horas" },
        { title: "Piero Hincapié en la mira de grandes de Europa", time: "Hace 4 horas" },
        { title: "Barcelona SC prepara la Noche Amarilla 2026", time: "Hace 6 horas" }
    ];

    const newsFeed = document.getElementById('news-feed');
    newsData.forEach(news => {
        const item = `<div class="news-item">
            <h4>${news.title}</h4>
            <small>${news.time}</small>
        </div>`;
        newsFeed.innerHTML += item;
    });
});
