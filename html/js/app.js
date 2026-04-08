/* ============================================================
   MDT FiveM - Application principale
   ============================================================ */

'use strict';

/* ----------------------------------------------------------
   Etat global
---------------------------------------------------------- */
const State = {
    officer:          null,
    offenses:         [],
    currentCitizen:   null,
    selectedOffenses: [],
    warrantCharges:   [],
    warrants:         [],
    bolos:            [],
    calls:            [],
};

/* ----------------------------------------------------------
   Utilitaires DOM
---------------------------------------------------------- */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function el(tag, cls, html = '') {
    const e = document.createElement(tag);
    if (cls)  e.className = cls;
    if (html) e.innerHTML = html;
    return e;
}

function fmt(str) {
    return str ? String(str).replace(/</g, '&lt;').replace(/>/g, '&gt;') : '-';
}

function fmtDate(dateStr) {
    if (!dateStr) return '-';
    try {
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
    } catch { return dateStr; }
}

function fmtDateTime(dateStr) {
    if (!dateStr) return '-';
    try {
        return new Date(dateStr).toLocaleString('fr-FR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    } catch { return dateStr; }
}

function initials(first, last) {
    return ((first?.[0] ?? '') + (last?.[0] ?? '')).toUpperCase() || '?';
}

/* ----------------------------------------------------------
   Notifications
---------------------------------------------------------- */
function notify(msg, type = 'info', duration = 4000) {
    const icons = { success: '✔', error: '✖', warning: '⚠', info: 'ℹ' };
    const notif = el('div', `notif ${type}`);
    notif.innerHTML = `<span class="notif-icon">${icons[type] || 'ℹ'}</span>
                       <span class="notif-msg">${fmt(msg)}</span>`;
    $('#notifications').appendChild(notif);
    setTimeout(() => notif.remove(), duration);
}

/* ----------------------------------------------------------
   Horloge
---------------------------------------------------------- */
function startClock() {
    function tick() {
        const now = new Date();
        const el = $('#clock');
        if (el) el.textContent = now.toLocaleTimeString('fr-FR');
    }
    tick();
    setInterval(tick, 1000);
}

/* ----------------------------------------------------------
   Navigation
---------------------------------------------------------- */
const MDT = {
    loadPage(page) {
        $$('.nav-item').forEach(i => i.classList.toggle('active', i.dataset.page === page));
        $$('.page').forEach(p => p.classList.toggle('active', p.id === `page-${page}`));

        switch (page) {
            case 'dashboard': this._loadDashboard(); break;
            case 'warrants':  this._loadWarrants();  break;
            case 'bolo':      this._loadBolos();      break;
            case 'incidents': this._loadIncidents();  break;
            case 'dispatch':  this._loadCalls();      break;
            case 'units':     this._loadUnits();      break;
        }
    },

    _loadDashboard() {
        API.getWarrants();
        API.getBolos();
        API.getCalls();
        API.getActiveUnits();
    },

    _loadWarrants()  { API.getWarrants(); },
    _loadBolos()     { API.getBolos(); },
    _loadIncidents() { API.getIncidents(); },
    _loadCalls()     { API.getCalls(); },
    _loadUnits()     { API.getActiveUnits(); },
};

/* ----------------------------------------------------------
   Ouverture MDT (depuis Lua)
---------------------------------------------------------- */
function onOpen(data) {
    State.officer  = data.officer;
    State.offenses = data.offenses || [];

    // Mise a jour sidebar
    const o = data.officer;
    if (o) {
        $('#nav-name').textContent  = `${o.firstname} ${o.lastname}`;
        $('#nav-rank').textContent  = o.rank || 'Agent';
        $('#nav-badge').textContent = `Badge #${o.badge}`;
        $('#nav-avatar').textContent = initials(o.firstname, o.lastname);
        const sel = $('#status-select');
        if (sel && o.status) sel.value = o.status;
    }

    // Afficher l'app
    $('#loading-screen').style.display = 'none';
    $('#app').classList.remove('hidden');

    startClock();
    MDT.loadPage('dashboard');
}

function onClose() {
    $('#app').classList.add('hidden');
    $('#loading-screen').style.display = 'flex';
}

/* ----------------------------------------------------------
   Rendu : Tableau de bord
---------------------------------------------------------- */
function renderDashboard(warrants, bolos, calls, units) {
    // Stat cards
    if (warrants !== undefined) {
        $('#stat-warrants-val').textContent = warrants.length;
        $('#warrant-count').textContent     = warrants.length;
        $('#warrant-count').style.display   = warrants.length > 0 ? '' : 'none';
    }
    if (bolos !== undefined) {
        $('#stat-bolo-val').textContent  = bolos.length;
        $('#bolo-count').textContent     = bolos.length;
        $('#bolo-count').style.display   = bolos.length > 0 ? '' : 'none';
    }
    if (calls !== undefined) {
        const pending = calls.filter(c => c.status === 'pending').length;
        $('#stat-calls-val').textContent = pending;
        $('#call-count').textContent     = pending;
        $('#call-count').style.display   = pending > 0 ? '' : 'none';

        // Derniers appels
        const container = $('#dashboard-calls');
        if (!calls.length) {
            container.innerHTML = '<p class="text-muted text-center">Aucun dispatch actif.</p>';
        } else {
            container.innerHTML = '';
            calls.slice(0, 5).forEach(c => {
                const d = el('div', `call-card priority-${c.priority}`, `
                    <div class="card-header">
                        <span class="tag priority-${c.priority}">${c.priority === 1 ? 'URGENT' : c.priority === 2 ? 'NORMAL' : 'FAIBLE'}</span>
                        <h4>${fmt(c.type)}</h4>
                        <span class="card-meta">${fmtDateTime(c.created_at)}</span>
                    </div>
                    <div class="card-body">&#128205; ${fmt(c.location)} — ${fmt(c.description).substring(0, 80)}${c.description?.length > 80 ? '...' : ''}</div>
                `);
                container.appendChild(d);
            });
        }
    }
    if (units !== undefined) {
        $('#stat-units-val').textContent = units.length;
    }
    if (warrants !== undefined) {
        // Mandats recents
        const container = $('#dashboard-warrants');
        if (!warrants.length) {
            container.innerHTML = '<p class="text-muted text-center">Aucun mandat actif.</p>';
        } else {
            container.innerHTML = '';
            warrants.slice(0, 4).forEach(w => {
                const d = el('div', 'warrant-card active', `
                    <div class="card-header">
                        <span class="tag tag-danger">MANDAT</span>
                        <h4>${fmt(w.citizen_name)}</h4>
                        <span class="card-meta">${fmtDate(w.created_at)}</span>
                    </div>
                    <div class="card-body">${fmt(w.reason).substring(0, 100)}</div>
                `);
                container.appendChild(d);
            });
        }
    }
}

/* ----------------------------------------------------------
   Rendu : Recherche citoyens
---------------------------------------------------------- */
function renderCitizenResults(results) {
    const container = $('#citizen-search-results');
    if (!results.length) {
        container.innerHTML = '<p class="text-muted text-center">Aucun citoyen trouve.</p>';
        return;
    }
    container.innerHTML = '';
    results.forEach(c => {
        const card = el('div', 'result-card');
        card.innerHTML = `
            <div class="result-avatar">${initials(c.firstname, c.lastname)}</div>
            <div class="result-info">
                <div class="result-name">${fmt(c.firstname)} ${fmt(c.lastname)}</div>
                <div class="result-sub">Naissance: ${fmtDate(c.dob)} &nbsp;|&nbsp; ${c.gender === 1 ? 'Femme' : 'Homme'}</div>
                <div class="result-tags">
                    ${c.is_wanted ? '<span class="tag tag-danger">RECHERCHE</span>' : ''}
                </div>
            </div>
            <span style="color:var(--text-muted);font-size:18px">›</span>
        `;
        card.addEventListener('click', () => {
            API.getCitizen(c.id);
        });
        container.appendChild(card);
    });
}

/* ----------------------------------------------------------
   Rendu : Fiche citoyen
---------------------------------------------------------- */
function renderCitizenProfile(citizen, records) {
    if (!citizen) { notify('Citoyen introuvable.', 'error'); return; }
    State.currentCitizen = citizen;

    $('#citizen-search-results').classList.add('hidden');
    $('#citizen-profile').classList.remove('hidden');

    $('#profile-fullname').textContent = `${citizen.firstname} ${citizen.lastname}`;
    $('#p-fullname').textContent  = `${citizen.firstname} ${citizen.lastname}`;
    $('#p-dob').textContent       = fmtDate(citizen.dob);
    $('#p-gender').textContent    = citizen.gender === 1 ? 'Femme' : 'Homme';
    $('#p-phone').textContent     = citizen.phone || '-';
    $('#p-address').textContent   = citizen.address || '-';
    $('#p-nationality').textContent = citizen.nationality || '-';
    $('#p-physique').textContent  = `${citizen.height ?? '?'} cm / ${citizen.weight ?? '?'} kg`;
    $('#p-appearance').textContent = `${citizen.eye_color ?? '?'} / ${citizen.hair_color ?? '?'}`;

    // Badge recherche
    if (citizen.is_wanted) {
        $('#profile-wanted-badge').classList.remove('hidden');
    } else {
        $('#profile-wanted-badge').classList.add('hidden');
    }

    // Notes
    if (citizen.notes) {
        $('#p-notes-block').style.display = '';
        $('#p-notes').textContent = citizen.notes;
    } else {
        $('#p-notes-block').style.display = 'none';
    }

    // Antecedents
    const recContainer = $('#profile-records');
    if (!records.length) {
        recContainer.innerHTML = '<p class="text-muted">Aucun antecedent judiciaire.</p>';
    } else {
        recContainer.innerHTML = '';
        records.forEach(r => {
            const offenses = r.offenses ? JSON.parse(r.offenses) : [];
            const typeLabels = { arrest: 'Arrestation', citation: 'Contravention', warning: 'Avertissement', search: 'Fouille' };
            const typeColors = { arrest: 'tag-danger', citation: 'tag-warning', warning: 'tag-info', search: 'tag-purple' };

            const item = el('div', 'record-item');
            item.innerHTML = `
                <div class="record-header">
                    <span class="tag ${typeColors[r.type] || 'tag-muted'}">${typeLabels[r.type] || r.type}</span>
                    <span style="font-size:11px;color:var(--text-secondary)">${fmt(r.officer_name)}</span>
                    <span style="flex:1"></span>
                    <span class="card-meta">${fmtDate(r.created_at)}</span>
                </div>
                <div style="font-size:11px;color:var(--text-secondary);margin-bottom:4px">
                    &#128205; ${fmt(r.location)} &nbsp;|&nbsp; Amende: <strong style="color:var(--accent-yellow)">${r.total_fine}$</strong> &nbsp;|&nbsp; Prison: <strong style="color:var(--accent-red)">${r.total_jail} min</strong>
                </div>
                <ul class="record-offenses">
                    ${offenses.map(o => `<li>${fmt(o.label)}</li>`).join('')}
                </ul>
                ${r.narrative ? `<div class="record-meta" style="margin-top:6px;font-style:italic">"${fmt(r.narrative)}"</div>` : ''}
            `;
            recContainer.appendChild(item);
        });
    }
}

/* ----------------------------------------------------------
   Rendu : Vehicule
---------------------------------------------------------- */
function renderVehicle(vehicle) {
    const container = $('#vehicle-result');
    if (!vehicle) {
        container.innerHTML = '<p class="text-muted text-center" style="padding:20px">Aucun vehicule trouve avec cette plaque.</p>';
        return;
    }

    container.innerHTML = '';
    const card = el('div', 'vehicle-card');
    const stolenClass  = vehicle.is_stolen  ? 'tag-danger'  : 'tag-success';
    const stolenLabel  = vehicle.is_stolen  ? 'VOLE'        : 'NON VOLE';
    const insurClass   = vehicle.insurance  ? 'tag-success' : 'tag-danger';
    const insurLabel   = vehicle.insurance  ? 'ASSURE'      : 'NON ASSURE';
    const regClass     = vehicle.registration ? 'tag-success' : 'tag-danger';
    const regLabel     = vehicle.registration ? 'ENREGISTRE'  : 'NON ENREGISTRE';

    card.innerHTML = `
        <div class="vehicle-header">
            <div class="vehicle-plate">${fmt(vehicle.plate)}</div>
            <div class="vehicle-flags">
                <span class="tag ${stolenClass}">${stolenLabel}</span>
                ${vehicle.is_bolo ? '<span class="tag tag-warning">BOLO</span>' : ''}
                <span class="tag ${insurClass}">${insurLabel}</span>
                <span class="tag ${regClass}">${regLabel}</span>
            </div>
        </div>
        <div class="vehicle-info">
            <div class="info-field"><label>Modele</label><span>${fmt(vehicle.model)}</span></div>
            <div class="info-field"><label>Couleur</label><span>${fmt(vehicle.color)}</span></div>
            <div class="info-field"><label>Annee</label><span>${fmt(vehicle.year)}</span></div>
            <div class="info-field"><label>VIN</label><span>${fmt(vehicle.vin)}</span></div>
            <div class="info-field"><label>Proprietaire</label><span>${fmt(vehicle.owner_name)}</span></div>
        </div>
        ${vehicle.notes ? `<div style="margin-top:12px;font-size:12px;color:var(--text-secondary)"><em>${fmt(vehicle.notes)}</em></div>` : ''}
        <div class="vehicle-actions">
            <button class="btn ${vehicle.is_stolen ? 'btn-success' : 'btn-danger'}" id="btn-toggle-stolen">
                ${vehicle.is_stolen ? '✔ Marquer retrouve' : '✖ Marquer vole'}
            </button>
            <button class="btn btn-warning" id="btn-vehicle-bolo">+ BOLO vehicule</button>
        </div>
    `;

    container.appendChild(card);

    // Basculer vol
    $('#btn-toggle-stolen').addEventListener('click', () => {
        API.setVehicleStolen(vehicle.plate, !vehicle.is_stolen);
        vehicle.is_stolen = !vehicle.is_stolen;
        renderVehicle(vehicle);
    });

    // BOLO rapide
    $('#btn-vehicle-bolo').addEventListener('click', () => {
        $('#bolo-type').value        = 'vehicle';
        $('#bolo-target').value      = vehicle.plate;
        $('#bolo-description').value = `${vehicle.color} ${vehicle.model}`;
        openModal('modal-bolo');
    });
}

/* ----------------------------------------------------------
   Rendu : Mandats
---------------------------------------------------------- */
function renderWarrants(warrants) {
    State.warrants = warrants;
    const container = $('#warrants-list');
    container.innerHTML = '';

    if (!warrants.length) {
        container.innerHTML = `<div class="empty-state"><div class="empty-icon">✔</div><p>Aucun mandat actif.</p></div>`;
        return;
    }

    warrants.forEach(w => {
        const charges = w.charges ? JSON.parse(w.charges) : [];
        const card = el('div', 'warrant-card active');
        card.innerHTML = `
            <div class="card-header">
                <span class="tag tag-danger">MANDAT ACTIF</span>
                <h4>${fmt(w.citizen_name)}</h4>
                <span class="card-meta">${fmtDateTime(w.created_at)}</span>
            </div>
            <div class="card-body">
                <strong>Motif :</strong> ${fmt(w.reason)}<br/>
                ${charges.length ? `<strong>Charges :</strong> ${charges.map(c => fmt(c.label || c)).join(', ')}` : ''}
                <br/><span style="font-size:11px;color:var(--text-muted)">Emis par ${fmt(w.officer_name)}</span>
            </div>
            <div class="card-actions">
                <button class="btn btn-success btn-sm" data-id="${w.id}">✔ Executer</button>
            </div>
        `;
        card.querySelector('[data-id]').addEventListener('click', e => {
            const id = e.target.dataset.id;
            if (confirm('Marquer ce mandat comme execute ?')) {
                API.executeWarrant(Number(id));
                card.remove();
            }
        });
        container.appendChild(card);
    });
}

/* ----------------------------------------------------------
   Rendu : BOLO
---------------------------------------------------------- */
function renderBolos(bolos) {
    State.bolos = bolos;
    const container = $('#bolo-list');
    container.innerHTML = '';

    if (!bolos.length) {
        container.innerHTML = `<div class="empty-state"><div class="empty-icon">&#128269;</div><p>Aucun BOLO actif.</p></div>`;
        return;
    }

    bolos.forEach(b => {
        const card = el('div', 'bolo-card');
        card.innerHTML = `
            <div class="card-header">
                <span class="tag ${b.type === 'vehicle' ? 'tag-info' : 'tag-warning'}">${b.type === 'vehicle' ? 'VEHICULE' : 'PERSONNE'}</span>
                <h4>${fmt(b.target)}</h4>
                ${b.is_armed     ? '<span class="tag tag-danger">ARME</span>'     : ''}
                ${b.is_dangerous ? '<span class="tag tag-danger">DANGEREUX</span>': ''}
                <span class="card-meta">${fmtDateTime(b.created_at)}</span>
            </div>
            <div class="card-body">
                <strong>Description :</strong> ${fmt(b.description)}<br/>
                <strong>Raison :</strong> ${fmt(b.reason)}<br/>
                <span style="font-size:11px;color:var(--text-muted)">Emis par ${fmt(b.officer_name)}</span>
            </div>
            <div class="card-actions">
                <button class="btn btn-success btn-sm" data-id="${b.id}">✔ Resolu</button>
            </div>
        `;
        card.querySelector('[data-id]').addEventListener('click', e => {
            API.resolveBolo(Number(e.target.dataset.id));
            card.remove();
        });
        container.appendChild(card);
    });
}

/* ----------------------------------------------------------
   Rendu : Incidents
---------------------------------------------------------- */
function renderIncidents(incidents) {
    const container = $('#incidents-list');
    container.innerHTML = '';

    if (!incidents.length) {
        container.innerHTML = `<div class="empty-state"><div class="empty-icon">&#128196;</div><p>Aucun rapport d'incident.</p></div>`;
        return;
    }

    incidents.forEach(inc => {
        const statusColors = { open: 'tag-danger', closed: 'tag-success', pending: 'tag-warning' };
        const statusLabels = { open: 'OUVERT', closed: 'FERME', pending: 'EN ATTENTE' };
        const card = el('div', 'incident-card');
        card.innerHTML = `
            <div class="card-header">
                <span class="tag ${statusColors[inc.status] || 'tag-muted'}">${statusLabels[inc.status] || inc.status}</span>
                <span class="tag tag-info">${fmt(inc.type)}</span>
                <h4>${fmt(inc.title)}</h4>
                <span class="card-meta">${fmtDateTime(inc.created_at)}</span>
            </div>
            <div class="card-body">
                &#128205; ${fmt(inc.location)}<br/>
                ${fmt(inc.narrative).substring(0, 140)}${inc.narrative?.length > 140 ? '...' : ''}<br/>
                <span style="font-size:11px;color:var(--text-muted)">Redige par ${fmt(inc.officer_name)}</span>
            </div>
        `;
        container.appendChild(card);
    });
}

/* ----------------------------------------------------------
   Rendu : Dispatch / Appels
---------------------------------------------------------- */
function renderCalls(calls) {
    State.calls = calls;
    const container = $('#calls-list');
    container.innerHTML = '';

    if (!calls.length) {
        container.innerHTML = `<div class="empty-state"><div class="empty-icon">&#128222;</div><p>Aucun appel actif.</p></div>`;
        return;
    }

    const priorityLabel = { 1: 'URGENT', 2: 'NORMAL', 3: 'FAIBLE' };
    const statusLabel   = { pending: 'En attente', dispatched: 'Dispatche', on_scene: 'Sur scene', closed: 'Ferme' };

    calls.forEach(c => {
        const assigned = c.assigned_to ? JSON.parse(c.assigned_to) : [];
        const card = el('div', `call-card priority-${c.priority}`);
        card.innerHTML = `
            <div class="card-header">
                <span class="tag priority-${c.priority}">${priorityLabel[c.priority] || 'NORMAL'}</span>
                <h4>${fmt(c.type)}</h4>
                <span class="tag tag-muted">${statusLabel[c.status] || c.status}</span>
                <span class="card-meta">${fmtDateTime(c.created_at)}</span>
            </div>
            <div class="card-body">
                <strong>&#128205; Lieu :</strong> ${fmt(c.location)}<br/>
                <strong>Appelant :</strong> ${fmt(c.caller)}<br/>
                ${fmt(c.description)}<br/>
                ${assigned.length ? `<span style="font-size:11px;color:var(--text-secondary)">Assignes : ${assigned.join(', ')}</span>` : ''}
            </div>
            <div class="card-actions">
                <button class="btn btn-primary btn-sm"  data-action="assign"   data-id="${c.id}">Me dispatcher</button>
                <button class="btn btn-warning btn-sm"  data-action="scene"    data-id="${c.id}">Sur scene</button>
                <button class="btn btn-success btn-sm"  data-action="close"    data-id="${c.id}">Fermer</button>
            </div>
        `;

        card.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                const id     = Number(btn.dataset.id);
                if (action === 'assign') { API.assignToCall(id); }
                else if (action === 'scene') { API.updateCallStatus(id, 'on_scene'); }
                else if (action === 'close') { API.updateCallStatus(id, 'closed'); card.remove(); }
            });
        });

        container.appendChild(card);
    });
}

