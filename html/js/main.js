// Main MDT Script

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    UI.init();
    setupNUICallbacks();
});

/**
 * Setup NUI Callbacks from the FiveM client
 */
function setupNUICallbacks() {
    // Handle MDT toggle
    window.addEventListener('message', function(event) {
        if (event.data.type === 'toggleMDT') {
            UI.toggle(event.data.open);
            if (event.data.open) {
                UI.setPlayerInfo(
                    event.data.playerName,
                    event.data.playerGrade
                );
            }
        }

        // Handle notifications
        else if (event.data.type === 'notification') {
            UI.notification(
                event.data.title,
                event.data.message,
                event.data.notificationType
            );
        }

        // Handle citizen info received
        else if (event.data.type === 'citizenInfoReceived') {
            UI.displayCitizenInfo(event.data.data);
            if (event.data.data) {
                UI.notification('Succès', 'Citoyen trouvé', 'success');
            }
        }

        // Handle vehicle info received
        else if (event.data.type === 'vehicleInfoReceived') {
            UI.displayVehicleInfo(event.data.data);
            if (event.data.data) {
                UI.notification('Succès', 'Véhicule trouvé', 'success');
            }
        }

        // Handle citations
        else if (event.data.type === 'citationAdded') {
            UI.notification('Succès', 'Citation créée avec l\'ID: ' + event.data.id, 'success');
        }

        // Handle wanted
        else if (event.data.type === 'wantedAdded') {
            UI.notification('Succès', 'Avis de recherche créé avec l\'ID: ' + event.data.id, 'success');
        }

        // Handle reports
        else if (event.data.type === 'reportAdded') {
            UI.notification('Succès', 'Rapport créé avec l\'ID: ' + event.data.id, 'success');
        }

        // Handle call logs
        else if (event.data.type === 'callLogAdded') {
            UI.notification('Succès', 'Log d\'appel créé', 'success');
        }

        // Handle wanted list update
        else if (event.data.type === 'updateWantedList') {
            UI.notification('Info', 'Liste des avis actualisée', 'info');
        }

        // Handle call logs update
        else if (event.data.type === 'updateCallLogs') {
            UI.notification('Info', 'Logs d\'appels actualisés', 'info');
        }

        // Handle data received
        else if (event.data.type === 'dataReceived') {
            handleDataReceived(event.data.dataType, event.data.data);
        }
    });
}

/**
 * Handle data received from server
 * @param {string} dataType
 * @param {array} data
 */
function handleDataReceived(dataType, data) {
    if (dataType === 'wanted') {
        displayWantedList(data);
    } else if (dataType === 'call_logs') {
        displayCallLogs(data);
    }
}

/**
 * Display wanted list
 * @param {array} wantedList
 */
function displayWantedList(wantedList) {
    const container = document.getElementById('wanted-list');
    if (!container) return;

    container.innerHTML = '';

    if (!wantedList || wantedList.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-database"></i>
                <p>Aucun avis de recherche actif</p>
            </div>
        `;
        return;
    }

    wantedList.forEach(wanted => {
        const card = document.createElement('div');
        card.className = 'result-card';
        card.innerHTML = `
            <div class="result-card-header">
                <div class="result-card-title">ID Citoyen: ${wanted.citizen_id}</div>
                <div class="result-card-badge">${wanted.warrant_type}</div>
            </div>
            <div class="result-card-body">
                <div class="result-card-row">
                    <label>Motif</label>
                    <span>${wanted.reason}</span>
                </div>
                <div class="result-card-row">
                    <label>Créé par</label>
                    <span>Agent #${wanted.created_by}</span>
                </div>
                <div class="result-card-row">
                    <label>Date</label>
                    <span>${new Date(wanted.created_at).toLocaleDateString('fr-FR')}</span>
                </div>
                <div class="result-card-row">
                    <label>Statut</label>
                    <span>${wanted.status}</span>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

/**
 * Display call logs
 * @param {array} callLogs
 */
function displayCallLogs(callLogs) {
    const container = document.getElementById('call-logs-list');
    if (!container) return;

    container.innerHTML = '';

    if (!callLogs || callLogs.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-phone-slash"></i>
                <p>Aucun log d'appel</p>
            </div>
        `;
        return;
    }

    callLogs.forEach(log => {
        const card = document.createElement('div');
        card.className = 'result-card';
        card.innerHTML = `
            <div class="result-card-header">
                <div class="result-card-title">${log.call_type}</div>
                <div class="result-card-badge">${log.location}</div>
            </div>
            <div class="result-card-body">
                <div class="result-card-row">
                    <label>Description</label>
                    <span>${log.description}</span>
                </div>
                <div class="result-card-row">
                    <label>Dispatch par</label>
                    <span>Agent #${log.dispatch_by || 'N/A'}</span>
                </div>
                <div class="result-card-row">
                    <label>Agents assignés</label>
                    <span>${log.officers_assigned || 'Aucun'}</span>
                </div>
                <div class="result-card-row">
                    <label>Créé à</label>
                    <span>${new Date(log.created_at).toLocaleDateString('fr-FR')}</span>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// Keyboard handler for ESC key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const container = document.getElementById('mdt-container');
        if (container && !container.classList.contains('mdt-hidden')) {
            UI.close();
        }
    }
});

console.log('MDT Main Script Loaded');
