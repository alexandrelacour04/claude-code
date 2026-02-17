/* ============================================================
   esx_weaponcraft - NUI Script
   ============================================================ */

let currentMenu = null;
let progressTimer = null;

// ============================================================
// NUI MESSAGE HANDLER
// ============================================================
window.addEventListener('message', function(event) {
    const data = event.data;

    switch (data.action) {
        case 'notification':
            showNotification(data.message, data.type);
            break;
        case 'progressBar':
            showProgressBar(data.duration, data.label);
            break;
        case 'openCraftMenu':
            openCraftMenu(data.recipes, data.type, data.title);
            break;
        case 'openSellMenu':
            openSellMenu(data.weapons, data.prices);
            break;
        case 'openVehicleMenu':
            openVehicleMenu(data.vehicles);
            break;
        case 'openBossMenu':
            openBossMenu(data);
            break;
        case 'updateBossData':
            updateBossData(data);
            break;
        case 'openAutoSell':
            openAutoSell(data.stock, data.isEmployee, data.prices);
            break;
        case 'openF6Menu':
            openF6Menu(data.nearbyPlayers, data.jobLabel, data.gradeLabel);
            break;
    }
});

// ============================================================
// CLOSE MENU
// ============================================================
function closeMenu() {
    document.getElementById('menu-container').classList.add('hidden');
    document.getElementById('tab-nav').classList.add('hidden');
    currentMenu = null;
    fetch('https://esx_weaponcraft/closeMenu', { method: 'POST', body: JSON.stringify({}) });
}

// ESC key to close
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && currentMenu) {
        closeMenu();
    }
});

// ============================================================
// NOTIFICATIONS
// ============================================================
function showNotification(message, type) {
    const container = document.getElementById('notification-container');
    const notif = document.createElement('div');
    notif.className = `notification ${type || 'info'}`;
    notif.textContent = message;
    container.appendChild(notif);

    setTimeout(() => {
        notif.classList.add('notification-exit');
        setTimeout(() => notif.remove(), 300);
    }, 4000);
}

// ============================================================
// PROGRESS BAR
// ============================================================
function showProgressBar(duration, label) {
    const container = document.getElementById('progress-container');
    const fill = document.getElementById('progress-fill');
    const percentEl = document.getElementById('progress-percent');
    const labelEl = document.getElementById('progress-label');

    labelEl.textContent = label || 'En cours...';
    fill.style.width = '0%';
    percentEl.textContent = '0%';
    container.classList.remove('hidden');

    if (progressTimer) clearInterval(progressTimer);

    const startTime = Date.now();
    progressTimer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const percent = Math.min((elapsed / duration) * 100, 100);
        fill.style.width = percent + '%';
        percentEl.textContent = Math.floor(percent) + '%';

        if (percent >= 100) {
            clearInterval(progressTimer);
            progressTimer = null;
            setTimeout(() => {
                container.classList.add('hidden');
            }, 500);
        }
    }, 50);
}

// ============================================================
// CRAFT MENU
// ============================================================
function openCraftMenu(recipes, type, title) {
    currentMenu = 'craft';
    const container = document.getElementById('menu-container');
    const content = document.getElementById('menu-content');
    const titleEl = document.getElementById('menu-title');
    const tabNav = document.getElementById('tab-nav');

    titleEl.textContent = title || 'FABRICATION';
    tabNav.classList.add('hidden');
    container.classList.remove('hidden');

    // Group by category
    const categories = {};
    recipes.forEach(recipe => {
        const cat = recipe.category || 'Autres';
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(recipe);
    });

    let html = '';
    for (const [catName, items] of Object.entries(categories)) {
        html += `<div class="category-title">${catName}</div>`;
        items.forEach(recipe => {
            const timeStr = (recipe.time / 1000).toFixed(0) + 's';
            html += `
                <div class="item-card" onclick="craftItem('${recipe.name}', '${type}')">
                    <div class="item-card-header">
                        <span class="item-name">${recipe.label}</span>
                        <span class="craft-time">${timeStr}</span>
                    </div>
                    <div class="item-ingredients">
                        ${recipe.ingredients.map(ing =>
                            `<span class="ingredient-tag">
                                <span class="ingredient-count">${ing.count}x</span> ${ing.label}
                            </span>`
                        ).join('')}
                    </div>
                </div>
            `;
        });
    }

    content.innerHTML = html;
}