/* ----------------------------------------------------------
   Rendu : Unites actives
---------------------------------------------------------- */
function renderUnits(units) {
    const container = $('#units-list');
    container.innerHTML = '';

    if (!units.length) {
        container.innerHTML = `<div class="empty-state"><div class="empty-icon">&#128100;</div><p>Aucune unite active.</p></div>`;
        return;
    }

    const statusColors = {
        'En service':      'var(--accent-green)',
        'En patrouille':   'var(--accent-yellow)',
        'En intervention': 'var(--accent-orange)',
        'Sur scene':       'var(--accent-purple)',
    };

    units.forEach(u => {
        const card = el('div', 'unit-card');
        const color = statusColors[u.status] || 'var(--accent-blue)';
        card.innerHTML = `
            <div class="unit-avatar">${initials(u.firstname, u.lastname)}</div>
            <div class="unit-info">
                <div class="unit-name">${fmt(u.firstname)} ${fmt(u.lastname)}</div>
                <div class="unit-rank">${fmt(u.rank)} — ${fmt(u.department)}</div>
                <div class="unit-badge">Badge #${fmt(u.badge)} ${u.callsign ? '| ' + u.callsign : ''}</div>
            </div>
            <div class="unit-status" style="background:${color}20;color:${color}">${fmt(u.status)}</div>
        `;
        container.appendChild(card);
    });
}

