-- ============================================================
-- esx_weaponcraft - Server
-- ============================================================

local ESX = exports['es_extended']:getSharedObject()

local SellPrices = {}
local AutoSellStock = {}

-- ============================================================
-- INIT
-- ============================================================
CreateThread(function()
    -- Charger les prix personnalises
    local results = MySQL.query.await('SELECT * FROM weaponcraft_prices')
    if results then
        for _, row in ipairs(results) do
            SellPrices[row.item_name] = row.price
        end
    end

    -- Remplir avec les prix par defaut si manquants
    for item, price in pairs(Config.DefaultSellPrices) do
        if not SellPrices[item] then
            SellPrices[item] = price
            MySQL.insert('INSERT INTO weaponcraft_prices (item_name, price) VALUES (?, ?) ON DUPLICATE KEY UPDATE price = price', {item, price})
        end
    end

    -- Charger le stock auto-sell
    local stockResults = MySQL.query.await('SELECT * FROM weaponcraft_autosell')
    if stockResults then
        for _, row in ipairs(stockResults) do
            AutoSellStock[row.item_name] = row.quantity
        end
    end

    print('[esx_weaponcraft] Charge avec succes !')
end)

-- ============================================================
-- HELPERS
-- ============================================================
local function GetPlayerFromId(source)
    return ESX.GetPlayerFromId(source)
end

local function Notify(source, msg, type)
    TriggerClientEvent('weaponcraft:notify', source, msg, type)
end

local function IsInJob(xPlayer)
    return xPlayer.job.name == Config.JobName
end

local function IsBoss(xPlayer)
    return xPlayer.job.name == Config.JobName and xPlayer.job.grade_name == Config.BossGrade
end

local function GetNearbyPlayers(source)
    local xPlayer = GetPlayerFromId(source)
    if not xPlayer then return {} end
    local ped = GetPlayerPed(source)
    local coords = GetEntityCoords(ped)
    local nearby = {}

    for _, xTarget in ipairs(ESX.GetPlayers()) do
        if xTarget ~= source then
            local targetPed = GetPlayerPed(xTarget)
            local tCoords = GetEntityCoords(targetPed)
            if #(coords - tCoords) < 10.0 then
                local targetPlayer = GetPlayerFromId(xTarget)
                if targetPlayer then
                    table.insert(nearby, {
                        id   = xTarget,
                        name = targetPlayer.getName()
                    })
                end
            end
        end
    end

    return nearby
end

-- ============================================================
-- RECOLTE
-- ============================================================
RegisterNetEvent('weaponcraft:harvest')
AddEventHandler('weaponcraft:harvest', function(harvestIndex)
    local source = source
    local xPlayer = GetPlayerFromId(source)
    if not xPlayer or not IsInJob(xPlayer) then return end

    local harvest = Config.HarvestPoints[harvestIndex]
    if not harvest then return end

    if xPlayer.job.grade < harvest.minGrade then
        Notify(source, 'Grade insuffisant !', 'error')
        return
    end

    local amount = math.random(harvest.amount.min, harvest.amount.max)
    xPlayer.addInventoryItem(harvest.item, amount)
    Notify(source, 'Vous avez recolte ' .. amount .. 'x ' .. harvest.itemLabel, 'success')
end)