function craftItem(recipeName, craftType) {
    fetch('https://esx_weaponcraft/craftItem', {
        method: 'POST',
        body: JSON.stringify({ recipeName, craftType })
    });
}

// ============================================================
// SELL MENU
// ============================================================
function openSellMenu(weapons, prices) {
    currentMenu = 'sell';
    const container = document.getElementById('menu-container');
    const content = document.getElementById('menu-content');
    const titleEl = document.getElementById('menu-title');
    const tabNav = document.getElementById('tab-nav');

    titleEl.textContent = 'VENTE - AMMUNATION';
    tabNav.classList.add('hidden');
    container.classList.remove('hidden');

    if (!weapons || weapons.length === 0) {
        content.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">&#128722;</div>
                <div class="empty-state-text">Aucune arme a vendre</div>
            </div>
        `;
        return;
    }

    let html = '';
    weapons.forEach(w => {
        html += `
            <div class="sell-card">
                <div class="sell-card-info">
                    <div class="sell-card-name">${w.label}</div>
                    ${w.count ? `<div class="sell-card-count">Quantite: ${w.count}</div>` : ''}
                </div>
                <span class="sell-card-price">$${(w.price || 0).toLocaleString()}</span>
                <button class="sell-btn" onclick="sellWeapon('${w.name}')">Vendre</button>
            </div>
        `;
    });

    content.innerHTML = html;
}

function sellWeapon(weaponName) {
    fetch('https://esx_weaponcraft/sellWeapon', {
        method: 'POST',
        body: JSON.stringify({ weaponName })
    });
    closeMenu();
}

// ============================================================
// VEHICLE MENU
// ============================================================
function openVehicleMenu(vehicles) {
    currentMenu = 'vehicle';
    const container = document.getElementById('menu-container');
    const content = document.getElementById('menu-content');
    const titleEl = document.getElementById('menu-title');
    const tabNav = document.getElementById('tab-nav');

    titleEl.textContent = 'SORTIE VEHICULE';
    tabNav.classList.add('hidden');
    container.classList.remove('hidden');

    let html = '';
    vehicles.forEach(v => {
        html += `
            <div class="vehicle-card" onclick="spawnVehicle('${v.model}')">
                <div class="vehicle-icon">&#128663;</div>
                <div>
                    <div class="vehicle-name">${v.label}</div>
                    <div class="vehicle-model">${v.model}</div>
                </div>
            </div>
        `;
    });

    content.innerHTML = html;
}

function spawnVehicle(model) {
    fetch('https://esx_weaponcraft/spawnVehicle', {
        method: 'POST',
        body: JSON.stringify({ model })
    });
}

// ============================================================
// BOSS MENU
// ============================================================
let bossData = {};

function openBossMenu(data) {
    currentMenu = 'boss';
    bossData = data;

    const container = document.getElementById('menu-container');
    const titleEl = document.getElementById('menu-title');
    const tabNav = document.getElementById('tab-nav');

    titleEl.textContent = 'GESTION PATRON';
    tabNav.classList.remove('hidden');
    container.classList.remove('hidden');

    // Setup tabs
    const tabs = tabNav.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.onclick = () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderBossTab(tab.dataset.tab);
        };
    });

    renderBossTab('employees');
}

function updateBossData(data) {
    if (data.employees) bossData.employees = data.employees;
    if (data.prices) bossData.prices = data.prices;
    if (data.society !== undefined) bossData.society = data.society;
}

function renderBossTab(tab) {
    const content = document.getElementById('menu-content');
    const grades = bossData.grades || [];

    switch (tab) {
        case 'employees':
            renderEmployeesTab(content, grades);
            break;
        case 'hire':
            renderHireTab(content);
            break;
        case 'prices':
            renderPricesTab(content);
            break;
        case 'salaries':
            renderSalariesTab(content, grades);
            break;
        case 'treasury':
            renderTreasuryTab(content);
            break;
    }
}

function renderEmployeesTab(content, grades) {
    const employees = bossData.employees || [];
    if (employees.length === 0) {
        content.innerHTML = '<div class="empty-state"><div class="empty-state-text">Aucun employe</div></div>';
        return;
    }

    let html = '<div class="category-title">Employes (' + employees.length + ')</div>';
    employees.forEach(emp => {
        const gradeName = grades[emp.job_grade] ? grades[emp.job_grade].label : 'Grade ' + emp.job_grade;
        html += `
            <div class="employee-row">
                <div class="employee-info">
                    <div class="employee-name">${emp.firstname} ${emp.lastname}</div>
                    <div class="employee-grade">${gradeName}</div>
                </div>
                <div class="employee-actions">
                    <button class="small-btn promote" onclick="bossAction('promote', '${emp.identifier}')">Promouvoir</button>
                    <button class="small-btn demote" onclick="bossAction('demote', '${emp.identifier}')">Retrograder</button>
                    <button class="small-btn fire" onclick="bossAction('fire', '${emp.identifier}')">Licencier</button>
                </div>
            </div>
        `;
    });
    content.innerHTML = html;
}

function renderHireTab(content) {
    const nearby = bossData.nearbyPlayers || [];
    let html = '<div class="category-title">Joueurs a proximite</div>';

    if (nearby.length === 0) {
        html += '<div class="empty-state"><div class="empty-state-text">Aucun joueur a proximite</div></div>';
    } else {
        nearby.forEach(p => {
            html += `
                <div class="player-select-card" onclick="bossAction('hire', ${p.id})">
                    <span class="player-id">ID ${p.id}</span>
                    <span class="player-name-label">${p.name}</span>
                </div>
            `;
        });
    }

    content.innerHTML = html;
}

function renderPricesTab(content) {
    const prices = bossData.prices || {};
    let html = '<div class="category-title">Prix de vente</div>';

    for (const [item, price] of Object.entries(prices)) {
        const displayName = item.replace('WEAPON_', '').replace('ammo_', 'Munitions ');
        html += `
            <div class="input-group">
                <label>${displayName}</label>
                <input type="number" class="input-field" id="price-${item}" value="${price}" min="0" step="100">
                <button class="small-btn promote" onclick="setPrice('${item}')">Sauver</button>
            </div>
        `;
    }

    content.innerHTML = html;
}

function renderSalariesTab(content, grades) {
    let html = '<div class="category-title">Salaires par grade</div>';

    grades.forEach((grade, index) => {
        html += `
            <div class="input-group">
                <label>${grade.label}</label>
                <input type="number" class="input-field" id="salary-${index}" value="${grade.salary}" min="0" step="50">
                <button class="small-btn promote" onclick="setSalary(${index})">Sauver</button>
            </div>
        `;
    });

    content.innerHTML = html;
}

function renderTreasuryTab(content) {
    const society = bossData.society || 0;
    let html = `
        <div class="treasury-display">
            <div class="treasury-amount">$${society.toLocaleString()}</div>
            <div class="treasury-label">Caisse de la societe</div>
        </div>
        <div class="treasury-actions">
            <div style="flex:1">
                <div class="input-group">
                    <input type="number" class="input-field" id="withdraw-amount" placeholder="Montant a retirer" min="0">
                </div>
                <button class="action-btn danger" onclick="bossWithdraw()">Retirer</button>
            </div>
            <div style="flex:1">
                <div class="input-group">
                    <input type="number" class="input-field" id="deposit-amount" placeholder="Montant a deposer" min="0">
                </div>
                <button class="action-btn success" onclick="bossDeposit()">Deposer</button>
            </div>
        </div>
    `;
    content.innerHTML = html;
}

function bossAction(action, targetId) {
    fetch(`https://esx_weaponcraft/boss:${action}`, {
        method: 'POST',
        body: JSON.stringify({ playerId: targetId })
    });
}