/* ----------------------------------------------------------
   Modales
---------------------------------------------------------- */
function openModal(id)  { $(`#${id}`).classList.remove('hidden'); }
function closeModal(id) { $(`#${id}`).classList.add('hidden'); }

// Fermer les modales
$$('.modal-close, [data-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
        const target = btn.dataset.modal || btn.closest('.modal')?.id;
        if (target) closeModal(target);
    });
});

// Clic hors modale
$$('.modal').forEach(modal => {
    modal.addEventListener('click', e => {
        if (e.target === modal) closeModal(modal.id);
    });
});

/* ----------------------------------------------------------
   Selecteur d'infractions
---------------------------------------------------------- */
function buildOffenseSelector(containerId, selectedArr, onUpdate) {
    const container = $(`#${containerId}`);
    if (!container || !State.offenses.length) return;

    // Categories
    const cats = ['all', ...new Set(State.offenses.map(o => o.category))];
    const filtersDiv = container.querySelector('.offense-filters') || el('div', 'offense-filters');
    filtersDiv.innerHTML = '';
    cats.forEach(cat => {
        const btn = el('button', `offense-cat-btn${cat === 'all' ? ' active' : ''}`);
        btn.textContent = cat === 'all' ? 'Toutes' : cat;
        btn.dataset.cat = cat;
        btn.addEventListener('click', () => {
            $$('.offense-cat-btn', container).forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderOffenseItems(cat);
        });
        filtersDiv.appendChild(btn);
    });

    const gridDiv = container.querySelector('.offense-grid') || el('div', 'offense-grid');

    function renderOffenseItems(cat) {
        gridDiv.innerHTML = '';
        const filtered = cat === 'all' ? State.offenses : State.offenses.filter(o => o.category === cat);
        filtered.forEach((offense, idx) => {
            const item = el('div', `offense-item${selectedArr.find(s => s.label === offense.label) ? ' selected' : ''}`);
            item.innerHTML = `
                <div class="o-label">${fmt(offense.label)}</div>
                <div class="o-details">
                    ${offense.fine > 0 ? `<span>${offense.fine}$</span>` : ''}
                    ${offense.jail > 0 ? `<span>${offense.jail} min</span>` : ''}
                </div>
            `;
            item.addEventListener('click', () => {
                const existing = selectedArr.findIndex(s => s.label === offense.label);
                if (existing >= 0) {
                    selectedArr.splice(existing, 1);
                    item.classList.remove('selected');
                } else {
                    selectedArr.push(offense);
                    item.classList.add('selected');
                }
                onUpdate(selectedArr);
            });
            gridDiv.appendChild(item);
        });
    }

    renderOffenseItems('all');

    if (!container.querySelector('.offense-filters')) container.appendChild(filtersDiv);
    if (!container.querySelector('.offense-grid'))    container.appendChild(gridDiv);
}

