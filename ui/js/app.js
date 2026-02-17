/* ============================================
   LSPD MDT - Application JavaScript
   ============================================ */

// ============================================
// STATE
// ============================================

const state = {
    officer: null,
    currentPage: 'dashboard',
    dashboard: { stats: {}, recentIncidents: [], activeCalls: [], activeBolos: [] },
    citizenSearch: [],
    citizenProfile: null,
    vehicleSearch: [],
    warrants: [],
    bolos: [],
    incidents: [],
    incidentDetail: null,
    dispatchCalls: [],
    onlineOfficers: [],
    penalCodeExpanded: {},
};

// Penal code from config (injected or hardcoded for NUI)
const penalCode = [
    {
        category: 'INFRACTIONS ROUTIERES', color: '#f59e0b',
        offenses: [
            { title: 'Exces de vitesse mineur', code: 'IR-01', fine: 500, jail: 0, description: 'Depassement de la limite de vitesse de moins de 30 km/h' },
            { title: 'Exces de vitesse majeur', code: 'IR-02', fine: 1500, jail: 5, description: 'Depassement de la limite de vitesse de plus de 30 km/h' },
            { title: 'Conduite dangereuse', code: 'IR-03', fine: 2000, jail: 10, description: 'Conduite mettant en danger la vie d\'autrui' },
            { title: 'Fuite lors d\'un controle', code: 'IR-04', fine: 5000, jail: 15, description: 'Refus d\'obtemperer et fuite' },
            { title: 'Conduite sans permis', code: 'IR-05', fine: 3000, jail: 10, description: 'Conduite d\'un vehicule sans permis valide' },
            { title: 'Conduite en etat d\'ivresse', code: 'IR-06', fine: 5000, jail: 20, description: 'Conduite sous l\'influence de l\'alcool' },
            { title: 'Griller un feu rouge', code: 'IR-07', fine: 750, jail: 0, description: 'Non-respect d\'un feu de signalisation' },
            { title: 'Stationnement illegal', code: 'IR-08', fine: 300, jail: 0, description: 'Stationnement en zone interdite' },
            { title: 'Defaut d\'assurance', code: 'IR-09', fine: 2000, jail: 0, description: 'Circulation sans assurance valide' },
            { title: 'Course illegale', code: 'IR-10', fine: 10000, jail: 30, description: 'Participation a une course de rue illegale' },
        ]
    },
    {
        category: 'DELITS MINEURS', color: '#3b82f6',
        offenses: [
            { title: 'Trouble a l\'ordre public', code: 'DM-01', fine: 1000, jail: 5, description: 'Comportement perturbant l\'ordre public' },
            { title: 'Ivresse publique', code: 'DM-02', fine: 500, jail: 5, description: 'Etat d\'ebriete sur la voie publique' },
            { title: 'Vandalisme', code: 'DM-03', fine: 2000, jail: 10, description: 'Degradation volontaire de biens' },
            { title: 'Outrage a agent', code: 'DM-04', fine: 3000, jail: 10, description: 'Insultes ou menaces envers un agent de police' },
            { title: 'Refus d\'identifier', code: 'DM-05', fine: 1500, jail: 5, description: 'Refus de fournir son identite lors d\'un controle' },
            { title: 'Intrusion', code: 'DM-06', fine: 2000, jail: 10, description: 'Entree non autorisee dans une propriete privee' },
            { title: 'Vol simple', code: 'DM-07', fine: 3000, jail: 15, description: 'Vol sans violence ni effraction' },
            { title: 'Recel', code: 'DM-08', fine: 2500, jail: 10, description: 'Detention de biens voles' },
            { title: 'Fraude d\'identite', code: 'DM-09', fine: 5000, jail: 15, description: 'Utilisation d\'une fausse identite' },
            { title: 'Tapage nocturne', code: 'DM-10', fine: 750, jail: 0, description: 'Nuisances sonores excessives' },
        ]
    },
    {
        category: 'DELITS MAJEURS', color: '#f97316',
        offenses: [
            { title: 'Agression', code: 'DJ-01', fine: 5000, jail: 25, description: 'Violence physique envers autrui' },
            { title: 'Vol a main armee', code: 'DJ-02', fine: 15000, jail: 45, description: 'Vol avec usage d\'une arme' },
            { title: 'Cambriolage', code: 'DJ-03', fine: 10000, jail: 35, description: 'Vol avec effraction dans un lieu ferme' },
            { title: 'Braquage', code: 'DJ-04', fine: 25000, jail: 60, description: 'Attaque a main armee d\'un commerce ou banque' },
            { title: 'Evasion', code: 'DJ-05', fine: 10000, jail: 40, description: 'Evasion de garde a vue ou de prison' },
            { title: 'Kidnapping', code: 'DJ-06', fine: 20000, jail: 50, description: 'Enlevement et sequestration' },
            { title: 'Trafic de drogue', code: 'DJ-07', fine: 20000, jail: 45, description: 'Vente et distribution de substances illegales' },
            { title: 'Corruption', code: 'DJ-08', fine: 30000, jail: 50, description: 'Corruption d\'un agent public' },
            { title: 'Extorsion', code: 'DJ-09', fine: 15000, jail: 40, description: 'Obtention de biens par menace ou intimidation' },
            { title: 'Complicite criminelle', code: 'DJ-10', fine: 10000, jail: 30, description: 'Aide ou assistance a la commission d\'un crime' },
        ]
    },
    {
        category: 'CRIMES', color: '#ef4444',
        offenses: [
            { title: 'Tentative de meurtre', code: 'CR-01', fine: 50000, jail: 90, description: 'Tentative d\'homicide volontaire' },
            { title: 'Meurtre', code: 'CR-02', fine: 75000, jail: 0, description: 'Homicide volontaire - Prison a vie possible' },
            { title: 'Terrorisme', code: 'CR-03', fine: 100000, jail: 0, description: 'Acte de terrorisme - Prison a vie' },
            { title: 'Trahison', code: 'CR-04', fine: 100000, jail: 0, description: 'Haute trahison envers l\'Etat' },
            { title: 'Crime organise', code: 'CR-05', fine: 50000, jail: 80, description: 'Direction ou participation active a une organisation criminelle' },
        ]
    },
    {
        category: 'ARMES & SUBSTANCES', color: '#a855f7',
        offenses: [
            { title: 'Port d\'arme illegal', code: 'AS-01', fine: 5000, jail: 20, description: 'Possession d\'une arme sans permis' },
            { title: 'Port d\'arme lourde', code: 'AS-02', fine: 15000, jail: 40, description: 'Possession d\'une arme de guerre' },
            { title: 'Trafic d\'armes', code: 'AS-03', fine: 30000, jail: 60, description: 'Vente illegale d\'armes a feu' },
            { title: 'Possession de drogue', code: 'AS-04', fine: 3000, jail: 10, description: 'Possession de substances illegales (usage personnel)' },
            { title: 'Possession avec intention', code: 'AS-05', fine: 10000, jail: 30, description: 'Possession de drogue en quantite de revente' },
            { title: 'Production de drogue', code: 'AS-06', fine: 25000, jail: 50, description: 'Fabrication ou culture de substances illegales' },
            { title: 'Possession d\'explosifs', code: 'AS-07', fine: 20000, jail: 50, description: 'Detention illegale de materiaux explosifs' },
        ]
    },
];

const radioCodes = [
    { code: '10-1', description: 'Mauvaise reception' },
    { code: '10-4', description: 'Bien recu / Affirmatif' },
    { code: '10-6', description: 'Occupe' },
    { code: '10-7', description: 'Hors service' },
    { code: '10-8', description: 'En service' },
    { code: '10-9', description: 'Repetez le message' },
    { code: '10-10', description: 'Negatif' },
    { code: '10-11', description: 'Controle routier' },
    { code: '10-13', description: 'Agent en danger' },
    { code: '10-14', description: 'Individu suspect' },
    { code: '10-15', description: 'Individu en garde a vue' },
    { code: '10-17', description: 'En route' },
    { code: '10-20', description: 'Position actuelle' },
    { code: '10-23', description: 'Arrive sur place' },
    { code: '10-25', description: 'Renfort demande' },
    { code: '10-31', description: 'Crime en cours' },
    { code: '10-32', description: 'Personne armee' },
    { code: '10-33', description: 'Urgence - Toutes unites' },
    { code: '10-35', description: 'Alerte generale' },
    { code: '10-41', description: 'Debut de service' },
    { code: '10-42', description: 'Fin de service' },
    { code: '10-50', description: 'Accident de la route' },
    { code: '10-55', description: 'Conducteur en etat d\'ivresse' },
    { code: '10-70', description: 'Incendie' },
    { code: '10-71', description: 'Fusillade' },
    { code: '10-80', description: 'Poursuite en cours' },
    { code: '10-99', description: 'Urgence - Officier a terre' },
    { code: 'Code 1', description: 'Repondre sans urgence' },
    { code: 'Code 2', description: 'Repondre en urgence (sans sirene)' },
    { code: 'Code 3', description: 'Repondre en urgence (sirene + gyrophare)' },
    { code: 'Code 4', description: 'Situation sous controle' },
    { code: 'Code 5', description: 'Surveillance en cours' },
];

// ============================================
// NUI COMMUNICATION
// ============================================