-- ============================================================
-- FABRICATION
-- ============================================================
RegisterNetEvent('weaponcraft:craft')
AddEventHandler('weaponcraft:craft', function(recipeName, craftType)
    local source = source
    local xPlayer = GetPlayerFromId(source)
    if not xPlayer or not IsInJob(xPlayer) then return end

    local recipes = craftType == 'special' and Config.SpecialRecipes or Config.NormalRecipes
    local recipe = nil

    for _, r in ipairs(recipes) do
        if r.name == recipeName then
            recipe = r
            break
        end
    end

    if not recipe then
        Notify(source, 'Recette introuvable !', 'error')
        return
    end

    -- Verifier les ingredients
    for _, ing in ipairs(recipe.ingredients) do
        local count = xPlayer.getInventoryItem(ing.item)
        if not count or count.count < ing.count then
            Notify(source, 'Il vous manque: ' .. ing.label .. ' (' .. ing.count .. ' requis)', 'error')
            return
        end
    end

    -- Retirer les ingredients
    for _, ing in ipairs(recipe.ingredients) do
        xPlayer.removeInventoryItem(ing.item, ing.count)
    end

    -- Animation cote client
    TriggerClientEvent('weaponcraft:startCraftAnim', source, recipe.time)

    -- Donner l'arme/item apres le delai
    SetTimeout(recipe.time, function()
        if recipe.isItem then
            xPlayer.addInventoryItem(recipe.name, 1)
        else
            xPlayer.addWeapon(recipe.name, 250)
        end
        Notify(source, 'Vous avez fabrique: ' .. recipe.label, 'success')
    end)
end)

-- ============================================================
-- VENTE AMMUNATION
-- ============================================================
RegisterNetEvent('weaponcraft:openSellMenu')
AddEventHandler('weaponcraft:openSellMenu', function()
    local source = source
    local xPlayer = GetPlayerFromId(source)
    if not xPlayer or not IsInJob(xPlayer) then return end

    -- Recuperer les armes du joueur
    local weapons = {}
    local loadout = xPlayer.getLoadout()
    for _, w in ipairs(loadout) do
        if SellPrices[w.name] then
            table.insert(weapons, {
                name  = w.name,
                label = w.label or w.name,
                price = SellPrices[w.name]
            })
        end
    end

    -- Items vendables
    local inventory = xPlayer.getInventory()
    for _, item in ipairs(inventory) do
        if SellPrices[item.name] and item.count > 0 then
            table.insert(weapons, {
                name   = item.name,
                label  = item.label or item.name,
                price  = SellPrices[item.name],
                count  = item.count,
                isItem = true,
            })
        end
    end

    TriggerClientEvent('weaponcraft:openSellMenuClient', source, weapons, SellPrices)
end)

RegisterNetEvent('weaponcraft:sellWeapon')
AddEventHandler('weaponcraft:sellWeapon', function(weaponName)
    local source = source
    local xPlayer = GetPlayerFromId(source)
    if not xPlayer or not IsInJob(xPlayer) then return end

    local price = SellPrices[weaponName]
    if not price then
        Notify(source, 'Prix non defini pour cet article !', 'error')
        return
    end

    -- Verifier si c'est un item ou une arme
    local isItem = false
    for _, r in ipairs(Config.NormalRecipes) do
        if r.name == weaponName and r.isItem then isItem = true break end
    end
    for _, r in ipairs(Config.SpecialRecipes) do
        if r.name == weaponName and r.isItem then isItem = true break end
    end

    if isItem then
        local item = xPlayer.getInventoryItem(weaponName)
        if not item or item.count < 1 then
            Notify(source, 'Vous n\'avez pas cet item !', 'error')
            return
        end
        xPlayer.removeInventoryItem(weaponName, 1)
    else
        if not xPlayer.hasWeapon(weaponName) then
            Notify(source, 'Vous n\'avez pas cette arme !', 'error')
            return
        end
        xPlayer.removeWeapon(weaponName)
    end

    -- Payer le joueur + deposer dans la societe
    local playerCut = math.floor(price * 0.7)
    local societyCut = math.floor(price * 0.3)

    xPlayer.addMoney(playerCut)
    TriggerEvent('esx_addonaccount:getSharedAccount', 'society_' .. Config.JobName, function(account)
        if account then
            account.addMoney(societyCut)
        end
    end)

    Notify(source, 'Vendu pour $' .. playerCut .. ' (+ $' .. societyCut .. ' pour la societe)', 'success')
end)

-- ============================================================
-- VENTE AUTOMATIQUE (stock)
-- ============================================================
RegisterNetEvent('weaponcraft:getAutoSellStock')
AddEventHandler('weaponcraft:getAutoSellStock', function()
    local source = source
    TriggerClientEvent('weaponcraft:openAutoSell', source, AutoSellStock)
end)