function renderSelectedOffenses(containerId, selectedArr, totalFineId, totalJailId) {
    const container = $(`#${containerId}`);
    if (!container) return;

    if (!selectedArr.length) {
        container.innerHTML = '<p class="text-muted">Aucune infraction selectionnee.</p>';
    } else {
        container.innerHTML = '';
        selectedArr.forEach((o, i) => {
            const tag = el('span', 'selected-offense-tag');
            tag.innerHTML = `${fmt(o.label)} <button data-idx="${i}">✖</button>`;
            tag.querySelector('button').addEventListener('click', e => {
                selectedArr.splice(Number(e.target.dataset.idx), 1);
                updateOffenseTotals(selectedArr, totalFineId, totalJailId);
                renderSelectedOffenses(containerId, selectedArr, totalFineId, totalJailId);
            });
            container.appendChild(tag);
        });
    }

    if (totalFineId) updateOffenseTotals(selectedArr, totalFineId, totalJailId);
}

function updateOffenseTotals(selected, fineId, jailId) {
    if (fineId) $(`#${fineId}`).textContent = selected.reduce((s, o) => s + (o.fine || 0), 0) + '$';
    if (jailId) $(`#${jailId}`).textContent = selected.reduce((s, o) => s + (o.jail || 0), 0) + ' min';
}