function sendNUI(action, data = {}) {
    fetch(`https://lspd-mdt/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).catch(() => {});
}

// ============================================
// NUI MESSAGE HANDLER
// ============================================

window.addEventListener('message', (event) => {
    const { action, data } = event.data;

    switch (action) {
        case 'openMDT':
            openMDT();
            break;
        case 'closeMDT':
            closeMDTInstant();
            break;
        case 'setOfficerData':
            state.officer = data;
            updateOfficerUI();
            break;
        case 'setDashboardData':
            state.dashboard = data;
            if (state.currentPage === 'dashboard') renderDashboard();
            break;
        case 'setCitizenSearchResults':
            state.citizenSearch = data || [];
            if (state.currentPage === 'citizens') renderCitizenResults();
            break;
        case 'setCitizenProfile':
            state.citizenProfile = data;
            if (state.currentPage === 'citizens') renderCitizenProfile();
            break;
        case 'setVehicleSearchResults':
            state.vehicleSearch = data || [];
            if (state.currentPage === 'vehicles') renderVehicleResults();
            break;
        case 'setWarrants':
            state.warrants = data || [];
            if (state.currentPage === 'warrants') renderWarrantsList();
            break;
        case 'setBolos':
            state.bolos = data || [];
            if (state.currentPage === 'bolos') renderBolosList();
            break;
        case 'setIncidents':
            state.incidents = data || [];
            if (state.currentPage === 'incidents') renderIncidentsList();
            break;
        case 'setIncidentDetail':
            state.incidentDetail = data;
            if (state.currentPage === 'incidents') renderIncidentDetail();
            break;
        case 'setDispatchCalls':
            state.dispatchCalls = data || [];
            if (state.currentPage === 'dispatch') renderDispatchCalls();
            break;
        case 'setOnlineOfficers':
            state.onlineOfficers = data || [];
            if (state.currentPage === 'officers') renderOfficersList();
            break;
        case 'noteAdded':
        case 'flagToggled':
            if (state.citizenProfile) {
                sendNUI('getCitizenProfile', { citizenId: state.citizenProfile.identifier });
            }
            showToast('success', 'Mise a jour effectuee');
            break;
        case 'warrantCreated':
        case 'warrantUpdated':
            showToast('success', 'Mandat mis a jour');
            sendNUI('getWarrants', { filter: 'active' });
            closeModal();
            break;
        case 'boloCreated':
        case 'boloUpdated':
            showToast('success', 'BOLO mis a jour');
            sendNUI('getBolos', { filter: 'active' });
            closeModal();
            break;
        case 'incidentCreated':
            showToast('success', 'Rapport #' + (data?.id || '') + ' cree');
            sendNUI('getIncidents', { filter: 'all' });
            closeModal();
            break;
        case 'incidentUpdated':
            showToast('success', 'Rapport mis a jour');
            closeModal();
            break;
        case 'callCreated':
        case 'callUpdated':
            showToast('success', 'Appel mis a jour');
            sendNUI('getDispatchCalls');
            break;
        case 'stolenReported':
            showToast('success', 'Vehicule signale vole');
            closeModal();
            break;
        case 'profileUpdated':
            showToast('success', 'Profil mis a jour');
            sendNUI('getOfficerData', {});
            break;
        case 'licenseUpdated':
            showToast('success', 'Licence mise a jour');
            break;
        case 'newDispatchAlert':
            showToast('warning', `[DISPATCH] ${data.type} - ${data.location}`);
            break;
    }
});

// ============================================
// MDT OPEN / CLOSE
// ============================================

function openMDT() {
    const container = document.getElementById('mdt-container');
    const bootScreen = document.getElementById('boot-screen');
    const app = document.getElementById('mdt-app');

    container.classList.remove('hidden');
    bootScreen.classList.remove('hidden');
    app.classList.add('hidden');

    // Boot animation
    setTimeout(() => {
        bootScreen.classList.add('hidden');
        app.classList.remove('hidden');
        navigate('dashboard');
        startClock();
    }, 2000);
}

function closeMDTInstant() {
    document.getElementById('mdt-container').classList.add('hidden');
    stopClock();
}

function closeMDT() {
    sendNUI('closeMDT');
}

// ============================================
// CLOCK
// ============================================

let clockInterval = null;

function startClock() {
    updateClock();
    clockInterval = setInterval(updateClock, 1000);
}

function stopClock() {
    if (clockInterval) clearInterval(clockInterval);
}

function updateClock() {
    const now = new Date();
    const time = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const date = now.toLocaleDateString('fr-FR');
    const timeEl = document.getElementById('clock-time');
    const dateEl = document.getElementById('clock-date');
    if (timeEl) timeEl.textContent = time;
    if (dateEl) dateEl.textContent = date;
}

// ============================================
// NAVIGATION
// ============================================

function navigate(page) {
    state.currentPage = page;

    // Update nav
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === page);
    });

    // Render page
    const content = document.getElementById('mdt-content');
    content.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';

    switch (page) {
        case 'dashboard':
            sendNUI('getDashboardData');
            renderDashboardPage();
            break;
        case 'citizens':
            renderCitizensPage();
            break;
        case 'vehicles':
            renderVehiclesPage();
            break;
        case 'warrants':
            sendNUI('getWarrants', { filter: 'active' });
            renderWarrantsPage();
            break;
        case 'bolos':
            sendNUI('getBolos', { filter: 'active' });
            renderBolosPage();
            break;
        case 'incidents':
            sendNUI('getIncidents', { filter: 'all' });
            renderIncidentsPage();
            break;
        case 'penalcode':
            renderPenalCodePage();
            break;
        case 'dispatch':
            sendNUI('getDispatchCalls');
            renderDispatchPage();
            break;
        case 'officers':
            sendNUI('getOnlineOfficers');
            renderOfficersPage();
            break;
        case 'profile':
            renderProfilePage();
            break;
    }
}

function updateOfficerUI() {
    if (!state.officer) return;
    const nameEl = document.getElementById('officer-name');
    const rankEl = document.getElementById('officer-rank');
    if (nameEl) nameEl.textContent = state.officer.name;
    if (rankEl) rankEl.textContent = state.officer.rank || 'Officier';
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR') + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function formatMoney(amount) {
    return '$' + (amount || 0).toLocaleString('fr-FR');
}

function getStatusBadge(status) {
    const map = {
        active: 'badge-red', served: 'badge-green', cancelled: 'badge-gray', expired: 'badge-gray',
        open: 'badge-blue', under_investigation: 'badge-yellow', closed: 'badge-green', archived: 'badge-gray',
        pending: 'badge-yellow', dispatched: 'badge-blue', responding: 'badge-cyan', on_scene: 'badge-purple',
        resolved: 'badge-green', stolen: 'badge-red', recovered: 'badge-green', not_found: 'badge-gray',
        valid: 'badge-green', suspended: 'badge-red', revoked: 'badge-red',
    };
    const labels = {
        active: 'Actif', served: 'Execute', cancelled: 'Annule', expired: 'Expire',
        open: 'Ouvert', under_investigation: 'En cours', closed: 'Clos', archived: 'Archive',
        pending: 'En attente', dispatched: 'Dispatche', responding: 'En route', on_scene: 'Sur place',
        resolved: 'Resolu', stolen: 'Vole', recovered: 'Recupere', not_found: 'Non trouve',
        valid: 'Valide', suspended: 'Suspendu', revoked: 'Revoque',
    };
    return `<span class="badge ${map[status] || 'badge-gray'}">${labels[status] || status}</span>`;
}

function getPriorityBadge(priority) {
    const map = { critical: 'badge-red', high: 'badge-yellow', normal: 'badge-blue', low: 'badge-gray' };
    const labels = { critical: 'Critique', high: 'Haute', normal: 'Normale', low: 'Basse' };
    return `<span class="badge ${map[priority] || 'badge-gray'}">${labels[priority] || priority}</span>`;
}

function getTypeBadge(type) {
    const map = {
        arrest: 'badge-red', citation: 'badge-yellow', investigation: 'badge-blue', accident: 'badge-purple',
        shooting: 'badge-red', robbery: 'badge-red', other: 'badge-gray',
        person: 'badge-cyan', vehicle: 'badge-purple',
        search: 'badge-blue', bench: 'badge-yellow',
        general: 'badge-gray', domestic: 'badge-yellow', suspicious: 'badge-cyan', medical: 'badge-green', fire: 'badge-red',
    };
    const labels = {
        arrest: 'Arrestation', citation: 'Citation', investigation: 'Enquete', accident: 'Accident',
        shooting: 'Fusillade', robbery: 'Vol', other: 'Autre',
        person: 'Personne', vehicle: 'Vehicule',
        search: 'Perquisition', bench: 'Comparution',
        general: 'General', domestic: 'Domestique', suspicious: 'Suspect', medical: 'Medical', fire: 'Incendie',
    };
    return `<span class="badge ${map[type] || 'badge-gray'}">${labels[type] || type}</span>`;
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================

function showToast(type, message) {
    const container = document.getElementById('toast-container');
    const icons = { success: 'fa-check', error: 'fa-xmark', warning: 'fa-exclamation', info: 'fa-info' };
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-icon"><i class="fas ${icons[type] || icons.info}"></i></div>
        <div class="toast-message">${message}</div>
    `;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ============================================
// MODAL
// ============================================

function openModal(title, content, footer = '') {
    const overlay = document.getElementById('modal-overlay');
    const modalContent = document.getElementById('modal-content');
    modalContent.innerHTML = `
        <div class="modal-header">
            <h3>${title}</h3>
            <button class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <div class="modal-body">${content}</div>
        ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
    `;
    overlay.classList.remove('hidden');
}

function closeModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
}

// ============================================
// DASHBOARD PAGE
// ============================================

function renderDashboardPage() {
    const content = document.getElementById('mdt-content');
    content.innerHTML = `
        <div class="page-header">
            <div class="page-title">
                <div class="page-title-icon blue"><i class="fas fa-gauge-high"></i></div>
                <div>
                    <h2>Tableau de bord</h2>
                    <p>Bienvenue, ${state.officer?.name || 'Officier'}</p>
                </div>
            </div>
        </div>
        <div class="stats-grid" id="dashboard-stats">
            <div class="stat-card"><div class="stat-icon red"><i class="fas fa-gavel"></i></div><div class="stat-info"><div class="stat-value" id="stat-warrants">-</div><div class="stat-label">Mandats actifs</div></div></div>
            <div class="stat-card"><div class="stat-icon yellow"><i class="fas fa-bullhorn"></i></div><div class="stat-info"><div class="stat-value" id="stat-bolos">-</div><div class="stat-label">BOLO actifs</div></div></div>
            <div class="stat-card"><div class="stat-icon blue"><i class="fas fa-file-lines"></i></div><div class="stat-info"><div class="stat-value" id="stat-incidents">-</div><div class="stat-label">Rapports aujourd'hui</div></div></div>
            <div class="stat-card"><div class="stat-icon cyan"><i class="fas fa-tower-broadcast"></i></div><div class="stat-info"><div class="stat-value" id="stat-calls">-</div><div class="stat-label">Appels actifs</div></div></div>
        </div>
        <div class="grid-2">
            <div class="card">
                <div class="card-header"><h3><i class="fas fa-clock-rotate-left"></i> Rapports recents</h3></div>
                <div class="card-body no-padding" id="dashboard-incidents">
                    <div class="loading-spinner"><div class="spinner"></div></div>
                </div>
            </div>
            <div class="card">
                <div class="card-header"><h3><i class="fas fa-tower-broadcast"></i> Appels actifs</h3></div>
                <div class="card-body no-padding" id="dashboard-calls">
                    <div class="loading-spinner"><div class="spinner"></div></div>
                </div>
            </div>
        </div>
    `;
}

function renderDashboard() {
    const d = state.dashboard;
    const statsWarrants = document.getElementById('stat-warrants');
    const statsBolos = document.getElementById('stat-bolos');
    const statsIncidents = document.getElementById('stat-incidents');
    const statsCalls = document.getElementById('stat-calls');

    if (statsWarrants) statsWarrants.textContent = d.stats.warrants || 0;
    if (statsBolos) statsBolos.textContent = d.stats.bolos || 0;
    if (statsIncidents) statsIncidents.textContent = d.stats.incidents || 0;
    if (statsCalls) statsCalls.textContent = d.stats.activeCalls || 0;

    // Update badges
    const warrantBadge = document.getElementById('warrant-badge');
    const boloBadge = document.getElementById('bolo-badge');
    const dispatchBadge = document.getElementById('dispatch-badge');
    if (warrantBadge) { warrantBadge.textContent = d.stats.warrants || 0; warrantBadge.style.display = d.stats.warrants > 0 ? '' : 'none'; }
    if (boloBadge) { boloBadge.textContent = d.stats.bolos || 0; boloBadge.style.display = d.stats.bolos > 0 ? '' : 'none'; }
    if (dispatchBadge) { dispatchBadge.textContent = d.stats.activeCalls || 0; dispatchBadge.style.display = d.stats.activeCalls > 0 ? '' : 'none'; }

    // Recent incidents
    const incidentsEl = document.getElementById('dashboard-incidents');
    if (incidentsEl) {
        if (!d.recentIncidents || d.recentIncidents.length === 0) {
            incidentsEl.innerHTML = '<div class="empty-state"><i class="fas fa-file-lines"></i><h4>Aucun rapport recent</h4></div>';
        } else {
            incidentsEl.innerHTML = `<div class="activity-list" style="padding: 12px;">
                ${d.recentIncidents.map(i => `
                    <div class="activity-item">
                        <div class="activity-icon" style="background: var(--accent-blue-dim); color: var(--accent-blue);"><i class="fas fa-file-lines"></i></div>
                        <div class="activity-content">
                            <div class="activity-title">#${i.id} - ${i.title}</div>
                            <div class="activity-meta">${i.created_by} - ${formatDate(i.created_at)} ${getStatusBadge(i.status)}</div>
                        </div>
                    </div>
                `).join('')}
            </div>`;
        }
    }

    // Active calls
    const callsEl = document.getElementById('dashboard-calls');
    if (callsEl) {
        if (!d.activeCalls || d.activeCalls.length === 0) {
            callsEl.innerHTML = '<div class="empty-state"><i class="fas fa-tower-broadcast"></i><h4>Aucun appel actif</h4></div>';
        } else {
            callsEl.innerHTML = `<div style="padding: 12px;">
                ${d.activeCalls.map(c => `
                    <div class="dispatch-card priority-${c.priority}" style="margin-bottom: 8px;">
                        <div class="dispatch-card-header">
                            <span class="dispatch-card-type"><span class="priority-dot ${c.priority}"></span> ${c.type || 'Appel'}</span>
                            ${getStatusBadge(c.status)}
                        </div>
                        <div class="dispatch-card-location"><i class="fas fa-location-dot"></i> ${c.location}</div>
                        <div class="dispatch-card-desc">${c.description}</div>
                    </div>
                `).join('')}
            </div>`;
        }
    }
}

// ============================================
// CITIZENS PAGE
// ============================================

function renderCitizensPage() {
    const content = document.getElementById('mdt-content');
    state.citizenProfile = null;
    content.innerHTML = `
        <div class="page-header">
            <div class="page-title">
                <div class="page-title-icon cyan"><i class="fas fa-users"></i></div>
                <div><h2>Recherche Citoyens</h2><p>Rechercher dans la base de donnees des citoyens</p></div>
            </div>
        </div>
        <div class="search-bar">
            <div class="search-input-wrapper">
                <i class="fas fa-search"></i>
                <input type="text" id="citizen-search-input" placeholder="Rechercher par nom, prenom ou identifiant..." onkeydown="if(event.key==='Enter') searchCitizens()">
            </div>
            <button class="btn btn-primary" onclick="searchCitizens()"><i class="fas fa-search"></i> Rechercher</button>
        </div>
        <div id="citizen-results"></div>
        <div id="citizen-profile-view"></div>
    `;
}

function searchCitizens() {
    const query = document.getElementById('citizen-search-input')?.value?.trim();
    if (!query || query.length < 2) {
        showToast('warning', 'Entrez au moins 2 caracteres');
        return;
    }
    document.getElementById('citizen-results').innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';
    document.getElementById('citizen-profile-view').innerHTML = '';
    sendNUI('searchCitizens', { query });
}

function renderCitizenResults() {
    const el = document.getElementById('citizen-results');
    if (!el) return;

    if (state.citizenSearch.length === 0) {
        el.innerHTML = '<div class="empty-state"><i class="fas fa-user-slash"></i><h4>Aucun resultat</h4><p>Essayez avec un autre nom ou identifiant</p></div>';
        return;
    }

    el.innerHTML = `
        <div class="card">
            <div class="card-header"><h3><i class="fas fa-list"></i> Resultats (${state.citizenSearch.length})</h3></div>
            <div class="card-body no-padding">
                <div class="table-container">
                    <table class="table-clickable">
                        <thead><tr><th>Nom</th><th>Date de naissance</th><th>Sexe</th><th>Telephone</th><th>Flags</th><th></th></tr></thead>
                        <tbody>
                            ${state.citizenSearch.map(c => `
                                <tr onclick="viewCitizenProfile('${c.identifier}')">
                                    <td><strong>${c.firstname || ''} ${c.lastname || ''}</strong></td>
                                    <td class="muted">${c.dateofbirth || 'N/A'}</td>
                                    <td>${c.sex === 'm' || c.sex === 0 ? 'Homme' : 'Femme'}</td>
                                    <td class="font-mono">${c.phone_number || 'N/A'}</td>
                                    <td>${(c.flags || []).map(f => getFlagTag(f)).join(' ')}</td>
                                    <td><button class="btn btn-ghost btn-sm"><i class="fas fa-eye"></i></button></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

function getFlagTag(flag) {
    const map = {
        wanted: { class: 'flag-wanted', label: 'RECHERCHE', icon: 'fa-handcuffs' },
        armed_dangerous: { class: 'flag-armed', label: 'ARME & DANGEREUX', icon: 'fa-gun' },
        gang_member: { class: 'flag-gang', label: 'GANG', icon: 'fa-users-rectangle' },
        parole: { class: 'flag-parole', label: 'EN LIBERTE CONDITIONNELLE', icon: 'fa-user-clock' },
        mental_health: { class: 'flag-mental', label: 'INSTABLE', icon: 'fa-brain' },
        bail: { class: 'flag-bail', label: 'SOUS CAUTION', icon: 'fa-scale-balanced' },
    };
    const f = map[flag] || { class: 'flag-wanted', label: flag, icon: 'fa-flag' };
    return `<span class="flag-tag ${f.class}"><i class="fas ${f.icon}"></i> ${f.label}</span>`;
}

function viewCitizenProfile(citizenId) {
    document.getElementById('citizen-results').innerHTML = '';
    document.getElementById('citizen-profile-view').innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';
    sendNUI('getCitizenProfile', { citizenId });
}

let profileTab = 'records';

function renderCitizenProfile() {
    const el = document.getElementById('citizen-profile-view');
    if (!el || !state.citizenProfile) return;

    const c = state.citizenProfile;
    const flags = c.flags || [];
    const flagTypes = flags.map(f => f.flag_type || f);

    el.innerHTML = `
        <button class="btn btn-ghost mb-4" onclick="renderCitizensPage()"><i class="fas fa-arrow-left"></i> Retour</button>
        <div class="profile-header">
            <div class="profile-avatar"><i class="fas fa-user"></i></div>
            <div class="profile-info">
                <div class="profile-name">${c.firstname || ''} ${c.lastname || ''}</div>
                <div class="profile-id">ID: ${c.identifier}</div>
                <div class="profile-details">
                    <div class="profile-detail"><span class="profile-detail-label">Date de naissance</span><span class="profile-detail-value">${c.dateofbirth || 'N/A'}</span></div>
                    <div class="profile-detail"><span class="profile-detail-label">Sexe</span><span class="profile-detail-value">${c.sex === 'm' || c.sex === 0 ? 'Homme' : 'Femme'}</span></div>
                    <div class="profile-detail"><span class="profile-detail-label">Telephone</span><span class="profile-detail-value font-mono">${c.phone_number || 'N/A'}</span></div>
                </div>
                <div class="profile-flags mt-2">
                    ${flagTypes.map(f => getFlagTag(f)).join(' ')}
                    ${c.warrants && c.warrants.length > 0 ? '<span class="flag-tag flag-wanted"><i class="fas fa-gavel"></i> MANDAT ACTIF</span>' : ''}
                </div>
            </div>
            <div style="display:flex; flex-direction:column; gap:6px;">
                <button class="btn btn-ghost btn-sm" onclick="openFlagModal('${c.identifier}')"><i class="fas fa-flag"></i> Flags</button>
                <button class="btn btn-ghost btn-sm" onclick="openNoteModal('${c.identifier}')"><i class="fas fa-note-sticky"></i> Note</button>
                <button class="btn btn-warning btn-sm" onclick="openWarrantModalForCitizen('${c.identifier}', '${(c.firstname || '') + ' ' + (c.lastname || '')}')"><i class="fas fa-gavel"></i> Mandat</button>
            </div>
        </div>

        <div class="profile-tabs">
            <button class="profile-tab ${profileTab === 'records' ? 'active' : ''}" onclick="setProfileTab('records')">Casier judiciaire</button>
            <button class="profile-tab ${profileTab === 'vehicles' ? 'active' : ''}" onclick="setProfileTab('vehicles')">Vehicules</button>
            <button class="profile-tab ${profileTab === 'incidents' ? 'active' : ''}" onclick="setProfileTab('incidents')">Incidents</button>
            <button class="profile-tab ${profileTab === 'licenses' ? 'active' : ''}" onclick="setProfileTab('licenses')">Licences</button>
            <button class="profile-tab ${profileTab === 'notes' ? 'active' : ''}" onclick="setProfileTab('notes')">Notes</button>
        </div>

        <div id="profile-tab-content"></div>
    `;

    renderProfileTabContent(c);
}

function setProfileTab(tab) {
    profileTab = tab;
    renderCitizenProfile();
}

function renderProfileTabContent(c) {
    const el = document.getElementById('profile-tab-content');
    if (!el) return;

    switch (profileTab) {
        case 'records':
            if (!c.records || c.records.length === 0) {
                el.innerHTML = '<div class="empty-state"><i class="fas fa-check-circle"></i><h4>Casier vierge</h4><p>Aucune condamnation enregistree</p></div>';
            } else {
                el.innerHTML = `<div class="card"><div class="card-body no-padding"><div class="table-container"><table>
                    <thead><tr><th>Date</th><th>Charge</th><th>Amende</th><th>Prison</th><th>Officier</th></tr></thead>
                    <tbody>${c.records.map(r => `
                        <tr>
                            <td class="muted font-mono text-sm">${formatDate(r.created_at)}</td>
                            <td><strong>${r.charge_title}</strong></td>
                            <td class="text-yellow font-mono">${formatMoney(r.fine_amount)}</td>
                            <td class="text-red font-mono">${r.jail_time ? r.jail_time + ' mois' : '-'}</td>
                            <td class="muted">${r.officer_name}</td>
                        </tr>
                    `).join('')}</tbody>
                </table></div></div></div>`;
            }
            break;

        case 'vehicles':
            if (!c.vehicles || c.vehicles.length === 0) {
                el.innerHTML = '<div class="empty-state"><i class="fas fa-car"></i><h4>Aucun vehicule</h4><p>Aucun vehicule enregistre au nom de ce citoyen</p></div>';
            } else {
                el.innerHTML = `<div class="card"><div class="card-body no-padding"><div class="table-container"><table>
                    <thead><tr><th>Plaque</th><th>Modele</th></tr></thead>
                    <tbody>${c.vehicles.map(v => `
                        <tr><td class="font-mono"><strong>${v.plate}</strong></td><td>${v.vehicle || 'Inconnu'}</td></tr>
                    `).join('')}</tbody>
                </table></div></div></div>`;
            }
            break;

        case 'incidents':
            if (!c.incidents || c.incidents.length === 0) {
                el.innerHTML = '<div class="empty-state"><i class="fas fa-file-lines"></i><h4>Aucun incident</h4></div>';
            } else {
                el.innerHTML = `<div class="card"><div class="card-body no-padding"><div class="table-container"><table>
                    <thead><tr><th>#</th><th>Titre</th><th>Role</th><th>Statut</th><th>Date</th></tr></thead>
                    <tbody>${c.incidents.map(i => `
                        <tr>
                            <td class="font-mono">${i.id}</td>
                            <td><strong>${i.title}</strong></td>
                            <td>${getTypeBadge(i.role)}</td>
                            <td>${getStatusBadge(i.status)}</td>
                            <td class="muted text-sm">${formatDate(i.created_at)}</td>
                        </tr>
                    `).join('')}</tbody>
                </table></div></div></div>`;
            }
            break;

        case 'licenses':
            if (!c.licenses || c.licenses.length === 0) {
                el.innerHTML = '<div class="empty-state"><i class="fas fa-id-card"></i><h4>Aucune licence</h4></div>';
            } else {
                const licenseLabels = { driving: 'Permis de conduire', weapon: 'Port d\'arme', hunting: 'Chasse', fishing: 'Peche', pilot: 'Pilote', boating: 'Navigation' };
                el.innerHTML = `<div class="card"><div class="card-body no-padding"><div class="table-container"><table>
                    <thead><tr><th>Type</th><th>Statut</th><th>Actions</th></tr></thead>
                    <tbody>${c.licenses.map(l => `
                        <tr>
                            <td><strong>${licenseLabels[l.type] || l.type}</strong></td>
                            <td>${getStatusBadge(l.status)}</td>
                            <td>
                                ${l.status === 'valid' ? `<button class="btn btn-danger btn-sm" onclick="updateLicense('${c.identifier}','${l.type}','suspended')"><i class="fas fa-ban"></i> Suspendre</button>` : ''}
                                ${l.status === 'suspended' ? `<button class="btn btn-success btn-sm" onclick="updateLicense('${c.identifier}','${l.type}','valid')"><i class="fas fa-check"></i> Restaurer</button>` : ''}
                            </td>
                        </tr>
                    `).join('')}</tbody>
                </table></div></div></div>`;
            }
            break;

        case 'notes':
            el.innerHTML = `
                <div class="mb-4">
                    <div class="flex gap-2">
                        <input type="text" class="form-control" id="new-note-input" placeholder="Ajouter une note..." style="flex:1;">
                        <button class="btn btn-primary" onclick="addCitizenNote('${c.identifier}')"><i class="fas fa-plus"></i> Ajouter</button>
                    </div>
                </div>
                ${(!c.notes || c.notes.length === 0) ?
                    '<div class="empty-state"><i class="fas fa-note-sticky"></i><h4>Aucune note</h4></div>' :
                    c.notes.map(n => `
                        <div class="note-item">
                            <div class="note-header">
                                <span class="note-author"><i class="fas fa-user-shield"></i> ${n.officer_name}</span>
                                <span class="note-date">${formatDate(n.created_at)}</span>
                            </div>
                            <div class="note-text">${n.note}</div>
                        </div>
                    `).join('')
                }
            `;
            break;
    }
}

function addCitizenNote(citizenId) {
    const input = document.getElementById('new-note-input');
    const note = input?.value?.trim();
    if (!note) return;
    sendNUI('addCitizenNote', { citizenId, note });
    input.value = '';
}

function updateLicense(citizenId, licenseType, status) {
    sendNUI('updateLicense', { citizenId, licenseType, status, reason: '' });
}

function openFlagModal(citizenId) {
    const flagTypes = [
        { key: 'wanted', label: 'Recherche', icon: 'fa-handcuffs' },
        { key: 'armed_dangerous', label: 'Arme & Dangereux', icon: 'fa-gun' },
        { key: 'gang_member', label: 'Membre de gang', icon: 'fa-users-rectangle' },
        { key: 'parole', label: 'Liberte conditionnelle', icon: 'fa-user-clock' },
        { key: 'mental_health', label: 'Instabilite mentale', icon: 'fa-brain' },
        { key: 'bail', label: 'Sous caution', icon: 'fa-scale-balanced' },
    ];
    const currentFlags = (state.citizenProfile?.flags || []).map(f => f.flag_type || f);

    openModal('Gerer les Flags', `
        <p class="text-muted mb-4">Cliquez pour activer/desactiver un flag</p>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
            ${flagTypes.map(f => {
                const active = currentFlags.includes(f.key);
                return `<button class="btn ${active ? 'btn-danger' : 'btn-ghost'}" onclick="toggleFlag('${citizenId}','${f.key}',${!active})">
                    <i class="fas ${f.icon}"></i> ${f.label} ${active ? '(Actif)' : ''}
                </button>`;
            }).join('')}
        </div>
    `);
}

function toggleFlag(citizenId, flagType, active) {
    sendNUI('toggleCitizenFlag', { citizenId, flagType, active });
    closeModal();
}

function openNoteModal(citizenId) {
    openModal('Ajouter une Note', `
        <div class="form-group">
            <label>Note</label>
            <textarea class="form-control" id="modal-note-text" rows="4" placeholder="Entrez votre note..."></textarea>
        </div>
    `, `
        <button class="btn btn-ghost" onclick="closeModal()">Annuler</button>
        <button class="btn btn-primary" onclick="submitNote('${citizenId}')"><i class="fas fa-check"></i> Enregistrer</button>
    `);
}

function submitNote(citizenId) {
    const note = document.getElementById('modal-note-text')?.value?.trim();
    if (!note) return;
    sendNUI('addCitizenNote', { citizenId, note });
    closeModal();
}

// ============================================
// VEHICLES PAGE
// ============================================

function renderVehiclesPage() {
    const content = document.getElementById('mdt-content');
    content.innerHTML = `
        <div class="page-header">
            <div class="page-title">
                <div class="page-title-icon purple"><i class="fas fa-car"></i></div>
                <div><h2>Recherche Vehicules</h2><p>Rechercher par plaque d'immatriculation</p></div>
            </div>
        </div>
        <div class="search-bar">
            <div class="search-input-wrapper">
                <i class="fas fa-search"></i>
                <input type="text" id="vehicle-search-input" placeholder="Entrez une plaque d'immatriculation..." onkeydown="if(event.key==='Enter') searchVehicles()" style="text-transform: uppercase;">
            </div>
            <button class="btn btn-primary" onclick="searchVehicles()"><i class="fas fa-search"></i> Rechercher</button>
        </div>
        <div id="vehicle-results"></div>
    `;
}

function searchVehicles() {
    const query = document.getElementById('vehicle-search-input')?.value?.trim();
    if (!query) { showToast('warning', 'Entrez une plaque'); return; }
    document.getElementById('vehicle-results').innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';
    sendNUI('searchVehicles', { query });
}

function renderVehicleResults() {
    const el = document.getElementById('vehicle-results');
    if (!el) return;

    if (state.vehicleSearch.length === 0) {
        el.innerHTML = '<div class="empty-state"><i class="fas fa-car"></i><h4>Aucun vehicule trouve</h4></div>';
        return;
    }

    el.innerHTML = `
        <div class="card">
            <div class="card-header"><h3><i class="fas fa-list"></i> Resultats (${state.vehicleSearch.length})</h3></div>
            <div class="card-body no-padding"><div class="table-container"><table>
                <thead><tr><th>Plaque</th><th>Modele</th><th>Proprietaire</th><th>Statut</th><th>Actions</th></tr></thead>
                <tbody>
                    ${state.vehicleSearch.map(v => `
                        <tr>
                            <td class="font-mono font-bold">${v.plate}</td>
                            <td>${v.vehicle || 'Inconnu'}</td>
                            <td>${v.firstname || ''} ${v.lastname || ''} ${v.identifier ? `<button class="btn btn-ghost btn-sm" onclick="navigate('citizens'); setTimeout(()=>{ document.getElementById('citizen-search-input').value='${v.firstname} ${v.lastname}'; searchCitizens(); },100)"><i class="fas fa-external-link-alt"></i></button>` : ''}</td>
                            <td>
                                ${v.stolen ? '<span class="badge badge-red"><i class="fas fa-exclamation-triangle"></i> VOLE</span>' : '<span class="badge badge-green">OK</span>'}
                                ${v.bolo ? '<span class="badge badge-yellow">BOLO</span>' : ''}
                            </td>
                            <td>
                                ${!v.stolen ? `<button class="btn btn-danger btn-sm" onclick="openStolenModal('${v.plate}','${v.vehicle || ''}','${v.firstname || ''} ${v.lastname || ''}')"><i class="fas fa-flag"></i> Signaler vole</button>` : ''}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table></div></div>
        </div>
    `;
}

function openStolenModal(plate, model, owner) {
    openModal('Signaler Vehicule Vole', `
        <div class="form-row">
            <div class="form-group"><label>Plaque</label><input class="form-control" value="${plate}" disabled></div>
            <div class="form-group"><label>Modele</label><input class="form-control" value="${model}" disabled></div>
        </div>
        <div class="form-group"><label>Lieu du vol</label><input class="form-control" id="stolen-location" placeholder="Derniere localisation connue..."></div>
        <div class="form-group"><label>Description</label><textarea class="form-control" id="stolen-desc" placeholder="Details supplementaires..."></textarea></div>
    `, `
        <button class="btn btn-ghost" onclick="closeModal()">Annuler</button>
        <button class="btn btn-danger" onclick="reportStolen('${plate}','${model}','${owner}')"><i class="fas fa-flag"></i> Signaler</button>
    `);
}

function reportStolen(plate, model, owner) {
    sendNUI('reportStolenVehicle', {
        plate, model, owner,
        location: document.getElementById('stolen-location')?.value || '',
        description: document.getElementById('stolen-desc')?.value || '',
    });
}

// ============================================
// WARRANTS PAGE
// ============================================

function renderWarrantsPage() {
    const content = document.getElementById('mdt-content');
    content.innerHTML = `
        <div class="page-header">
            <div class="page-title">
                <div class="page-title-icon red"><i class="fas fa-gavel"></i></div>
                <div><h2>Mandats</h2><p>Gestion des mandats d'arret, perquisition et comparution</p></div>
            </div>
            <div class="page-actions">
                <button class="btn btn-primary" onclick="openCreateWarrantModal()"><i class="fas fa-plus"></i> Nouveau Mandat</button>
            </div>
        </div>
        <div class="filter-tabs" id="warrant-filters">
            <button class="filter-tab active" onclick="filterWarrants('active', this)">Actifs</button>
            <button class="filter-tab" onclick="filterWarrants('served', this)">Executes</button>
            <button class="filter-tab" onclick="filterWarrants('cancelled', this)">Annules</button>
            <button class="filter-tab" onclick="filterWarrants('all', this)">Tous</button>
        </div>
        <div id="warrants-list"><div class="loading-spinner"><div class="spinner"></div></div></div>
    `;
}

function filterWarrants(filter, btn) {
    document.querySelectorAll('#warrant-filters .filter-tab').forEach(t => t.classList.remove('active'));
    if (btn) btn.classList.add('active');
    sendNUI('getWarrants', { filter });
}

function renderWarrantsList() {
    const el = document.getElementById('warrants-list');
    if (!el) return;

    if (state.warrants.length === 0) {
        el.innerHTML = '<div class="empty-state"><i class="fas fa-gavel"></i><h4>Aucun mandat</h4></div>';
        return;
    }

    el.innerHTML = `<div class="card"><div class="card-body no-padding"><div class="table-container"><table>
        <thead><tr><th>#</th><th>Type</th><th>Citoyen</th><th>Titre</th><th>Emis par</th><th>Statut</th><th>Date</th><th>Actions</th></tr></thead>
        <tbody>
            ${state.warrants.map(w => `
                <tr>
                    <td class="font-mono">${w.id}</td>
                    <td>${getTypeBadge(w.type)}</td>
                    <td><strong>${w.citizen_name}</strong></td>
                    <td>${w.title}</td>
                    <td class="muted">${w.issued_by}</td>
                    <td>${getStatusBadge(w.status)}</td>
                    <td class="muted text-sm font-mono">${formatDate(w.created_at)}</td>
                    <td>
                        ${w.status === 'active' ? `
                            <button class="btn btn-success btn-sm" onclick="updateWarrant(${w.id},'served')" title="Marquer comme execute"><i class="fas fa-check"></i></button>
                            <button class="btn btn-ghost btn-sm" onclick="updateWarrant(${w.id},'cancelled')" title="Annuler"><i class="fas fa-xmark"></i></button>
                        ` : ''}
                    </td>
                </tr>
            `).join('')}
        </tbody>
    </table></div></div></div>`;
}

function updateWarrant(id, status) {
    sendNUI('updateWarrantStatus', { warrantId: id, status });
}

function openWarrantModalForCitizen(citizenId, citizenName) {
    openCreateWarrantModal(citizenId, citizenName);
}

function openCreateWarrantModal(citizenId = '', citizenName = '') {
    openModal('Creer un Mandat', `
        <div class="form-row">
            <div class="form-group"><label>Nom du citoyen</label><input class="form-control" id="warrant-citizen-name" value="${citizenName}" placeholder="Nom complet..."></div>
            <div class="form-group"><label>ID Citoyen</label><input class="form-control" id="warrant-citizen-id" value="${citizenId}" placeholder="Identifiant..."></div>
        </div>
        <div class="form-row">
            <div class="form-group"><label>Type</label>
                <select class="form-control" id="warrant-type">
                    <option value="arrest">Mandat d'arret</option>
                    <option value="search">Mandat de perquisition</option>
                    <option value="bench">Mandat de comparution</option>
                </select>
            </div>
            <div class="form-group"><label>Titre</label><input class="form-control" id="warrant-title" placeholder="Motif du mandat..."></div>
        </div>
        <div class="form-group"><label>Description</label><textarea class="form-control" id="warrant-desc" rows="3" placeholder="Details et justification du mandat..."></textarea></div>
        <div class="form-group"><label>Charges</label><textarea class="form-control" id="warrant-charges" rows="2" placeholder="Charges retenues..."></textarea></div>
    `, `
        <button class="btn btn-ghost" onclick="closeModal()">Annuler</button>
        <button class="btn btn-primary" onclick="submitWarrant()"><i class="fas fa-gavel"></i> Emettre le mandat</button>
    `);
}

function submitWarrant() {
    const data = {
        citizenName: document.getElementById('warrant-citizen-name')?.value || '',
        citizenId: document.getElementById('warrant-citizen-id')?.value || '',
        type: document.getElementById('warrant-type')?.value || 'arrest',
        title: document.getElementById('warrant-title')?.value || '',
        description: document.getElementById('warrant-desc')?.value || '',
        charges: document.getElementById('warrant-charges')?.value || '',
    };
    if (!data.citizenName || !data.title) { showToast('error', 'Remplissez les champs obligatoires'); return; }
    sendNUI('createWarrant', data);
}

// ============================================
// BOLO PAGE
// ============================================

function renderBolosPage() {
    const content = document.getElementById('mdt-content');
    content.innerHTML = `
        <div class="page-header">
            <div class="page-title">
                <div class="page-title-icon yellow"><i class="fas fa-bullhorn"></i></div>
                <div><h2>BOLO - Avis de Recherche</h2><p>Be On the Lookout - Personnes et vehicules recherches</p></div>
            </div>
            <div class="page-actions">
                <button class="btn btn-primary" onclick="openCreateBoloModal()"><i class="fas fa-plus"></i> Nouveau BOLO</button>
            </div>
        </div>
        <div class="filter-tabs" id="bolo-filters">
            <button class="filter-tab active" onclick="filterBolos('active', this)">Actifs</button>
            <button class="filter-tab" onclick="filterBolos('resolved', this)">Resolus</button>
            <button class="filter-tab" onclick="filterBolos('all', this)">Tous</button>
        </div>
        <div id="bolos-list"><div class="loading-spinner"><div class="spinner"></div></div></div>
    `;
}

function filterBolos(filter, btn) {
    document.querySelectorAll('#bolo-filters .filter-tab').forEach(t => t.classList.remove('active'));
    if (btn) btn.classList.add('active');
    sendNUI('getBolos', { filter });
}

function renderBolosList() {
    const el = document.getElementById('bolos-list');
    if (!el) return;

    if (state.bolos.length === 0) {
        el.innerHTML = '<div class="empty-state"><i class="fas fa-bullhorn"></i><h4>Aucun BOLO actif</h4></div>';
        return;
    }

    el.innerHTML = state.bolos.map(b => `
        <div class="bolo-card">
            <div class="bolo-card-header">
                <span class="bolo-card-title">${b.title}</span>
                <div style="display:flex; gap:6px; align-items:center;">
                    ${getPriorityBadge(b.priority)}
                    ${getTypeBadge(b.type)}
                    ${getStatusBadge(b.status)}
                </div>
            </div>
            <div class="bolo-card-body">${b.description}</div>
            <div class="bolo-card-details">
                ${b.person_name ? `<span><i class="fas fa-user"></i> ${b.person_name}</span>` : ''}
                ${b.vehicle_plate ? `<span><i class="fas fa-car"></i> ${b.vehicle_plate} ${b.vehicle_model || ''} ${b.vehicle_color || ''}</span>` : ''}
                ${b.last_seen_location ? `<span><i class="fas fa-location-dot"></i> ${b.last_seen_location}</span>` : ''}
                <span><i class="fas fa-user-shield"></i> ${b.created_by}</span>
                <span><i class="fas fa-clock"></i> ${formatDate(b.created_at)}</span>
            </div>
            ${b.status === 'active' ? `
                <div class="bolo-card-footer">
                    <div></div>
                    <div style="display:flex; gap:6px;">
                        <button class="btn btn-success btn-sm" onclick="updateBolo(${b.id},'resolved')"><i class="fas fa-check"></i> Resolu</button>
                        <button class="btn btn-ghost btn-sm" onclick="updateBolo(${b.id},'cancelled')"><i class="fas fa-xmark"></i> Annuler</button>
                    </div>
                </div>
            ` : ''}
        </div>
    `).join('');
}

function updateBolo(id, status) {
    sendNUI('updateBoloStatus', { boloId: id, status });
}

function openCreateBoloModal() {
    openModal('Creer un BOLO', `
        <div class="form-row">
            <div class="form-group"><label>Type</label>
                <select class="form-control" id="bolo-type" onchange="toggleBoloFields()">
                    <option value="person">Personne</option>
                    <option value="vehicle">Vehicule</option>
                </select>
            </div>
            <div class="form-group"><label>Priorite</label>
                <select class="form-control" id="bolo-priority">
                    <option value="low">Basse</option>
                    <option value="normal" selected>Normale</option>
                    <option value="high">Haute</option>
                    <option value="critical">Critique</option>
                </select>
            </div>
        </div>
        <div class="form-group"><label>Titre</label><input class="form-control" id="bolo-title" placeholder="Titre du BOLO..."></div>
        <div class="form-group"><label>Description</label><textarea class="form-control" id="bolo-desc" rows="3" placeholder="Description detaillee..."></textarea></div>
        <div id="bolo-person-fields">
            <div class="form-group"><label>Nom de la personne</label><input class="form-control" id="bolo-person-name" placeholder="Nom connu ou alias..."></div>
            <div class="form-group"><label>Description physique</label><textarea class="form-control" id="bolo-person-desc" rows="2" placeholder="Apparence, vetements..."></textarea></div>
        </div>
        <div id="bolo-vehicle-fields" style="display:none;">
            <div class="form-row-3">
                <div class="form-group"><label>Plaque</label><input class="form-control" id="bolo-vehicle-plate" placeholder="Plaque..." style="text-transform:uppercase;"></div>
                <div class="form-group"><label>Modele</label><input class="form-control" id="bolo-vehicle-model" placeholder="Modele..."></div>
                <div class="form-group"><label>Couleur</label><input class="form-control" id="bolo-vehicle-color" placeholder="Couleur..."></div>
            </div>
        </div>
        <div class="form-group"><label>Derniere localisation connue</label><input class="form-control" id="bolo-location" placeholder="Lieu..."></div>
        <div class="form-group"><label>Raison</label><textarea class="form-control" id="bolo-reason" rows="2" placeholder="Pourquoi cette personne/vehicule est recherche..."></textarea></div>
    `, `
        <button class="btn btn-ghost" onclick="closeModal()">Annuler</button>
        <button class="btn btn-primary" onclick="submitBolo()"><i class="fas fa-bullhorn"></i> Creer le BOLO</button>
    `);
}

function toggleBoloFields() {
    const type = document.getElementById('bolo-type')?.value;
    const personFields = document.getElementById('bolo-person-fields');
    const vehicleFields = document.getElementById('bolo-vehicle-fields');
    if (personFields) personFields.style.display = type === 'person' ? '' : 'none';
    if (vehicleFields) vehicleFields.style.display = type === 'vehicle' ? '' : 'none';
}

function submitBolo() {
    const data = {
        type: document.getElementById('bolo-type')?.value || 'person',
        priority: document.getElementById('bolo-priority')?.value || 'normal',
        title: document.getElementById('bolo-title')?.value || '',
        description: document.getElementById('bolo-desc')?.value || '',
        personName: document.getElementById('bolo-person-name')?.value || '',
        personDescription: document.getElementById('bolo-person-desc')?.value || '',
        vehiclePlate: document.getElementById('bolo-vehicle-plate')?.value || '',
        vehicleModel: document.getElementById('bolo-vehicle-model')?.value || '',
        vehicleColor: document.getElementById('bolo-vehicle-color')?.value || '',
        lastSeenLocation: document.getElementById('bolo-location')?.value || '',
        reason: document.getElementById('bolo-reason')?.value || '',
    };
    if (!data.title) { showToast('error', 'Entrez un titre'); return; }
    sendNUI('createBolo', data);
}

// ============================================
// INCIDENTS PAGE
// ============================================

function renderIncidentsPage() {
    const content = document.getElementById('mdt-content');
    state.incidentDetail = null;
    content.innerHTML = `
        <div class="page-header">
            <div class="page-title">
                <div class="page-title-icon blue"><i class="fas fa-file-lines"></i></div>
                <div><h2>Rapports & Incidents</h2><p>Gestion des rapports de police</p></div>
            </div>
            <div class="page-actions">
                <button class="btn btn-primary" onclick="openCreateIncidentModal()"><i class="fas fa-plus"></i> Nouveau Rapport</button>
            </div>
        </div>
        <div class="filter-tabs" id="incident-filters">
            <button class="filter-tab active" onclick="filterIncidents('all', this)">Tous</button>
            <button class="filter-tab" onclick="filterIncidents('open', this)">Ouverts</button>
            <button class="filter-tab" onclick="filterIncidents('under_investigation', this)">En cours</button>
            <button class="filter-tab" onclick="filterIncidents('closed', this)">Clos</button>
            <button class="filter-tab" onclick="filterIncidents('mine', this)">Mes rapports</button>
        </div>
        <div id="incidents-list"><div class="loading-spinner"><div class="spinner"></div></div></div>
    `;
}

function filterIncidents(filter, btn) {
    document.querySelectorAll('#incident-filters .filter-tab').forEach(t => t.classList.remove('active'));
    if (btn) btn.classList.add('active');
    sendNUI('getIncidents', { filter });
}

function renderIncidentsList() {
    const el = document.getElementById('incidents-list');
    if (!el) return;

    if (state.incidents.length === 0) {
        el.innerHTML = '<div class="empty-state"><i class="fas fa-file-lines"></i><h4>Aucun rapport</h4></div>';
        return;
    }

    el.innerHTML = `<div class="card"><div class="card-body no-padding"><div class="table-container"><table class="table-clickable">
        <thead><tr><th>#</th><th>Titre</th><th>Type</th><th>Priorite</th><th>Statut</th><th>Auteur</th><th>Date</th></tr></thead>
        <tbody>
            ${state.incidents.map(i => `
                <tr onclick="viewIncident(${i.id})">
                    <td class="font-mono">${i.id}</td>
                    <td><strong>${i.title}</strong></td>
                    <td>${getTypeBadge(i.type)}</td>
                    <td>${getPriorityBadge(i.priority)}</td>
                    <td>${getStatusBadge(i.status)}</td>
                    <td class="muted">${i.created_by}</td>
                    <td class="muted text-sm font-mono">${formatDate(i.created_at)}</td>
                </tr>
            `).join('')}
        </tbody>
    </table></div></div></div>`;
}

function viewIncident(id) {
    sendNUI('getIncidentDetail', { incidentId: id });
    document.getElementById('incidents-list').innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';
}

function renderIncidentDetail() {
    const el = document.getElementById('incidents-list');
    if (!el || !state.incidentDetail) return;

    const i = state.incidentDetail;
    const citizens = i.citizens || [];

    el.innerHTML = `
        <button class="btn btn-ghost mb-4" onclick="navigate('incidents')"><i class="fas fa-arrow-left"></i> Retour</button>
        <div class="card mb-4">
            <div class="card-header">
                <h3><i class="fas fa-file-lines"></i> Rapport #${i.id} - ${i.title}</h3>
                <div style="display:flex; gap:6px;">
                    ${getPriorityBadge(i.priority)}
                    ${getTypeBadge(i.type)}
                    ${getStatusBadge(i.status)}
                </div>
            </div>
            <div class="card-body">
                <div class="grid-3 mb-4">
                    <div><span class="text-muted text-sm">Lieu</span><br><strong>${i.location || 'N/A'}</strong></div>
                    <div><span class="text-muted text-sm">Auteur</span><br><strong>${i.created_by}</strong></div>
                    <div><span class="text-muted text-sm">Date</span><br><strong>${formatDate(i.created_at)}</strong></div>
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <div style="background:var(--bg-input); padding:12px; border-radius:var(--radius-md); border:1px solid var(--border); white-space:pre-wrap; font-size:12.5px; line-height:1.6;">${i.description}</div>
                </div>
                ${i.evidence ? `<div class="form-group"><label>Preuves</label><div style="background:var(--bg-input); padding:12px; border-radius:var(--radius-md); border:1px solid var(--border); white-space:pre-wrap; font-size:12.5px;">${i.evidence}</div></div>` : ''}
            </div>
        </div>

        <div class="card mb-4">
            <div class="card-header"><h3><i class="fas fa-users"></i> Personnes impliquees (${citizens.length})</h3></div>
            <div class="card-body no-padding">
                ${citizens.length === 0 ? '<div class="empty-state"><i class="fas fa-users"></i><h4>Aucune personne impliquee</h4></div>' : `
                    <div class="table-container"><table>
                        <thead><tr><th>Nom</th><th>Role</th><th>Charges</th><th>Amende</th><th>Prison</th></tr></thead>
                        <tbody>${citizens.map(c => `
                            <tr>
                                <td><strong>${c.citizen_name}</strong></td>
                                <td>${getTypeBadge(c.role)}</td>
                                <td>${c.charges || '-'}</td>
                                <td class="text-yellow font-mono">${c.fine_amount ? formatMoney(c.fine_amount) : '-'}</td>
                                <td class="text-red font-mono">${c.jail_time ? c.jail_time + ' mois' : '-'}</td>
                            </tr>
                        `).join('')}</tbody>
                    </table></div>
                `}
            </div>
        </div>

        ${i.status !== 'closed' && i.status !== 'archived' ? `
            <div style="display:flex; gap:8px;">
                <button class="btn btn-success" onclick="closeIncident(${i.id})"><i class="fas fa-check"></i> Clore le rapport</button>
                <button class="btn btn-ghost" onclick="changeIncidentStatus(${i.id},'under_investigation')"><i class="fas fa-magnifying-glass"></i> En cours d'enquete</button>
            </div>
        ` : ''}
    `;
}

function closeIncident(id) {
    sendNUI('updateIncident', { incidentId: id, title: state.incidentDetail.title, type: state.incidentDetail.type, location: state.incidentDetail.location, description: state.incidentDetail.description, evidence: state.incidentDetail.evidence, status: 'closed', priority: state.incidentDetail.priority });
}

function changeIncidentStatus(id, status) {
    const i = state.incidentDetail;
    sendNUI('updateIncident', { incidentId: id, title: i.title, type: i.type, location: i.location, description: i.description, evidence: i.evidence, status, priority: i.priority });
}

let incidentCitizens = [];

function openCreateIncidentModal() {
    incidentCitizens = [];
    openModal('Creer un Rapport', `
        <div class="form-group"><label>Titre du rapport</label><input class="form-control" id="incident-title" placeholder="Ex: Arrestation pour vol a main armee..."></div>
        <div class="form-row">
            <div class="form-group"><label>Type</label>
                <select class="form-control" id="incident-type">
                    <option value="arrest">Arrestation</option>
                    <option value="citation">Citation</option>
                    <option value="investigation">Enquete</option>
                    <option value="accident">Accident</option>
                    <option value="shooting">Fusillade</option>
                    <option value="robbery">Vol/Braquage</option>
                    <option value="other">Autre</option>
                </select>
            </div>
            <div class="form-group"><label>Priorite</label>
                <select class="form-control" id="incident-priority">
                    <option value="low">Basse</option>
                    <option value="normal" selected>Normale</option>
                    <option value="high">Haute</option>
                    <option value="critical">Critique</option>
                </select>
            </div>
        </div>
        <div class="form-group"><label>Lieu</label><input class="form-control" id="incident-location" placeholder="Adresse ou secteur..."></div>
        <div class="form-group"><label>Description / Narrative</label><textarea class="form-control" id="incident-desc" rows="5" placeholder="Description detaillee de l'incident et des actions entreprises..."></textarea></div>
        <div class="form-group"><label>Preuves</label><textarea class="form-control" id="incident-evidence" rows="2" placeholder="Liste des preuves collectees..."></textarea></div>

        <div style="border-top:1px solid var(--border); padding-top:14px; margin-top:14px;">
            <label class="text-sm" style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
                <span style="text-transform:uppercase; letter-spacing:0.5px; font-weight:600; color:var(--text-secondary);">PERSONNES IMPLIQUEES</span>
                <button class="btn btn-ghost btn-sm" onclick="addIncidentCitizen()"><i class="fas fa-plus"></i> Ajouter</button>
            </label>
            <div id="incident-citizens-list"></div>
        </div>
    `, `
        <button class="btn btn-ghost" onclick="closeModal()">Annuler</button>
        <button class="btn btn-primary" onclick="submitIncident()"><i class="fas fa-file-lines"></i> Creer le rapport</button>
    `);
}

function addIncidentCitizen() {
    incidentCitizens.push({ name: '', role: 'suspect', citizenId: '', charges: '', fine: 0, jail: 0 });
    renderIncidentCitizens();
}

function renderIncidentCitizens() {
    const el = document.getElementById('incident-citizens-list');
    if (!el) return;
    el.innerHTML = incidentCitizens.map((c, idx) => `
        <div style="background:var(--bg-tertiary); border-radius:var(--radius-md); padding:10px; margin-bottom:8px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <span class="text-sm font-bold">Personne #${idx + 1}</span>
                <button class="btn btn-ghost btn-sm" onclick="removeIncidentCitizen(${idx})" style="color:var(--danger);"><i class="fas fa-trash"></i></button>
            </div>
            <div class="form-row">
                <div class="form-group"><label>Nom</label><input class="form-control" value="${c.name}" onchange="incidentCitizens[${idx}].name=this.value" placeholder="Nom complet..."></div>
                <div class="form-group"><label>Role</label>
                    <select class="form-control" onchange="incidentCitizens[${idx}].role=this.value">
                        <option value="suspect" ${c.role === 'suspect' ? 'selected' : ''}>Suspect</option>
                        <option value="victim" ${c.role === 'victim' ? 'selected' : ''}>Victime</option>
                        <option value="witness" ${c.role === 'witness' ? 'selected' : ''}>Temoin</option>
                        <option value="officer" ${c.role === 'officer' ? 'selected' : ''}>Officier</option>
                    </select>
                </div>
            </div>
            <div class="form-group"><label>Charges</label><input class="form-control" value="${c.charges}" onchange="incidentCitizens[${idx}].charges=this.value" placeholder="Charges retenues..."></div>
            <div class="form-row">
                <div class="form-group"><label>Amende ($)</label><input class="form-control" type="number" value="${c.fine}" onchange="incidentCitizens[${idx}].fine=parseInt(this.value)||0"></div>
                <div class="form-group"><label>Prison (mois)</label><input class="form-control" type="number" value="${c.jail}" onchange="incidentCitizens[${idx}].jail=parseInt(this.value)||0"></div>
            </div>
        </div>
    `).join('');
}

function removeIncidentCitizen(idx) {
    incidentCitizens.splice(idx, 1);
    renderIncidentCitizens();
}

function submitIncident() {
    const data = {
        title: document.getElementById('incident-title')?.value || '',
        type: document.getElementById('incident-type')?.value || 'other',
        priority: document.getElementById('incident-priority')?.value || 'normal',
        location: document.getElementById('incident-location')?.value || '',
        description: document.getElementById('incident-desc')?.value || '',
        evidence: document.getElementById('incident-evidence')?.value || '',
        citizens: incidentCitizens,
    };
    if (!data.title || !data.description) { showToast('error', 'Titre et description requis'); return; }
    sendNUI('createIncident', data);
}

// ============================================
// PENAL CODE PAGE
// ============================================

function renderPenalCodePage() {
    const content = document.getElementById('mdt-content');
    content.innerHTML = `
        <div class="page-header">
            <div class="page-title">
                <div class="page-title-icon purple"><i class="fas fa-scale-balanced"></i></div>
                <div><h2>Code Penal</h2><p>Reference des infractions et peines</p></div>
            </div>
        </div>
        <div class="search-bar mb-4">
            <div class="search-input-wrapper">
                <i class="fas fa-search"></i>
                <input type="text" id="penal-search" placeholder="Rechercher une infraction..." oninput="filterPenalCode()">
            </div>
        </div>
        <div id="penal-code-list">
            ${penalCode.map((cat, catIdx) => `
                <div class="penal-category" data-category="${catIdx}">
                    <div class="penal-category-header expanded" style="border-left-color: ${cat.color};" onclick="togglePenalCategory(${catIdx})">
                        <h3 style="color: ${cat.color};">${cat.category}</h3>
                        <span class="badge" style="background: ${cat.color}20; color: ${cat.color};">${cat.offenses.length} infractions</span>
                        <i class="fas fa-chevron-down"></i>
                    </div>
                    <div class="penal-offenses" id="penal-cat-${catIdx}">
                        <div style="display:grid; grid-template-columns:60px 1fr 90px 80px; padding:8px 14px; background:var(--bg-tertiary); font-size:10px; font-weight:600; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px; border-bottom:1px solid var(--border);">
                            <span>Code</span><span>Infraction</span><span style="text-align:right;">Amende</span><span style="text-align:right;">Prison</span>
                        </div>
                        ${cat.offenses.map(o => `
                            <div class="penal-offense">
                                <span class="penal-code-num">${o.code}</span>
                                <div><div class="penal-offense-title">${o.title}</div><div class="penal-offense-desc">${o.description}</div></div>
                                <span class="penal-fine">${formatMoney(o.fine)}</span>
                                <span class="penal-jail">${o.jail > 0 ? o.jail + ' mois' : '-'}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function togglePenalCategory(idx) {
    const header = document.querySelector(`.penal-category[data-category="${idx}"] .penal-category-header`);
    const body = document.getElementById(`penal-cat-${idx}`);
    if (header && body) {
        header.classList.toggle('expanded');
        body.style.display = header.classList.contains('expanded') ? '' : 'none';
    }
}

function filterPenalCode() {
    const query = document.getElementById('penal-search')?.value?.toLowerCase() || '';
    document.querySelectorAll('.penal-offense').forEach(el => {
        const text = el.textContent.toLowerCase();
        el.style.display = text.includes(query) ? '' : 'none';
    });
}

// ============================================
// DISPATCH PAGE
// ============================================

function renderDispatchPage() {
    const content = document.getElementById('mdt-content');
    content.innerHTML = `
        <div class="page-header">
            <div class="page-title">
                <div class="page-title-icon cyan"><i class="fas fa-tower-broadcast"></i></div>
                <div><h2>Dispatch</h2><p>Centre d'appels et codes radio</p></div>
            </div>
            <div class="page-actions">
                <button class="btn btn-primary" onclick="openCreateCallModal()"><i class="fas fa-plus"></i> Nouvel Appel</button>
                <button class="btn btn-ghost" onclick="sendNUI('getDispatchCalls')"><i class="fas fa-rotate"></i> Actualiser</button>
            </div>
        </div>
        <div class="grid-2">
            <div>
                <h3 class="mb-2" style="font-size:14px; color:var(--text-primary);"><i class="fas fa-phone" style="color:var(--accent-blue);"></i> Appels actifs</h3>
                <div id="dispatch-calls-list"><div class="loading-spinner"><div class="spinner"></div></div></div>
            </div>
            <div>
                <h3 class="mb-2" style="font-size:14px; color:var(--text-primary);"><i class="fas fa-walkie-talkie" style="color:var(--accent-blue);"></i> Codes Radio</h3>
                <div class="card">
                    <div class="card-body" style="max-height:500px; overflow-y:auto;">
                        ${radioCodes.map(c => `
                            <div class="radio-code-item">
                                <span class="radio-code-num">${c.code}</span>
                                <span class="radio-code-desc">${c.description}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderDispatchCalls() {
    const el = document.getElementById('dispatch-calls-list');
    if (!el) return;

    if (state.dispatchCalls.length === 0) {
        el.innerHTML = '<div class="empty-state"><i class="fas fa-phone-slash"></i><h4>Aucun appel actif</h4><p>Le calme avant la tempete...</p></div>';
        return;
    }

    el.innerHTML = state.dispatchCalls.map(c => `
        <div class="dispatch-card priority-${c.priority}">
            <div class="dispatch-card-header">
                <span class="dispatch-card-type"><span class="priority-dot ${c.priority}"></span> #${c.id} - ${c.type || 'Appel'}</span>
                <span class="dispatch-card-time">${formatDate(c.created_at)}</span>
            </div>
            <div class="dispatch-card-location"><i class="fas fa-location-dot"></i> ${c.location}</div>
            <div class="dispatch-card-desc">${c.description}</div>
            <div class="dispatch-card-footer">
                <div>
                    <span class="text-sm text-muted"><i class="fas fa-phone"></i> ${c.caller_name || 'Anonyme'}</span>
                    ${c.assigned_units ? `<span class="text-sm" style="margin-left:10px;"><i class="fas fa-users" style="color:var(--accent-blue);"></i> ${c.assigned_units}</span>` : ''}
                </div>
                <div style="display:flex; gap:4px;">
                    ${getStatusBadge(c.status)}
                    ${c.status === 'pending' ? `<button class="btn btn-primary btn-sm" onclick="updateCall(${c.id},'dispatched')"><i class="fas fa-paper-plane"></i></button>` : ''}
                    ${c.status === 'dispatched' ? `<button class="btn btn-warning btn-sm" onclick="updateCall(${c.id},'responding')"><i class="fas fa-car"></i></button>` : ''}
                    ${c.status === 'responding' ? `<button class="btn btn-purple btn-sm" style="background:var(--purple);color:white;" onclick="updateCall(${c.id},'on_scene')"><i class="fas fa-location-dot"></i></button>` : ''}
                    ${c.status !== 'resolved' ? `<button class="btn btn-success btn-sm" onclick="updateCall(${c.id},'resolved')"><i class="fas fa-check"></i></button>` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

function updateCall(id, status) {
    sendNUI('updateCallStatus', { callId: id, status, units: '' });
}

function openCreateCallModal() {
    openModal('Creer un Appel', `
        <div class="form-row">
            <div class="form-group"><label>Appelant</label><input class="form-control" id="call-caller" placeholder="Nom de l'appelant..."></div>
            <div class="form-group"><label>Telephone</label><input class="form-control" id="call-phone" placeholder="Numero..."></div>
        </div>
        <div class="form-row">
            <div class="form-group"><label>Type</label>
                <select class="form-control" id="call-type">
                    <option value="general">General</option>
                    <option value="robbery">Vol/Braquage</option>
                    <option value="shooting">Fusillade</option>
                    <option value="accident">Accident</option>
                    <option value="domestic">Domestique</option>
                    <option value="suspicious">Activite suspecte</option>
                    <option value="medical">Medical</option>
                    <option value="fire">Incendie</option>
                </select>
            </div>
            <div class="form-group"><label>Priorite</label>
                <select class="form-control" id="call-priority">
                    <option value="low">Basse</option>
                    <option value="normal" selected>Normale</option>
                    <option value="high">Haute</option>
                    <option value="critical">Critique</option>
                </select>
            </div>
        </div>
        <div class="form-group"><label>Lieu</label><input class="form-control" id="call-location" placeholder="Adresse ou secteur..."></div>
        <div class="form-group"><label>Description</label><textarea class="form-control" id="call-desc" rows="3" placeholder="Details de l'appel..."></textarea></div>
    `, `
        <button class="btn btn-ghost" onclick="closeModal()">Annuler</button>
        <button class="btn btn-primary" onclick="submitCall()"><i class="fas fa-paper-plane"></i> Envoyer</button>
    `);
}

function submitCall() {
    const data = {
        callerName: document.getElementById('call-caller')?.value || 'Anonyme',
        phoneNumber: document.getElementById('call-phone')?.value || '',
        type: document.getElementById('call-type')?.value || 'general',
        priority: document.getElementById('call-priority')?.value || 'normal',
        location: document.getElementById('call-location')?.value || '',
        description: document.getElementById('call-desc')?.value || '',
    };
    if (!data.location || !data.description) { showToast('error', 'Lieu et description requis'); return; }
    sendNUI('createDispatchCall', data);
    closeModal();
}

// ============================================
// OFFICERS PAGE
// ============================================

function renderOfficersPage() {
    const content = document.getElementById('mdt-content');
    content.innerHTML = `
        <div class="page-header">
            <div class="page-title">
                <div class="page-title-icon green"><i class="fas fa-user-group"></i></div>
                <div><h2>Officiers en ligne</h2><p>Personnel actuellement en service</p></div>
            </div>
            <div class="page-actions">
                <button class="btn btn-ghost" onclick="sendNUI('getOnlineOfficers')"><i class="fas fa-rotate"></i> Actualiser</button>
            </div>
        </div>
        <div id="officers-list"><div class="loading-spinner"><div class="spinner"></div></div></div>
    `;
}

function renderOfficersList() {
    const el = document.getElementById('officers-list');
    if (!el) return;

    if (state.onlineOfficers.length === 0) {
        el.innerHTML = '<div class="empty-state"><i class="fas fa-user-group"></i><h4>Aucun officier en ligne</h4></div>';
        return;
    }

    el.innerHTML = `<div class="card"><div class="card-body no-padding"><div class="table-container"><table>
        <thead><tr><th>Indicatif</th><th>Nom</th><th>Rang</th><th>Badge</th><th>Departement</th></tr></thead>
        <tbody>
            ${state.onlineOfficers.map(o => `
                <tr>
                    <td class="font-mono text-blue font-bold">${o.callsign || 'N/A'}</td>
                    <td><strong>${o.name}</strong></td>
                    <td>${o.rank}</td>
                    <td class="font-mono">${o.badge || 'N/A'}</td>
                    <td><span class="badge badge-blue">${o.department}</span></td>
                </tr>
            `).join('')}
        </tbody>
    </table></div></div></div>`;
}

// ============================================
// PROFILE PAGE
// ============================================

function renderProfilePage() {
    const content = document.getElementById('mdt-content');
    const o = state.officer || {};

    content.innerHTML = `
        <div class="page-header">
            <div class="page-title">
                <div class="page-title-icon blue"><i class="fas fa-id-card"></i></div>
                <div><h2>Mon Profil</h2><p>Informations personnelles et parametres</p></div>
            </div>
        </div>

        <div class="officer-profile-card">
            <div class="officer-avatar-large"><i class="fas fa-user-shield"></i></div>
            <div style="flex:1;">
                <h2 style="font-size:22px; font-weight:700; margin-bottom:4px;">${o.name || 'Officier'}</h2>
                <p style="color:var(--accent-blue-light); font-size:13px; margin-bottom:12px;">${o.rank || 'Officier'} - ${o.department || 'LSPD'}</p>
                <div class="profile-details">
                    <div class="profile-detail"><span class="profile-detail-label">Badge</span><span class="profile-detail-value font-mono">${o.badge_number || 'Non defini'}</span></div>
                    <div class="profile-detail"><span class="profile-detail-label">Indicatif</span><span class="profile-detail-value font-mono">${o.callsign || 'Non defini'}</span></div>
                    <div class="profile-detail"><span class="profile-detail-label">Telephone</span><span class="profile-detail-value font-mono">${o.phone || 'Non defini'}</span></div>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card-header"><h3><i class="fas fa-pen"></i> Modifier le profil</h3></div>
            <div class="card-body">
                <div class="form-row-3">
                    <div class="form-group"><label>Indicatif radio</label><input class="form-control" id="profile-callsign" value="${o.callsign || ''}" placeholder="Ex: L-12"></div>
                    <div class="form-group"><label>Numero de badge</label><input class="form-control" id="profile-badge" value="${o.badge_number || ''}" placeholder="Ex: 4521"></div>
                    <div class="form-group"><label>Telephone</label><input class="form-control" id="profile-phone" value="${o.phone || ''}" placeholder="Ex: 555-0123"></div>
                </div>
                <div class="form-group"><label>URL Photo de profil</label><input class="form-control" id="profile-image" value="${o.image_url || ''}" placeholder="https://..."></div>
                <button class="btn btn-primary mt-2" onclick="saveProfile()"><i class="fas fa-save"></i> Sauvegarder</button>
            </div>
        </div>
    `;
}

function saveProfile() {
    sendNUI('updateOfficerProfile', {
        callsign: document.getElementById('profile-callsign')?.value || '',
        badgeNumber: document.getElementById('profile-badge')?.value || '',
        phone: document.getElementById('profile-phone')?.value || '',
        imageUrl: document.getElementById('profile-image')?.value || '',
    });
}

// ============================================
// EVENT LISTENERS
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Navigation clicks
    document.querySelectorAll('.nav-item[data-page]').forEach(item => {
        item.addEventListener('click', () => navigate(item.dataset.page));
    });

    // Close button
    document.getElementById('btn-close-mdt')?.addEventListener('click', closeMDT);

    // Modal close on overlay click
    document.getElementById('modal-overlay')?.addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeModal();
    });

    // ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modal = document.getElementById('modal-overlay');
            if (!modal.classList.contains('hidden')) {
                closeModal();
            } else {
                closeMDT();
            }
        }
    });
});