function setPrice(itemName) {
    const input = document.getElementById('price-' + itemName);
    const price = parseInt(input.value);
    if (isNaN(price) || price < 0) return;
    fetch('https://esx_weaponcraft/boss:setPrice', {
        method: 'POST',
        body: JSON.stringify({ itemName, price })
    });
}

function setSalary(grade) {
    const input = document.getElementById('salary-' + grade);
    const salary = parseInt(input.value);
    if (isNaN(salary) || salary < 0) return;
    fetch('https://esx_weaponcraft/boss:setSalary', {
        method: 'POST',
        body: JSON.stringify({ grade, salary })
    });
}

function bossWithdraw() {
    const input = document.getElementById('withdraw-amount');
    const amount = parseInt(input.value);
    if (isNaN(amount) || amount <= 0) return;
    fetch('https://esx_weaponcraft/boss:withdraw', {
        method: 'POST',
        body: JSON.stringify({ amount })
    });
}

function bossDeposit() {
    const input = document.getElementById('deposit-amount');
    const amount = parseInt(input.value);
    if (isNaN(amount) || amount <= 0) return;
    fetch('https://esx_weaponcraft/boss:deposit', {
        method: 'POST',
        body: JSON.stringify({ amount })
    });
}

// ============================================================
// AUTO SELL
// ============================================================
function openAutoSell(stock, isEmployee, prices) {
    currentMenu = 'autosell';
    const container = document.getElementById('menu-container');
    const content = document.getElementById('menu-content');
    const titleEl = document.getElementById('menu-title');
    const tabNav = document.getElementById('tab-nav');

    titleEl.textContent = isEmployee ? 'GESTION STOCK' : 'BOUTIQUE D\'ARMES';
    tabNav.classList.add('hidden');
    container.classList.remove('hidden');

    let html = '';

    if (isEmployee) {
        // Employee view: stock items
        html += '<div class="category-title">Stock actuel</div>';

        const allItems = Object.keys(prices || {});
        if (allItems.length === 0) {
            html += '<div class="empty-state"><div class="empty-state-text">Aucun article configure</div></div>';
        } else {
            allItems.forEach(item => {
                const qty = (stock && stock[item]) || 0;
                const maxStock = 50;
                const percent = (qty / maxStock) * 100;
                const barClass = percent > 60 ? 'high' : percent > 25 ? 'medium' : 'low';
                const displayName = item.replace('WEAPON_', '').replace('ammo_', 'Munitions ');

                html += `
                    <div class="item-card">
                        <div class="item-card-header">
                            <span class="item-name">${displayName}</span>
                            <button class="stock-btn" onclick="stockItem('${item}')">+ Stocker</button>
                        </div>
                        <div class="stock-bar">
                            <div class="stock-fill ${barClass}" style="width: ${percent}%"></div>
                        </div>
                        <div class="stock-text">${qty} / ${maxStock}</div>
                    </div>
                `;
            });
        }
    } else {
        // Customer view: buy items
        html += '<div class="category-title">Articles disponibles</div>';

        let hasItems = false;
        if (stock) {
            for (const [item, qty] of Object.entries(stock)) {
                if (qty > 0) {
                    hasItems = true;
                    const price = (prices && prices[item]) || 0;
                    const displayName = item.replace('WEAPON_', '').replace('ammo_', 'Munitions ');

                    html += `
                        <div class="buy-card">
                            <div class="sell-card-info">
                                <div class="sell-card-name">${displayName}</div>
                                <div class="sell-card-count">Stock: ${qty}</div>
                            </div>
                            <span class="sell-card-price">$${price.toLocaleString()}</span>
                            <button class="buy-btn" onclick="buyFromAutoSell('${item}')">Acheter</button>
                        </div>
                    `;
                }
            }
        }

        if (!hasItems) {
            html += '<div class="empty-state"><div class="empty-state-text">Aucun article en stock</div></div>';
        }
    }

    content.innerHTML = html;
}