/* ----------------------------------------------------------
   Wiring: Citoyens
---------------------------------------------------------- */
function initCitizens() {
    const input = $('#citizen-search-input');
    $('#btn-search-citizen').addEventListener('click', () => {
        const q = input.value.trim();
        if (q.length >= 2) API.searchCitizen(q);
        else notify('Saisissez au moins 2 caracteres.', 'warning');
    });

    input.addEventListener('keydown', e => {
        if (e.key === 'Enter') $('#btn-search-citizen').click();
    });

    $('#btn-back-search').addEventListener('click', () => {
        $('#citizen-profile').classList.add('hidden');
        $('#citizen-search-results').classList.remove('hidden');
        State.currentCitizen = null;
    });

    // Ouvrir modal dossier
    $('#btn-add-record').addEventListener('click', () => {
        if (!State.currentCitizen) return;
        State.selectedOffenses = [];
        buildOffenseSelector('offense-selector', State.selectedOffenses, arr => {
            renderSelectedOffenses('selected-offenses', arr, 'total-fine', 'total-jail');
        });
        renderSelectedOffenses('selected-offenses', State.selectedOffenses, 'total-fine', 'total-jail');
        openModal('modal-record');
    });

    $('#btn-submit-record').addEventListener('click', () => {
        const type      = $('#record-type').value;
        const location  = $('#record-location').value.trim();
        const narrative = $('#record-narrative').value.trim();

        if (!State.selectedOffenses.length && type !== 'warning') {
            notify('Selectionnez au moins une infraction.', 'warning');
            return;
        }

        API.createRecord({
            citizen_id:  State.currentCitizen.id,
            type,
            offenses:    State.selectedOffenses,
            total_fine:  State.selectedOffenses.reduce((s, o) => s + (o.fine || 0), 0),
            total_jail:  State.selectedOffenses.reduce((s, o) => s + (o.jail || 0), 0),
            narrative,
            location,
        });
        closeModal('modal-record');
    });

    // Ouvrir modal mandat depuis profil
    $('#btn-add-warrant').addEventListener('click', () => {
        if (!State.currentCitizen) return;
        State.warrantCharges = [];
        buildOffenseSelector('warrant-charges-list', State.warrantCharges, arr => {
            renderSelectedOffenses('warrant-selected-charges', arr);
        });
        renderSelectedOffenses('warrant-selected-charges', State.warrantCharges);
        openModal('modal-warrant');
    });

    $('#btn-submit-warrant').addEventListener('click', () => {
        const reason = $('#warrant-reason').value.trim();
        if (!reason) { notify('Saisissez un motif.', 'warning'); return; }
        API.createWarrant({
            citizen_id: State.currentCitizen.id,
            reason,
            charges:    State.warrantCharges,
        });
        closeModal('modal-warrant');
    });
}