RegisterNetEvent('weaponcraft:stockItem')
AddEventHandler('weaponcraft:stockItem', function(itemName, amount)
    local source = source
    local xPlayer = GetPlayerFromId(source)
    if not xPlayer or not IsInJob(xPlayer) then return end

    amount = tonumber(amount) or 1
    if amount < 1 then return end

    -- Verifier si c'est un item ou une arme
    local isItem = false
    for _, r in ipairs(Config.NormalRecipes) do
        if r.name == itemName and r.isItem then isItem = true break end
    end
    for _, r in ipairs(Config.SpecialRecipes) do
        if r.name == itemName and r.isItem then isItem = true break end
    end

    if isItem then
        local item = xPlayer.getInventoryItem(itemName)
        if not item or item.count < amount then
            Notify(source, 'Vous n\'avez pas assez de cet item !', 'error')
            return
        end
        xPlayer.removeInventoryItem(itemName, amount)
    else
        if not xPlayer.hasWeapon(itemName) then
            Notify(source, 'Vous n\'avez pas cette arme !', 'error')
            return
        end
        xPlayer.removeWeapon(itemName)
        amount = 1
    end

    -- Ajouter au stock
    local currentStock = AutoSellStock[itemName] or 0
    if currentStock + amount > Config.AutoSellPoint.maxStock then
        Notify(source, 'Stock maximum atteint (' .. Config.AutoSellPoint.maxStock .. ') !', 'error')
        -- Remettre l'item
        if isItem then
            xPlayer.addInventoryItem(itemName, amount)
        else
            xPlayer.addWeapon(itemName, 250)
        end
        return
    end

    AutoSellStock[itemName] = currentStock + amount
    MySQL.insert('INSERT INTO weaponcraft_autosell (item_name, quantity) VALUES (?, ?) ON DUPLICATE KEY UPDATE quantity = ?', {
        itemName, AutoSellStock[itemName], AutoSellStock[itemName]
    })

    Notify(source, 'Stock mis a jour: ' .. itemName .. ' (' .. AutoSellStock[itemName] .. '/' .. Config.AutoSellPoint.maxStock .. ')', 'success')
end)

RegisterNetEvent('weaponcraft:buyFromAutoSell')
AddEventHandler('weaponcraft:buyFromAutoSell', function(itemName)
    local source = source
    local xPlayer = GetPlayerFromId(source)
    if not xPlayer then return end

    local stock = AutoSellStock[itemName] or 0
    if stock < 1 then
        Notify(source, 'Rupture de stock !', 'error')
        return
    end

    local price = SellPrices[itemName]
    if not price then
        Notify(source, 'Prix non defini !', 'error')
        return
    end

    if xPlayer.getMoney() < price then
        Notify(source, 'Vous n\'avez pas assez d\'argent ! ($' .. price .. ' requis)', 'error')
        return
    end

    -- Verifier si c'est un item ou une arme
    local isItem = false
    for _, r in ipairs(Config.NormalRecipes) do
        if r.name == itemName and r.isItem then isItem = true break end
    end

    xPlayer.removeMoney(price)

    -- Argent dans la societe
    TriggerEvent('esx_addonaccount:getSharedAccount', 'society_' .. Config.JobName, function(account)
        if account then
            account.addMoney(price)
        end
    end)

    if isItem then
        xPlayer.addInventoryItem(itemName, 1)
    else
        xPlayer.addWeapon(itemName, 250)
    end

    AutoSellStock[itemName] = stock - 1
    MySQL.update('UPDATE weaponcraft_autosell SET quantity = ? WHERE item_name = ?', {
        AutoSellStock[itemName], itemName
    })

    Notify(source, 'Achat effectue: ' .. itemName .. ' pour $' .. price, 'success')
    -- Refresh stock pour tout le monde au point
    TriggerClientEvent('weaponcraft:openAutoSell', source, AutoSellStock)
end)