function stockItem(itemName) {
    fetch('https://esx_weaponcraft/stockItem', {
        method: 'POST',
        body: JSON.stringify({ itemName, amount: 1 })
    });
    closeMenu();
}

function buyFromAutoSell(itemName) {
    fetch('https://esx_weaponcraft/buyFromAutoSell', {
        method: 'POST',
        body: JSON.stringify({ itemName })
    });
}

// ============================================================
// F6 MENU
// ============================================================
let selectedF6Player = null;

function openF6Menu(nearbyPlayers, jobLabel, gradeLabel) {
    currentMenu = 'f6';
    selectedF6Player = null;

    const container = document.getElementById('menu-container');
    const content = document.getElementById('menu-content');
    const titleEl = document.getElementById('menu-title');
    const tabNav = document.getElementById('tab-nav');

    titleEl.textContent = `${jobLabel || 'ARMURIER'} - ${gradeLabel || ''}`;
    tabNav.classList.add('hidden');
    container.classList.remove('hidden');

    let html = '';

    // Player selection
    html += `
        <div class="f6-section">
            <div class="f6-section-title">Joueur cible</div>
            <div id="f6-player-list">
    `;

    if (!nearbyPlayers || nearbyPlayers.length === 0) {
        html += '<div class="empty-state"><div class="empty-state-text">Aucun joueur a proximite</div></div>';
    } else {
        nearbyPlayers.forEach(p => {
            html += `
                <div class="player-select-card" id="f6-player-${p.id}" onclick="selectF6Player(${p.id}, '${p.name}')">
                    <span class="player-id">ID ${p.id}</span>
                    <span class="player-name-label">${p.name}</span>
                </div>
            `;
        });
    }

    html += `
            </div>
        </div>
    `;

    // Invoice section
    html += `
        <div class="f6-section">
            <div class="f6-section-title">Facture</div>
            <div class="input-group">
                <label>Montant ($)</label>
                <input type="number" class="input-field" id="f6-invoice-amount" placeholder="Montant" min="1">
            </div>
            <div class="input-group">
                <label>Raison</label>
                <input type="text" class="input-field" id="f6-invoice-reason" placeholder="Raison de la facture">
            </div>
            <button class="action-btn info" onclick="sendInvoice()">Envoyer la facture</button>
        </div>
    `;

    // PPA section
    html += `
        <div class="f6-section">
            <div class="f6-section-title">Permis de Port d'Arme (PPA)</div>
            <div style="display: flex; gap: 10px;">
                <button class="action-btn success" onclick="givePPA()" style="flex:1">Donner le PPA</button>
                <button class="action-btn danger" onclick="removePPA()" style="flex:1">Retirer le PPA</button>
            </div>
        </div>
    `;

    content.innerHTML = html;
}