/* ----------------------------------------------------------
   Wiring: Vehicules
---------------------------------------------------------- */
function initVehicles() {
    const input = $('#vehicle-search-input');
    $('#btn-search-vehicle').addEventListener('click', () => {
        const p = input.value.trim().toUpperCase();
        if (!p) { notify('Entrez une plaque.', 'warning'); return; }
        API.searchVehicle(p);
    });
    input.addEventListener('keydown', e => {
        if (e.key === 'Enter') $('#btn-search-vehicle').click();
    });
}

/* ----------------------------------------------------------
   Wiring: Mandats
---------------------------------------------------------- */
function initWarrants() {
    $('#btn-new-warrant-page').addEventListener('click', () => {
        notify('Ouvrez la fiche d\'un citoyen et cliquez "Emettre un mandat".', 'info');
        MDT.loadPage('citizens');
    });
}

/* ----------------------------------------------------------
   Wiring: BOLO
---------------------------------------------------------- */
function initBolo() {
    $('#btn-new-bolo').addEventListener('click', () => openModal('modal-bolo'));

    $('#btn-submit-bolo').addEventListener('click', () => {
        const target      = $('#bolo-target').value.trim();
        const description = $('#bolo-description').value.trim();
        const reason      = $('#bolo-reason').value.trim();

        if (!target || !description || !reason) {
            notify('Remplissez tous les champs.', 'warning'); return;
        }

        API.createBolo({
            type:         $('#bolo-type').value,
            target,
            description,
            reason,
            is_armed:     $('#bolo-armed').checked,
            is_dangerous: $('#bolo-dangerous').checked,
        });

        // Reset
        $('#bolo-target').value = '';
        $('#bolo-description').value = '';
        $('#bolo-reason').value = '';
        $('#bolo-armed').checked = false;
        $('#bolo-dangerous').checked = false;

        closeModal('modal-bolo');
    });
}