-- ============================================================
-- BOSS MENU
-- ============================================================
RegisterNetEvent('weaponcraft:openBossMenu')
AddEventHandler('weaponcraft:openBossMenu', function()
    local source = source
    local xPlayer = GetPlayerFromId(source)
    if not xPlayer or not IsBoss(xPlayer) then
        Notify(source, 'Acces refuse !', 'error')
        return
    end

    -- Recuperer les employes
    local employees = MySQL.query.await('SELECT identifier, firstname, lastname, job_grade FROM users WHERE job = ?', {Config.JobName})

    -- Caisse societe
    local society = 0
    TriggerEvent('esx_addonaccount:getSharedAccount', 'society_' .. Config.JobName, function(account)
        if account then
            society = account.money
        end
    end)

    Wait(100) -- attendre le callback

    local nearbyPlayers = GetNearbyPlayers(source)

    TriggerClientEvent('weaponcraft:openBossMenu', source, {
        employees = employees or {},
        prices    = SellPrices,
        society   = society,
        nearbyPlayers = nearbyPlayers,
    })
end)

RegisterNetEvent('weaponcraft:boss:hire')
AddEventHandler('weaponcraft:boss:hire', function(targetId)
    local source = source
    local xPlayer = GetPlayerFromId(source)
    if not xPlayer or not IsBoss(xPlayer) then return end

    local xTarget = GetPlayerFromId(targetId)
    if not xTarget then
        Notify(source, 'Joueur introuvable !', 'error')
        return
    end

    xTarget.setJob(Config.JobName, 0)
    Notify(source, xTarget.getName() .. ' a ete embauche !', 'success')
    Notify(targetId, 'Vous avez ete embauche comme ' .. Config.Grades[1].label .. ' !', 'success')
end)

RegisterNetEvent('weaponcraft:boss:fire')
AddEventHandler('weaponcraft:boss:fire', function(targetId)
    local source = source
    local xPlayer = GetPlayerFromId(source)
    if not xPlayer or not IsBoss(xPlayer) then return end

    local xTarget = GetPlayerFromId(targetId)
    if xTarget then
        xTarget.setJob('unemployed', 0)
        Notify(targetId, 'Vous avez ete licencie !', 'error')
    else
        -- Joueur hors ligne
        MySQL.update('UPDATE users SET job = ?, job_grade = ? WHERE identifier = ?', {'unemployed', 0, targetId})
    end
    Notify(source, 'Employe licencie !', 'success')
end)

RegisterNetEvent('weaponcraft:boss:promote')
AddEventHandler('weaponcraft:boss:promote', function(targetId)
    local source = source
    local xPlayer = GetPlayerFromId(source)
    if not xPlayer or not IsBoss(xPlayer) then return end

    local xTarget = GetPlayerFromId(targetId)
    if not xTarget then
        Notify(source, 'Joueur introuvable ou hors ligne !', 'error')
        return
    end

    if xTarget.job.name ~= Config.JobName then
        Notify(source, 'Ce joueur n\'est pas dans le job !', 'error')
        return
    end

    local newGrade = xTarget.job.grade + 1
    local maxGrade = #Config.Grades - 1

    if newGrade > maxGrade then
        Notify(source, 'Grade maximum atteint !', 'error')
        return
    end

    xTarget.setJob(Config.JobName, newGrade)
    Notify(source, xTarget.getName() .. ' a ete promu: ' .. Config.Grades[newGrade + 1].label, 'success')
    Notify(targetId, 'Vous avez ete promu: ' .. Config.Grades[newGrade + 1].label, 'success')
end)