function selectF6Player(id, name) {
    // Deselect previous
    document.querySelectorAll('.player-select-card').forEach(el => el.classList.remove('selected'));
    // Select new
    const card = document.getElementById('f6-player-' + id);
    if (card) card.classList.add('selected');
    selectedF6Player = id;
}

function sendInvoice() {
    if (!selectedF6Player) {
        showNotification('Selectionnez un joueur !', 'error');
        return;
    }
    const amount = parseInt(document.getElementById('f6-invoice-amount').value);
    const reason = document.getElementById('f6-invoice-reason').value || 'Facture';

    if (isNaN(amount) || amount <= 0) {
        showNotification('Montant invalide !', 'error');
        return;
    }

    fetch('https://esx_weaponcraft/f6:invoice', {
        method: 'POST',
        body: JSON.stringify({ playerId: selectedF6Player, amount, reason })
    });
    closeMenu();
}

function givePPA() {
    if (!selectedF6Player) {
        showNotification('Selectionnez un joueur !', 'error');
        return;
    }
    fetch('https://esx_weaponcraft/f6:givePPA', {
        method: 'POST',
        body: JSON.stringify({ playerId: selectedF6Player })
    });
    closeMenu();
}

function removePPA() {
    if (!selectedF6Player) {
        showNotification('Selectionnez un joueur !', 'error');
        return;
    }
    fetch('https://esx_weaponcraft/f6:removePPA', {
        method: 'POST',
        body: JSON.stringify({ playerId: selectedF6Player })
    });
    closeMenu();
}