/* ----------------------------------------------------------
   Wiring: Incidents
---------------------------------------------------------- */
function initIncidents() {
    $('#btn-new-incident').addEventListener('click', () => openModal('modal-incident'));

    $('#btn-submit-incident').addEventListener('click', () => {
        const title     = $('#incident-title').value.trim();
        const narrative = $('#incident-narrative').value.trim();
        const location  = $('#incident-location').value.trim();

        if (!title || !narrative) {
            notify('Titre et narrative requis.', 'warning'); return;
        }

        API.createIncident({
            title,
            narrative,
            location,
            type: $('#incident-type').value,
        });

        $('#incident-title').value     = '';
        $('#incident-narrative').value = '';
        $('#incident-location').value  = '';
        closeModal('modal-incident');
    });
}

/* ----------------------------------------------------------
   Wiring: Dispatch
---------------------------------------------------------- */
function initDispatch() {
    $('#btn-refresh-calls').addEventListener('click', () => API.getCalls());
}

/* ----------------------------------------------------------
   Wiring: Unites
---------------------------------------------------------- */
function initUnits() {
    $('#btn-refresh-units').addEventListener('click', () => API.getActiveUnits());
}

/* ----------------------------------------------------------
   Wiring: Status
---------------------------------------------------------- */
function initStatus() {
    $('#status-select').addEventListener('change', e => {
        API.updateStatus(e.target.value);
        notify(`Statut mis a jour: ${e.target.value}`, 'info', 2000);
    });
}