RegisterNetEvent('weaponcraft:boss:demote')
AddEventHandler('weaponcraft:boss:demote', function(targetId)
    local source = source
    local xPlayer = GetPlayerFromId(source)
    if not xPlayer or not IsBoss(xPlayer) then return end

    local xTarget = GetPlayerFromId(targetId)
    if not xTarget then
        Notify(source, 'Joueur introuvable ou hors ligne !', 'error')
        return
    end

    if xTarget.job.name ~= Config.JobName then
        Notify(source, 'Ce joueur n\'est pas dans le job !', 'error')
        return
    end

    local newGrade = xTarget.job.grade - 1
    if newGrade < 0 then
        Notify(source, 'Grade minimum atteint !', 'error')
        return
    end

    xTarget.setJob(Config.JobName, newGrade)
    Notify(source, xTarget.getName() .. ' a ete retrograde: ' .. Config.Grades[newGrade + 1].label, 'success')
    Notify(targetId, 'Vous avez ete retrograde: ' .. Config.Grades[newGrade + 1].label, 'error')
end)

RegisterNetEvent('weaponcraft:boss:setSalary')
AddEventHandler('weaponcraft:boss:setSalary', function(grade, salary)
    local source = source
    local xPlayer = GetPlayerFromId(source)
    if not xPlayer or not IsBoss(xPlayer) then return end

    grade = tonumber(grade)
    salary = tonumber(salary)

    if not grade or not salary or salary < 0 then
        Notify(source, 'Valeurs invalides !', 'error')
        return
    end

    MySQL.update('UPDATE job_grades SET salary = ? WHERE job_name = ? AND grade = ?', {salary, Config.JobName, grade})
    Notify(source, 'Salaire du grade ' .. grade .. ' mis a jour: $' .. salary, 'success')
end)

RegisterNetEvent('weaponcraft:boss:setPrice')
AddEventHandler('weaponcraft:boss:setPrice', function(itemName, price)
    local source = source
    local xPlayer = GetPlayerFromId(source)
    if not xPlayer or not IsBoss(xPlayer) then return end

    price = tonumber(price)
    if not price or price < 0 then
        Notify(source, 'Prix invalide !', 'error')
        return
    end

    SellPrices[itemName] = price
    MySQL.insert('INSERT INTO weaponcraft_prices (item_name, price) VALUES (?, ?) ON DUPLICATE KEY UPDATE price = ?', {itemName, price, price})
    Notify(source, 'Prix de ' .. itemName .. ' mis a jour: $' .. price, 'success')
end)

RegisterNetEvent('weaponcraft:boss:getMoney')
AddEventHandler('weaponcraft:boss:getMoney', function()
    local source = source
    local xPlayer = GetPlayerFromId(source)
    if not xPlayer or not IsBoss(xPlayer) then return end

    TriggerEvent('esx_addonaccount:getSharedAccount', 'society_' .. Config.JobName, function(account)
        if account then
            Notify(source, 'Caisse societe: $' .. account.money, 'info')
        end
    end)
end)

RegisterNetEvent('weaponcraft:boss:withdraw')
AddEventHandler('weaponcraft:boss:withdraw', function(amount)
    local source = source
    local xPlayer = GetPlayerFromId(source)
    if not xPlayer or not IsBoss(xPlayer) then return end

    amount = tonumber(amount)
    if not amount or amount <= 0 then return end

    TriggerEvent('esx_addonaccount:getSharedAccount', 'society_' .. Config.JobName, function(account)
        if account then
            if account.money >= amount then
                account.removeMoney(amount)
                xPlayer.addMoney(amount)
                Notify(source, 'Retrait de $' .. amount .. ' effectue', 'success')
            else
                Notify(source, 'Fonds insuffisants dans la caisse !', 'error')
            end
        end
    end)
end)

RegisterNetEvent('weaponcraft:boss:deposit')
AddEventHandler('weaponcraft:boss:deposit', function(amount)
    local source = source
    local xPlayer = GetPlayerFromId(source)
    if not xPlayer or not IsBoss(xPlayer) then return end

    amount = tonumber(amount)
    if not amount or amount <= 0 then return end

    if xPlayer.getMoney() < amount then
        Notify(source, 'Vous n\'avez pas assez d\'argent !', 'error')
        return
    end

    xPlayer.removeMoney(amount)
    TriggerEvent('esx_addonaccount:getSharedAccount', 'society_' .. Config.JobName, function(account)
        if account then
            account.addMoney(amount)
            Notify(source, 'Depot de $' .. amount .. ' effectue', 'success')
        end
    end)
end)

