// UI Management Module for MDT

const UI = {
    /**
     * Initialize the UI
     */
    init: function() {
        this.setupEventListeners();
        this.loadTabs();
    },

    /**
     * Setup event listeners
     */
    setupEventListeners: function() {
        const closeBtn = document.getElementById('close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.close();
            });
        }

        // Search Citizen Form
        const searchCitizenForm = document.getElementById('search-citizen-form');
        if (searchCitizenForm) {
            searchCitizenForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const firstname = document.getElementById('citizen-firstname').value;
                const lastname = document.getElementById('citizen-lastname').value;
                API.searchCitizen(firstname, lastname);
            });
        }

        // Search Vehicle Form
        const searchVehicleForm = document.getElementById('search-vehicle-form');
        if (searchVehicleForm) {
            searchVehicleForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const plate = document.getElementById('vehicle-plate').value;
                API.searchVehicle(plate);
            });
        }

        // Citation Form
        const citationForm = document.getElementById('citation-form');
        if (citationForm) {
            citationForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const citizenId = document.getElementById('citation-citizen-id').value;
                const type = document.getElementById('citation-type').value;
                const description = document.getElementById('citation-description').value;
                const amount = document.getElementById('citation-amount').value;
                API.addCitation(citizenId, type, description, amount);
                citationForm.reset();
            });
        }

        // Report Form
        const reportForm = document.getElementById('report-form');
        if (reportForm) {
            reportForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const type = document.getElementById('report-type').value;
                const description = document.getElementById('report-description').value;
                const location = document.getElementById('report-location').value;
                API.addReport(type, description, location);
                reportForm.reset();
            });
        }

        // Call Log Form
        const callLogForm = document.getElementById('call-log-form');
        if (callLogForm) {
            callLogForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const type = document.getElementById('call-type').value;
                const location = document.getElementById('call-location').value;
                const description = document.getElementById('call-description').value;
                API.addCallLog(type, location, description);
                callLogForm.reset();
            });
        }

        // Wanted Form
        const wantedForm = document.getElementById('wanted-form');
        if (wantedForm) {
            wantedForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const citizenId = document.getElementById('wanted-citizen-id').value;
                const reason = document.getElementById('wanted-reason').value;
                const type = document.getElementById('wanted-type').value;
                API.addWanted(citizenId, reason, type);
                wantedForm.reset();
            });
        }

        // Employees Form
        const employeesForm = document.getElementById('employees-form');
        if (employeesForm) {
            employeesForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const employeeId = document.getElementById('employee-id').value;
                const grade = document.getElementById('employee-grade').value;
                // Will be handled in main.js with proper checks
                console.log('Change grade:', employeeId, grade);
            });
        }
    },

    /**
     * Load tabs from config
     */
    loadTabs: function() {
        const tabsList = document.getElementById('tabs-list');
        if (!tabsList) return;

        // In a real scenario, tabs would come from the server/config
        // For now, we'll create them based on HTML structure
        const tabs = document.querySelectorAll('.tab-content');

        tabs.forEach((tab, index) => {
            const tabId = tab.getAttribute('data-tab');
            const tabTitle = tab.querySelector('.tab-title h2')?.textContent || 'Tab';

            const tabBtn = document.createElement('button');
            tabBtn.className = 'tab-btn' + (index === 0 ? ' active' : '');
            tabBtn.textContent = tabTitle;
            tabBtn.addEventListener('click', () => {
                this.switchTab(tabId);
            });

            tabsList.appendChild(tabBtn);
        });

        // Activate first tab
        if (tabs.length > 0) {
            tabs[0].classList.add('active');
        }
    },

    /**
     * Switch to a different tab
     * @param {string} tabId
     */
    switchTab: function(tabId) {
        // Remove active class from all tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });

        // Remove active class from all buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Activate the selected tab
        const tab = document.getElementById(tabId);
        if (tab) {
            tab.classList.add('active');
        }

        // Activate the corresponding button
        const buttons = document.querySelectorAll('.tab-btn');
        buttons.forEach(btn => {
            if (btn.textContent.toLowerCase().includes(tabId.replace('_', ' '))) {
                btn.classList.add('active');
            }
        });

        // Load data for specific tabs
        if (tabId === 'wanted') {
            API.getData('wanted');
        } else if (tabId === 'call_logs') {
            API.getData('call_logs');
        }
    },

    /**
     * Show a notification
     * @param {string} title
     * @param {string} message
     * @param {string} type
     */
    notification: function(title, message, type = 'info') {
        const container = document.getElementById('notification-container');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;

        const iconMap = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        notification.innerHTML = `
            <i class="fas ${iconMap[type]} notification-icon"></i>
            <div class="notification-content">
                <div class="notification-title">${title}</div>
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        container.appendChild(notification);

        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.remove();
        });

        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
    },

    /**
     * Display citizen info
     * @param {object} citizenInfo
     */
    displayCitizenInfo: function(citizenInfo) {
        if (!citizenInfo) {
            this.notification('Erreur', 'Citoyen non trouvé', 'error');
            return;
        }

        const resultsContainer = document.getElementById('citizen-results');
        if (!resultsContainer) return;

        resultsContainer.innerHTML = '';

        const card = document.createElement('div');
        card.className = 'result-card';
        card.innerHTML = `
            <div class="result-card-header">
                <div class="result-card-title">${citizenInfo.firstname} ${citizenInfo.lastname}</div>
                <div class="result-card-badge">Citoyen</div>
            </div>
            <div class="result-card-body">
                <div class="result-card-row">
                    <label>ID</label>
                    <span>${citizenInfo.identifier}</span>
                </div>
                <div class="result-card-row">
                    <label>Date de naissance</label>
                    <span>${citizenInfo.dateofbirth || 'N/A'}</span>
                </div>
                <div class="result-card-row">
                    <label>Sexe</label>
                    <span>${citizenInfo.sex || 'N/A'}</span>
                </div>
                <div class="result-card-row">
                    <label>Téléphone</label>
                    <span>${citizenInfo.phone_number || 'N/A'}</span>
                </div>
            </div>
        `;

        resultsContainer.appendChild(card);
    },

    /**
     * Display vehicle info
     * @param {object} vehicleInfo
     */
    displayVehicleInfo: function(vehicleInfo) {
        if (!vehicleInfo) {
            this.notification('Erreur', 'Véhicule non trouvé', 'error');
            return;
        }

        const resultsContainer = document.getElementById('vehicle-results');
        if (!resultsContainer) return;

        resultsContainer.innerHTML = '';

        const card = document.createElement('div');
        card.className = 'result-card';
        card.innerHTML = `
            <div class="result-card-header">
                <div class="result-card-title">${vehicleInfo.plate}</div>
                <div class="result-card-badge">Véhicule</div>
            </div>
            <div class="result-card-body">
                <div class="result-card-row">
                    <label>Propriétaire</label>
                    <span>${vehicleInfo.owner || 'N/A'}</span>
                </div>
                <div class="result-card-row">
                    <label>Model</label>
                    <span>${vehicleInfo.model || 'N/A'}</span>
                </div>
                <div class="result-card-row">
                    <label>État</label>
                    <span>${vehicleInfo.state || 'N/A'}</span>
                </div>
            </div>
        `;

        resultsContainer.appendChild(card);
    },

    /**
     * Set player info in header
     * @param {string} name
     * @param {string} grade
     */
    setPlayerInfo: function(name, grade) {
        const nameElement = document.getElementById('officer-name');
        const gradeElement = document.getElementById('officer-grade');

        if (nameElement) nameElement.textContent = name;
        if (gradeElement) gradeElement.textContent = grade;
    },

    /**
     * Toggle MDT visibility
     * @param {boolean} visible
     */
    toggle: function(visible) {
        const container = document.getElementById('mdt-container');
        if (!container) return;

        if (visible) {
            container.classList.remove('mdt-hidden');
        } else {
            container.classList.add('mdt-hidden');
        }
    },

    /**
     * Close the MDT
     */
    close: function() {
        this.toggle(false);
        API.close();
    }
};

// Expose UI to global scope
window.UI = UI;