/* ----------------------------------------------------------
   Wiring: Navigation
---------------------------------------------------------- */
function initNav() {
    $$('.nav-item').forEach(item => {
        item.addEventListener('click', () => MDT.loadPage(item.dataset.page));
    });

    $('#btn-close-mdt').addEventListener('click', () => {
        API.close();
        onClose();
    });
}

/* ----------------------------------------------------------
   Recepteur de messages NUI depuis Lua
---------------------------------------------------------- */
window.addEventListener('message', e => {
    const data = e.data;
    if (!data || !data.action) return;

    switch (data.action) {
        case 'open':
            onOpen(data);
            break;
        case 'close':
            onClose();
            break;
        case 'notification':
            notify(data.message, data.type || 'info');
            break;
        case 'searchCitizenResult':
            renderCitizenResults(data.data || []);
            break;
        case 'citizenData':
            renderCitizenProfile(data.citizen, data.records || []);
            break;
        case 'vehicleData':
            renderVehicle(data.data);
            break;
        case 'warrantsList':
            renderWarrants(data.data || []);
            renderDashboard(data.data, undefined, undefined, undefined);
            break;
        case 'boloList':
            renderBolos(data.data || []);
            renderDashboard(undefined, data.data, undefined, undefined);
            break;
        case 'callsList':
            renderCalls(data.data || []);
            renderDashboard(undefined, undefined, data.data, undefined);
            break;
        case 'activeUnits':
            renderUnits(data.data || []);
            renderDashboard(undefined, undefined, undefined, data.data);
            break;
        case 'incidentList':
            renderIncidents(data.data || []);
            break;
        case 'newCall':
            State.calls.unshift(data.data);
            notify(`Nouveau dispatch: ${data.data.type} — ${data.data.location}`, 'warning', 6000);
            const callCount = State.calls.filter(c => c.status === 'pending').length;
            $('#call-count').textContent   = callCount;
            $('#call-count').style.display = callCount > 0 ? '' : 'none';
            break;
    }
});

/* ----------------------------------------------------------
   Init
---------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
    initNav();
    initStatus();
    initCitizens();
    initVehicles();
    initWarrants();
    initBolo();
    initIncidents();
    initDispatch();
    initUnits();
});
