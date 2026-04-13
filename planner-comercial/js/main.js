const tasks = [
      { id: 1, title: 'Nota previa Ecuador vs Costa de Marfil', category: 'deportes', responsible: 'Christian', project: 'Metro Ecuador', workflowStatus: 'Pendiente', contentType: 'Editorial', bookingStatus: 'libre', date: '2026-06-13', time: '09:00', client: '', reservedBy: '', reservationDate: '', event: 'Ecuador vs Costa de Marfil', notes: 'Espacio web premium del día previo.' },
      { id: 2, title: 'Reel previa Ecuador vs Costa de Marfil', category: 'deportes', responsible: 'Andrea', project: 'Metro Ecuador', workflowStatus: 'Producción', contentType: 'Comercial', bookingStatus: 'reservado', date: '2026-06-13', time: '16:00', client: 'Suzuki', reservedBy: 'Andrea', reservationDate: '2026-03-31 10:15', event: 'Ecuador vs Costa de Marfil', notes: 'Incluye branding de apertura.' },
      { id: 3, title: 'Cobertura en vivo Ecuador vs Costa de Marfil', category: 'deportes', responsible: 'Mario', project: 'Metro Ecuador', workflowStatus: 'Pendiente', contentType: 'Comercial', bookingStatus: 'libre', date: '2026-06-14', time: '14:00', client: '', reservedBy: '', reservationDate: '', event: 'Ecuador vs Costa de Marfil', notes: 'Bloque fuerte para venta comercial.' },
      { id: 4, title: 'Resultado final Ecuador vs Costa de Marfil', category: 'deportes', responsible: 'Christian', project: 'Metro Ecuador', workflowStatus: 'Entregado', contentType: 'Comercial', bookingStatus: 'vendido', date: '2026-06-14', time: '18:00', client: 'Supermaxi', reservedBy: 'Christian', reservationDate: '2026-03-31 12:30', event: 'Ecuador vs Costa de Marfil', notes: 'Pieza final con call to action.' },
      { id: 5, title: 'Reacción post partido', category: 'deportes', responsible: 'Paola', project: 'Nueva Mujer', workflowStatus: 'Cancelado', contentType: 'Editorial', bookingStatus: 'libre', date: '2026-06-14', time: '21:00', client: '', reservedBy: '', reservationDate: '', event: 'Ecuador vs Costa de Marfil', notes: 'Ideal para sponsor emocional.' },
      { id: 6, title: 'Pack previo Ecuador vs Curazao', category: 'deportes', responsible: 'María', project: 'Metro Ecuador', workflowStatus: 'Producción', contentType: 'Comercial', bookingStatus: 'reservado', date: '2026-06-19', time: '10:00', client: 'GM', reservedBy: 'María', reservationDate: '2026-03-31 14:10', event: 'Ecuador vs Curazao', notes: 'Paquete de stories + reel.' }
    ];

    const USERS = [
      { username: 'master.metro', aliases: ['master.metro', 'master'], password: 'Mundial2026!', passwordAliases: ['Mundial2026!', 'Mundial2026'], role: 'master' },
      { username: 'reserva.metro', aliases: ['reserva.metro', 'reserva'], password: 'Mundial2026?', passwordAliases: ['Mundial2026?', 'Mundial2026'], role: 'reserve' }
    ];

    const catalogs = {
      categories: ['deportes', 'automovilismo', 'alimentos', 'entretenimiento', 'corporativo'],
      projects: ['Metro Ecuador', 'Nueva Mujer'],
      workflowStatuses: ['Pendiente', 'Producción', 'Entregado', 'Cancelado'],
      contentTypes: ['Comercial', 'Editorial']
    };

    let currentView = 'diaria';
    let currentDate = '2026-06-14';
    let currentWeekStart = '2026-06-14';
    let currentMonth = new Date('2026-06-01T00:00:00');
    let currentRole = 'public';
    let currentUser = null;
    let pendingReserveId = null;
    let editingTaskId = null;

    const content = document.getElementById('content');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const categoryFilter = document.getElementById('categoryFilter');
    const statusFilter = document.getElementById('statusFilter');
    const modalBackdrop = document.getElementById('modalBackdrop');
    const loginBackdrop = document.getElementById('loginBackdrop');
    const reserveBackdrop = document.getElementById('reserveBackdrop');

    function isMaster() { return currentRole === 'master'; }
    function canReserve() { return currentRole === 'master' || currentRole === 'reserve'; }
    function workflowClass(status) {
      return String(status || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    }

    function nowStamp() {
      const d = new Date();
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const hh = String(d.getHours()).padStart(2, '0');
      const mi = String(d.getMinutes()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
    }

    function formatLongDate(dateStr) {
      const date = new Date(dateStr + 'T00:00:00');
      return date.toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    }

    function formatShortDate(dateStr) {
      const date = new Date(dateStr + 'T00:00:00');
      return date.toLocaleDateString('es-EC', { weekday: 'short', day: 'numeric', month: 'short' });
    }

    function renderCatalogSelect(selectId, values, selectedValue, includeAll = false, allLabel = 'Todas las categorías') {
      const select = document.getElementById(selectId);
      if (!select) return;
      const options = [];
      if (includeAll) options.push(`<option value="todas">${allLabel}</option>`);
      values.forEach(value => {
        const selected = value === selectedValue ? 'selected' : '';
        options.push(`<option value="${value}">${value}</option>`);
      });
      select.innerHTML = options.join('');
    }

    function renderCatalogs() {
      renderCatalogSelect('categoryFilter', catalogs.categories, categoryFilter.value || 'todas', true, 'Todas las categorías');
      renderCatalogSelect('fCategory', catalogs.categories, document.getElementById('fCategory').value || catalogs.categories[0]);
      renderCatalogSelect('fProject', catalogs.projects, document.getElementById('fProject').value || catalogs.projects[0]);
      renderCatalogSelect('fWorkflowStatus', catalogs.workflowStatuses, document.getElementById('fWorkflowStatus').value || catalogs.workflowStatuses[0]);
      renderCatalogSelect('fContentType', catalogs.contentTypes, document.getElementById('fContentType').value || catalogs.contentTypes[0]);
    }

    function addCatalogItem(catalogKey, label) {
      if (!isMaster()) {
        alert('Solo el usuario master puede ampliar catálogos.');
        return;
      }
      const value = prompt(`Ingresa el nuevo valor para ${label}:`);
      if (!value) return;
      const clean = value.trim();
      if (!clean) return;
      if (!catalogs[catalogKey].includes(clean)) {
        catalogs[catalogKey].push(clean);
      }
      renderCatalogs();
      if (catalogKey === 'categories') document.getElementById('fCategory').value = clean;
      if (catalogKey === 'projects') document.getElementById('fProject').value = clean;
      if (catalogKey === 'workflowStatuses') document.getElementById('fWorkflowStatus').value = clean;
      if (catalogKey === 'contentTypes') document.getElementById('fContentType').value = clean;
      render();
    }

    function getFilteredTasks() {
      const search = searchInput.value.trim().toLowerCase();
      const category = categoryFilter.value;
      const bookingStatus = statusFilter.value;

      return tasks.filter(task => {
        const haystack = [task.title, task.client, task.event, task.category, task.notes, task.reservedBy, task.responsible, task.project, task.workflowStatus, task.contentType, task.reservationDate].join(' ').toLowerCase();
        const matchesSearch = haystack.includes(search);
        const matchesCategory = category === 'todas' || task.category === category;
        const matchesBookingStatus = bookingStatus === 'todas' || task.bookingStatus === bookingStatus;
        return matchesSearch && matchesCategory && matchesBookingStatus;
      }).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    }

    function updateStats() {
      const filtered = getFilteredTasks();
      document.getElementById('statTotal').textContent = filtered.length;
      document.getElementById('statLibre').textContent = filtered.filter(t => t.bookingStatus === 'libre').length;
      document.getElementById('statReservado').textContent = filtered.filter(t => t.bookingStatus === 'reservado').length;
      document.getElementById('statVendido').textContent = filtered.filter(t => t.bookingStatus === 'vendido').length;
    }

    function badge(status) {
      const label = status.charAt(0).toUpperCase() + status.slice(1);
      return `<span class="badge ${status}">${label}</span>`;
    }

    function workflowBadge(status) {
      const cls = workflowClass(status);
      return `<span class="workflow-badge ${cls}">${status}</span>`;
    }

    function capitalize(text) { return text.charAt(0).toUpperCase() + text.slice(1); }

    function taskCard(task) {
      const headerStatus = task.bookingStatus !== 'libre' && task.client
        ? `<div style="font-size:18px;font-weight:800;margin-bottom:6px;">${task.bookingStatus === 'reservado' ? 'Reservado' : 'Vendido'}: ${task.client}</div>`
        : '';

      return `
        <div class="task-item is-${task.bookingStatus}">
          <div class="task-top">
            <div>
              ${headerStatus}
              <div class="task-title">${task.title}</div>
              <div class="meta">
                <span>🕒 ${task.time}</span>
                <span>🏷️ ${capitalize(task.category)}</span>
                <span>🎯 ${task.event || 'Sin evento'}</span>
                <span>👤 Cliente: ${task.client || 'Sin cliente'}</span>
                <span>🙋 Reserva: ${task.reservedBy || 'Sin responsable de reserva'}</span>
              </div>
              <div class="meta">
                <span>🧑 Responsable: ${task.responsible || 'Sin responsable'}</span>
                <span>🏢 Proyecto: ${task.project}</span>
                <span>📦 Contenido: ${task.contentType}</span>
                <span>📌 Estatus: ${workflowBadge(task.workflowStatus)}</span>
              </div>
              <div class="meta"><span>📅 Reserva hecha: ${task.reservationDate || 'Sin fecha de reserva'}</span></div>
              <div>
                <span class="pill">${task.project}</span>
                <span class="pill">${task.contentType}</span>
                ${workflowBadge(task.workflowStatus)}
              </div>
              <div class="muted" style="margin-top:8px;">${task.notes || ''}</div>
            </div>
            <div>${badge(task.bookingStatus)}</div>
          </div>
          <div class="task-actions">
            ${canReserve() ? `<button onclick="openReserveModal(${task.id})">Reservar</button>` : ''}
            ${isMaster() ? `<button onclick="openEditModal(${task.id})">Editar</button><button onclick="changeBookingStatus(${task.id}, 'libre')">Libre</button><button onclick="changeBookingStatus(${task.id}, 'reservado')">Reservado</button><button onclick="changeBookingStatus(${task.id}, 'vendido')">Vendido</button>` : ''}
          </div>
        </div>
      `;
    }

    function renderDaily() {
      const filtered = getFilteredTasks().filter(t => t.date === currentDate);
      content.innerHTML = `
        <div class="panel-header">
          <div><h2 style="margin:0 0 4px;">Vista diaria</h2><div class="muted">${formatLongDate(currentDate)}</div></div>
          <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
            <button onclick="moveDay(-1)">Anterior</button>
            <input type="date" value="${currentDate}" onchange="setDay(this.value)">
            <button onclick="moveDay(1)">Siguiente</button>
          </div>
        </div>
        ${filtered.length ? `<div class="task-list">${filtered.map(taskCard).join('')}</div>` : `<div class="muted">No hay acciones para este día.</div>`}
      `;
    }

    function renderWeekly() {
      const start = new Date(currentWeekStart + 'T00:00:00');
      const weekDates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        return d.toISOString().slice(0, 10);
      });
      const filtered = getFilteredTasks();

      content.innerHTML = `
        <div class="panel-header">
          <div><h2 style="margin:0 0 4px;">Vista semanal</h2><div class="muted">La vista favorita de comercial.</div></div>
          <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
            <button onclick="moveWeek(-7)">Semana anterior</button>
            <input type="date" value="${currentWeekStart}" onchange="setWeek(this.value)">
            <button onclick="moveWeek(7)">Semana siguiente</button>
          </div>
        </div>
        <div class="week-grid">
          ${weekDates.map(date => {
            const dayTasks = filtered.filter(t => t.date === date);
            return `
              <div class="week-col">
                <h3>${formatShortDate(date)}</h3>
                ${dayTasks.length ? dayTasks.map(t => `
                  <div class="slot is-${t.bookingStatus}">
                    <strong>${t.time} · ${t.title}</strong>
                    <div class="muted">${capitalize(t.category)} · ${t.client || 'Sin cliente'}</div>
                    <div class="muted">Responsable: ${t.responsible || 'N/D'} · ${t.project}</div>
                    <div class="muted">${workflowBadge(t.workflowStatus)}</div>
                    <div class="muted">Reserva: ${t.reservationDate || 'Sin fecha'}</div>
                    <div style="margin-top:8px;">${badge(t.bookingStatus)}</div>
                  </div>
                `).join('') : `<div class="muted">Sin acciones</div>`}
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    function goToDay(date) {
      currentDate = date;
      currentView = 'diaria';
      document.querySelectorAll('.view-switch button').forEach(b => b.classList.remove('active'));
      const dailyBtn = document.querySelector('.view-switch button[data-view="diaria"]');
      if (dailyBtn) dailyBtn.classList.add('active');
      render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function renderMonthly() {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const monthLabel = currentMonth.toLocaleDateString('es-EC', { month: 'long', year: 'numeric' });
      const firstDay = new Date(year, month, 1);
      const totalDays = new Date(year, month + 1, 0).getDate();
      const startOffset = (firstDay.getDay() + 6) % 7;
      const filtered = getFilteredTasks();

      let cells = '';
      for (let i = 0; i < startOffset; i++) cells += '<div class="day-cell empty"></div>';

      for (let d = 1; d <= totalDays; d++) {
        const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const dayTasks = filtered.filter(t => t.date === date);
        const preview = dayTasks.slice(0, 3).map(t => `
          <div class="mini-task is-${t.bookingStatus}">
            <div class="mini-task-title">${t.time} · ${t.title}</div>
            ${badge(t.bookingStatus)}
          </div>
        `).join('');

        cells += `
          <div class="day-cell" onclick="goToDay('${date}')" role="button" tabindex="0" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();goToDay('${date}') }" aria-label="Ver contenido del día ${date}">
            <div class="day-number">${d}</div>
            ${preview}
            ${dayTasks.length > 3 ? `<div class="muted">+${dayTasks.length - 3} más</div>` : '<div class="muted">Toca para ver el día</div>'}
          </div>
        `;
      }

      content.innerHTML = `
        <div class="panel-header">
          <div><h2 style="margin:0 0 4px;">Vista mensual</h2><div class="muted">Toca o da click en cualquier día para entrar directo a su contenido.</div></div>
          <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
            <button onclick="moveMonth(-1)">Anterior</button>
            <strong style="text-transform:capitalize;">${monthLabel}</strong>
            <button onclick="moveMonth(1)">Siguiente</button>
          </div>
        </div>
        <div class="calendar-grid" style="margin-bottom:10px;">
          <div class="day-name">Lun</div><div class="day-name">Mar</div><div class="day-name">Mié</div><div class="day-name">Jue</div><div class="day-name">Vie</div><div class="day-name">Sáb</div><div class="day-name">Dom</div>
        </div>
        <div class="calendar-grid">${cells}</div>
      `;
    }

    function renderList() {
      const filtered = getFilteredTasks();
      const grouped = {};
      filtered.forEach(t => {
        if (!grouped[t.date]) grouped[t.date] = [];
        grouped[t.date].push(t);
      });

      let html = `<div class="panel-header"><div><h2 style="margin:0 0 4px;">Vista lista</h2><div class="muted">Todas las acciones filtradas, agrupadas por fecha.</div></div></div>`;
      const dates = Object.keys(grouped);

      if (!dates.length) {
        html += `<div class="muted">No hay resultados con estos filtros.</div>`;
      } else {
        dates.forEach(date => {
          html += `<h3 class="group-date">${formatLongDate(date)}</h3><div class="task-list">${grouped[date].map(taskCard).join('')}</div>`;
        });
      }

      content.innerHTML = html;
    }

    function render() {
      updateStats();
      if (currentView === 'diaria') renderDaily();
      if (currentView === 'semanal') renderWeekly();
      if (currentView === 'mensual') renderMonthly();
      if (currentView === 'lista') renderList();
    }

    function changeBookingStatus(id, bookingStatus) {
      if (!isMaster()) {
        alert('Solo el usuario master puede cambiar Libre, Reservado o Vendido manualmente.');
        return;
      }
      const task = tasks.find(t => t.id === id);
      if (!task) return;
      task.bookingStatus = bookingStatus;
      if (bookingStatus === 'libre') {
        task.client = '';
        task.reservedBy = '';
        task.reservationDate = '';
      }
      if ((bookingStatus === 'reservado' || bookingStatus === 'vendido') && !task.reservationDate) {
        task.reservationDate = nowStamp();
      }
      render();
    }

    function resetForm() {
      editingTaskId = null;
      document.getElementById('formModalTitle').textContent = 'Nueva acción comercial';
      document.getElementById('saveBtn').textContent = 'Guardar acción';
      document.getElementById('fTitle').value = '';
      document.getElementById('fResponsible').value = '';
      document.getElementById('fBookingStatus').value = 'libre';
      document.getElementById('fDate').value = '';
      document.getElementById('fTime').value = '';
      document.getElementById('fClient').value = '';
      document.getElementById('fEvent').value = '';
      document.getElementById('fNotes').value = '';
      renderCatalogs();
    }

    function openNewModal() {
      if (!isMaster()) {
        alert('Solo el usuario master puede crear nuevas acciones.');
        return;
      }
      resetForm();
      modalBackdrop.classList.add('open');
    }

    function openEditModal(id) {
      if (!isMaster()) {
        alert('Solo el usuario master puede editar acciones.');
        return;
      }
      const task = tasks.find(t => t.id === id);
      if (!task) return;
      editingTaskId = id;
      document.getElementById('formModalTitle').textContent = 'Editar acción';
      document.getElementById('saveBtn').textContent = 'Guardar cambios';
      renderCatalogs();
      document.getElementById('fTitle').value = task.title;
      document.getElementById('fCategory').value = task.category;
      document.getElementById('fResponsible').value = task.responsible || '';
      document.getElementById('fProject').value = task.project;
      document.getElementById('fWorkflowStatus').value = task.workflowStatus;
      document.getElementById('fContentType').value = task.contentType;
      document.getElementById('fBookingStatus').value = task.bookingStatus;
      document.getElementById('fDate').value = task.date;
      document.getElementById('fTime').value = task.time;
      document.getElementById('fClient').value = task.client || '';
      document.getElementById('fEvent').value = task.event || '';
      document.getElementById('fNotes').value = task.notes || '';
      modalBackdrop.classList.add('open');
    }

    function saveForm() {
      if (!isMaster()) {
        alert('Solo el usuario master puede guardar acciones.');
        return;
      }
      const formData = {
        title: document.getElementById('fTitle').value.trim(),
        category: document.getElementById('fCategory').value,
        responsible: document.getElementById('fResponsible').value.trim(),
        project: document.getElementById('fProject').value,
        workflowStatus: document.getElementById('fWorkflowStatus').value,
        contentType: document.getElementById('fContentType').value,
        bookingStatus: document.getElementById('fBookingStatus').value,
        date: document.getElementById('fDate').value,
        time: document.getElementById('fTime').value,
        client: document.getElementById('fClient').value.trim(),
        event: document.getElementById('fEvent').value.trim(),
        notes: document.getElementById('fNotes').value.trim(),
      };

      if (!formData.title || !formData.date || !formData.time) {
        alert('Completa al menos título, fecha y hora.');
        return;
      }

      if (editingTaskId) {
        const task = tasks.find(t => t.id === editingTaskId);
        if (!task) return;
        Object.assign(task, formData);
        if (formData.bookingStatus === 'libre') {
          task.client = '';
          task.reservedBy = '';
          task.reservationDate = '';
        } else if (!task.reservationDate) {
          task.reservationDate = nowStamp();
        }
      } else {
        tasks.push({
          id: Date.now(),
          ...formData,
          reservedBy: '',
          reservationDate: formData.bookingStatus === 'libre' ? '' : nowStamp(),
        });
      }

      modalBackdrop.classList.remove('open');
      resetForm();
      render();
    }

    function openReserveModal(id) {
      if (!canReserve()) {
        loginBackdrop.classList.add('open');
        return;
      }
      const task = tasks.find(t => t.id === id);
      if (!task) return;
      pendingReserveId = id;
      document.getElementById('reservePerson').value = currentUser ? currentUser.username : '';
      document.getElementById('reserveClient').value = task.client || '';
      document.getElementById('reserveBookingStatus').value = task.bookingStatus || 'reservado';
      reserveBackdrop.classList.add('open');
    }

    function moveDay(delta) {
      const d = new Date(currentDate + 'T00:00:00');
      d.setDate(d.getDate() + delta);
      currentDate = d.toISOString().slice(0, 10);
      render();
    }

    function setDay(value) { currentDate = value; render(); }
    function moveWeek(delta) {
      const d = new Date(currentWeekStart + 'T00:00:00');
      d.setDate(d.getDate() + delta);
      currentWeekStart = d.toISOString().slice(0, 10);
      render();
    }
    function setWeek(value) { currentWeekStart = value; render(); }
    function moveMonth(delta) { currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + delta, 1); render(); }

    function updateRoleUI() {
      const newTaskBtn = document.getElementById('newTaskBtn');
      if (currentRole === 'public') {
        document.getElementById('authStatus').textContent = '👁️ Modo público';
        document.getElementById('roleLoginBtn').style.display = 'inline-flex';
        document.getElementById('logoutBtn').style.display = 'none';
        newTaskBtn.textContent = '🔒 Nueva acción';
      } else if (currentRole === 'reserve') {
        document.getElementById('authStatus').textContent = '🟡 Usuario de reserva activo';
        document.getElementById('roleLoginBtn').style.display = 'none';
        document.getElementById('logoutBtn').style.display = 'inline-flex';
        newTaskBtn.textContent = '🔒 Nueva acción';
      } else {
        document.getElementById('authStatus').textContent = '🟢 Master activo';
        document.getElementById('roleLoginBtn').style.display = 'none';
        document.getElementById('logoutBtn').style.display = 'inline-flex';
        newTaskBtn.textContent = '+ Nueva acción';
      }
    }

    document.querySelectorAll('.view-switch button').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.view-switch button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentView = btn.dataset.view;
        render();
      });
    });

    searchInput.addEventListener('input', render);
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') render();
    });
    searchBtn.addEventListener('click', render);
    categoryFilter.addEventListener('change', render);
    statusFilter.addEventListener('change', render);

    document.getElementById('copyShareLinkBtn').addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link público copiado.');
      } catch (e) {
        alert('No se pudo copiar automáticamente. Copia manualmente la URL de esta página.');
      }
    });

    document.getElementById('roleLoginBtn').addEventListener('click', () => { loginBackdrop.classList.add('open'); });
    document.getElementById('closeLoginBtn').addEventListener('click', () => { loginBackdrop.classList.remove('open'); });

    function normalizeLoginValue(value) {
      return String(value || '')
        .replace(/ /g, ' ')
        .trim()
        .toLowerCase();
    }

    function attemptLogin() {
      const user = normalizeLoginValue(document.getElementById('loginUser').value);
      const pass = String(document.getElementById('loginPass').value || '').replace(/ /g, ' ').trim();

      const found = USERS.find(u => {
        const userAliases = (u.aliases || [u.username]).map(v => normalizeLoginValue(v));
        const passAliases = (u.passwordAliases || [u.password]).map(v => String(v || '').trim());
        return userAliases.includes(user) && passAliases.includes(pass);
      });

      if (!found) {
        alert('Usuario o contraseña incorrectos. Prueba exactamente con master.metro / Mundial2026! o reserva.metro / Mundial2026?');
        return;
      }
      currentUser = found;
      currentRole = found.role;
      loginBackdrop.classList.remove('open');
      updateRoleUI();
      render();
    }

    document.getElementById('loginSubmitBtn').addEventListener('click', attemptLogin);

    document.getElementById('loginUser').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') attemptLogin();
    });

    document.getElementById('loginPass').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') attemptLogin();
    });

    document.getElementById('logoutBtn').addEventListener('click', () => {
      currentRole = 'public';
      currentUser = null;
      updateRoleUI();
      render();
    });

    document.getElementById('newTaskBtn').addEventListener('click', openNewModal);
    document.getElementById('cancelBtn').addEventListener('click', () => { modalBackdrop.classList.remove('open'); resetForm(); });
    document.getElementById('saveBtn').addEventListener('click', saveForm);

    document.getElementById('addCategoryBtn').addEventListener('click', () => addCatalogItem('categories', 'categoría'));
    document.getElementById('addProjectBtn').addEventListener('click', () => addCatalogItem('projects', 'proyecto'));
    document.getElementById('addWorkflowBtn').addEventListener('click', () => addCatalogItem('workflowStatuses', 'estatus'));
    document.getElementById('addContentTypeBtn').addEventListener('click', () => addCatalogItem('contentTypes', 'contenido'));

    document.getElementById('closeReserveBtn').addEventListener('click', () => {
      reserveBackdrop.classList.remove('open');
      pendingReserveId = null;
    });

    document.getElementById('reserveSubmitBtn').addEventListener('click', () => {
      if (!canReserve()) { alert('Necesitas ingresar con usuario de reserva o master.'); return; }
      const person = document.getElementById('reservePerson').value.trim();
      const client = document.getElementById('reserveClient').value.trim();
      const bookingStatus = document.getElementById('reserveBookingStatus').value;
      if (!person || !client) { alert('Completa tu nombre y el nombre del cliente para reservar.'); return; }
      const task = tasks.find(t => t.id === pendingReserveId);
      if (!task) return;
      task.reservedBy = person;
      task.client = client;
      task.bookingStatus = bookingStatus;
      task.reservationDate = nowStamp();
      reserveBackdrop.classList.remove('open');
      pendingReserveId = null;
      render();
    });

    (function runSmokeTests() {
      console.assert(typeof openEditModal === 'function', 'openEditModal debe existir');
      console.assert(typeof saveForm === 'function', 'saveForm debe existir');
      console.assert(Array.isArray(catalogs.categories) && catalogs.categories.length > 0, 'Debe haber categorías iniciales');
      console.assert(Array.isArray(catalogs.projects) && catalogs.projects.length > 0, 'Debe haber proyectos iniciales');
      console.assert(workflowClass('Producción') === 'produccion', 'workflowClass debe normalizar acentos');
      console.assert(tasks.length >= 1, 'Debe existir al menos una tarea de ejemplo');
    })();

    renderCatalogs();
    updateRoleUI();
    render();

    window.moveDay = moveDay;
    window.setDay = setDay;
    window.moveWeek = moveWeek;
    window.setWeek = setWeek;
    window.moveMonth = moveMonth;
    window.goToDay = goToDay;
    window.changeBookingStatus = changeBookingStatus;
    window.openReserveModal = openReserveModal;
    window.openEditModal = openEditModal;
  