-- ============================================================
-- F6 MENU - FACTURES / PPA
-- ============================================================
RegisterNetEvent('weaponcraft:f6:invoice')
AddEventHandler('weaponcraft:f6:invoice', function(targetId, amount, reason)
    local source = source
    local xPlayer = GetPlayerFromId(source)
    if not xPlayer or not IsInJob(xPlayer) then return end

    local xTarget = GetPlayerFromId(targetId)
    if not xTarget then
        Notify(source, 'Joueur introuvable !', 'error')
        return
    end

    amount = tonumber(amount)
    if not amount or amount <= 0 then
        Notify(source, 'Montant invalide !', 'error')
        return
    end

    -- Utiliser le systeme de factures ESX
    TriggerEvent('esx_billing:sendBill', targetId, 'society_' .. Config.JobName, 'Armurier - ' .. (reason or 'Facture'), amount)

    Notify(source, 'Facture de $' .. amount .. ' envoyee a ' .. xTarget.getName(), 'success')
    Notify(targetId, 'Vous avez recu une facture de $' .. amount .. ' de l\'armurier', 'info')
end)

RegisterNetEvent('weaponcraft:f6:givePPA')
AddEventHandler('weaponcraft:f6:givePPA', function(targetId)
    local source = source
    local xPlayer = GetPlayerFromId(source)
    if not xPlayer or not IsInJob(xPlayer) then return end

    if xPlayer.job.grade < 2 then
        Notify(source, 'Grade insuffisant ! (Artisan minimum)', 'error')
        return
    end

    local xTarget = GetPlayerFromId(targetId)
    if not xTarget then
        Notify(source, 'Joueur introuvable !', 'error')
        return
    end

    -- Verifier si le joueur a deja un PPA
    local existing = xTarget.getInventoryItem(Config.PPA.itemName)
    if existing and existing.count > 0 then
        Notify(source, 'Ce joueur possede deja un PPA !', 'error')
        return
    end

    xTarget.addInventoryItem(Config.PPA.itemName, 1)
    Notify(source, 'PPA donne a ' .. xTarget.getName(), 'success')
    Notify(targetId, 'Vous avez recu un Permis de Port d\'Arme !', 'success')

    -- Log
    MySQL.insert('INSERT INTO weaponcraft_ppa_logs (giver, receiver, action, date) VALUES (?, ?, ?, NOW())', {
        xPlayer.identifier, xTarget.identifier, 'give'
    })
end)

RegisterNetEvent('weaponcraft:f6:removePPA')
AddEventHandler('weaponcraft:f6:removePPA', function(targetId)
    local source = source
    local xPlayer = GetPlayerFromId(source)
    if not xPlayer or not IsInJob(xPlayer) then return end

    if xPlayer.job.grade < 2 then
        Notify(source, 'Grade insuffisant ! (Artisan minimum)', 'error')
        return
    end

    local xTarget = GetPlayerFromId(targetId)
    if not xTarget then
        Notify(source, 'Joueur introuvable !', 'error')
        return
    end

    local existing = xTarget.getInventoryItem(Config.PPA.itemName)
    if not existing or existing.count < 1 then
        Notify(source, 'Ce joueur n\'a pas de PPA !', 'error')
        return
    end

    xTarget.removeInventoryItem(Config.PPA.itemName, 1)
    Notify(source, 'PPA retire a ' .. xTarget.getName(), 'success')
    Notify(targetId, 'Votre Permis de Port d\'Arme a ete retire !', 'error')

    -- Log
    MySQL.insert('INSERT INTO weaponcraft_ppa_logs (giver, receiver, action, date) VALUES (?, ?, ?, NOW())', {
        xPlayer.identifier, xTarget.identifier, 'remove'
    })
end)
