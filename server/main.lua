-- ============================================================
--  MDT FiveM - Script Serveur
-- ============================================================

local function log(msg)
    if Config.Logs then
        print(('[MDT] %s'):format(msg))
    end
end

-- ----------------------------------------------------------
--  Helpers framework
-- ----------------------------------------------------------
local function getPlayerIdentifier(source)
    for i = 0, GetNumPlayerIdentifiers(source) - 1 do
        local id = GetPlayerIdentifier(source, i)
        if string.sub(id, 1, 6) == 'char1:' or string.sub(id, 1, 7) == 'license' then
            return id
        end
    end
    return tostring(source)
end

local function getPlayerName(source)
    if Config.Framework == 'esx' then
        local ESX = exports['es_extended']:getSharedObject()
        local xPlayer = ESX.GetPlayerFromId(source)
        if xPlayer then
            return xPlayer.get('firstName') .. ' ' .. xPlayer.get('lastName'),
                   xPlayer.getJob().name,
                   xPlayer.getJob().grade
        end
    end
    return GetPlayerName(source), 'police', 0
end

local function isAllowed(source)
    if not Config.CheckJob then return true end
    if Config.Framework == 'esx' then
        local ESX = exports['es_extended']:getSharedObject()
        local xPlayer = ESX.GetPlayerFromId(source)
        if xPlayer then
            local job = xPlayer.getJob().name
            for _, allowed in ipairs(Config.AllowedJobs) do
                if job == allowed then return true end
            end
        end
    else
        return true
    end
    return false
end

local function getOfficerRecord(source)
    local identifier = getPlayerIdentifier(source)
    return MySQL.scalar.await('SELECT id FROM mdt_officers WHERE identifier = ?', { identifier })
end

-- ----------------------------------------------------------
--  Enregistrement officier
-- ----------------------------------------------------------
RegisterNetEvent('mdt:server:registerOfficer', function()
    local src = source
    if not isAllowed(src) then return end

    local identifier = getPlayerIdentifier(src)
    local fullName, job, grade = getPlayerName(src)

    local exists = MySQL.scalar.await(
        'SELECT id FROM mdt_officers WHERE identifier = ?',
        { identifier }
    )

    if not exists then
        local parts = fullName:split and fullName:split(' ') or { fullName }
        local fname  = parts[1] or 'Officier'
        local lname  = parts[2] or 'Inconnu'
        local badge  = tostring(math.random(1000, 9999))

        MySQL.insert.await(
            'INSERT INTO mdt_officers (identifier, firstname, lastname, badge, department) VALUES (?, ?, ?, ?, ?)',
            { identifier, fname, lname, badge, job }
        )
        log(('Nouvel officier enregistre: %s (%s)'):format(fullName, badge))
    end
end)

-- ----------------------------------------------------------
--  Recuperer donnees officier
-- ----------------------------------------------------------
RegisterNetEvent('mdt:server:getOfficerData', function()
    local src = source
    if not isAllowed(src) then
        TriggerClientEvent('mdt:client:notification', src, 'Acces refuse.', 'error')
        return
    end

    local identifier = getPlayerIdentifier(src)
    local officer = MySQL.single.await(
        'SELECT * FROM mdt_officers WHERE identifier = ? LIMIT 1',
        { identifier }
    )

    if not officer then
        -- Auto-enregistrement
        TriggerEvent('mdt:server:registerOfficer', src)
        Wait(500)
        officer = MySQL.single.await('SELECT * FROM mdt_officers WHERE identifier = ?', { identifier })
    end

    if officer then
        -- Mettre en service
        MySQL.update.await('UPDATE mdt_officers SET status = ? WHERE id = ?', { 'En service', officer.id })
        officer.status = 'En service'
        TriggerClientEvent('mdt:client:openWithData', src, officer)
        log(('Officier connecte au MDT: %s (badge %s)'):format(officer.firstname .. ' ' .. officer.lastname, officer.badge))
    end
end)

-- ----------------------------------------------------------
--  Mise a jour statut officier
-- ----------------------------------------------------------
RegisterNetEvent('mdt:server:updateOfficerStatus', function(status)
    local src = source
    if not isAllowed(src) then return end

    local identifier = getPlayerIdentifier(src)
    MySQL.update.await(
        'UPDATE mdt_officers SET status = ? WHERE identifier = ?',
        { status, identifier }
    )
    log(('Statut officier mis a jour: %s -> %s'):format(identifier, status))
end)

-- ----------------------------------------------------------
--  Recherche citoyen
-- ----------------------------------------------------------
RegisterNetEvent('mdt:server:searchCitizen', function(query)
    local src = source
    if not isAllowed(src) then return end

    if not query or #query < 2 then
        TriggerClientEvent('mdt:client:searchCitizenResult', src, {})
        return
    end

    local results = MySQL.query.await(
        [[SELECT id, firstname, lastname, dob, gender, phone, address, is_wanted
          FROM mdt_citizens
          WHERE firstname LIKE ? OR lastname LIKE ? OR CONCAT(firstname,' ',lastname) LIKE ?
          LIMIT ?]],
        { '%'..query..'%', '%'..query..'%', '%'..query..'%', Config.MaxResults }
    )

    TriggerClientEvent('mdt:client:searchCitizenResult', src, results or {})
end)

-- ----------------------------------------------------------
--  Fiche citoyen complete
-- ----------------------------------------------------------
RegisterNetEvent('mdt:server:getCitizen', function(citizenId)
    local src = source
    if not isAllowed(src) then return end

    local citizen = MySQL.single.await(
        'SELECT * FROM mdt_citizens WHERE id = ?',
        { citizenId }
    )

    local records = {}
    if citizen then
        records = MySQL.query.await(
            'SELECT * FROM mdt_records WHERE citizen_id = ? ORDER BY created_at DESC LIMIT 50',
            { citizenId }
        )
    end

    TriggerClientEvent('mdt:client:citizenData', src, citizen, records or {})
end)

-- ----------------------------------------------------------
--  Creer un antecedent judiciaire
-- ----------------------------------------------------------
RegisterNetEvent('mdt:server:createRecord', function(data)
    local src = source
    if not isAllowed(src) then return end

    local officerId = getOfficerRecord(src)
    if not officerId then
        TriggerClientEvent('mdt:client:notification', src, 'Officier non trouve dans la DB.', 'error')
        return
    end

    local _, _, _ = getPlayerName(src)
    local officer = MySQL.single.await('SELECT * FROM mdt_officers WHERE id = ?', { officerId })
    local officerName = officer and (officer.firstname .. ' ' .. officer.lastname) or 'Officier Inconnu'

    MySQL.insert.await(
        [[INSERT INTO mdt_records
            (citizen_id, officer_id, officer_name, type, offenses, total_fine, total_jail, narrative, location)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)]],
        {
            data.citizen_id,
            officerId,
            officerName,
            data.type or 'citation',
            json.encode(data.offenses or {}),
            data.total_fine or 0,
            data.total_jail or 0,
            data.narrative or '',
            data.location or 'Inconnu',
        }
    )

    -- Mise a jour is_wanted si arrestation
    if data.type == 'arrest' then
        MySQL.update.await('UPDATE mdt_citizens SET is_wanted = 0 WHERE id = ?', { data.citizen_id })
    end

    TriggerClientEvent('mdt:client:notification', src, 'Dossier cree avec succes.', 'success')
    log(('Dossier cree par %s pour citoyen %d'):format(officerName, data.citizen_id))
end)

-- ----------------------------------------------------------
--  Recherche vehicule
-- ----------------------------------------------------------
RegisterNetEvent('mdt:server:searchVehicle', function(plate)
    local src = source
    if not isAllowed(src) then return end

    if not plate or #plate < 1 then
        TriggerClientEvent('mdt:client:vehicleData', src, nil)
        return
    end

    local vehicle = MySQL.single.await(
        'SELECT * FROM mdt_vehicles WHERE plate LIKE ? LIMIT 1',
        { '%'..plate:upper()..'%' }
    )

    TriggerClientEvent('mdt:client:vehicleData', src, vehicle)
end)

-- ----------------------------------------------------------
--  Marquer vehicule vole/retrouve
-- ----------------------------------------------------------
RegisterNetEvent('mdt:server:setVehicleStolen', function(plate, stolen)
    local src = source
    if not isAllowed(src) then return end

    MySQL.update.await(
        'UPDATE mdt_vehicles SET is_stolen = ? WHERE plate = ?',
        { stolen and 1 or 0, plate }
    )

    local msg = stolen and 'Vehicule marque comme vole.' or 'Vehicule marque comme retrouve.'
    TriggerClientEvent('mdt:client:notification', src, msg, stolen and 'warning' or 'success')
end)

-- ----------------------------------------------------------
--  Mandats
-- ----------------------------------------------------------
RegisterNetEvent('mdt:server:getWarrants', function()
    local src = source
    if not isAllowed(src) then return end

    local warrants = MySQL.query.await(
        [[SELECT w.*, CONCAT(c.firstname,' ',c.lastname) as citizen_name
          FROM mdt_warrants w
          LEFT JOIN mdt_citizens c ON c.id = w.citizen_id
          WHERE w.status = 'active'
          ORDER BY w.created_at DESC
          LIMIT ?]],
        { Config.MaxResults }
    )

    TriggerClientEvent('mdt:client:warrantsList', src, warrants or {})
end)

RegisterNetEvent('mdt:server:createWarrant', function(data)
    local src = source
    if not isAllowed(src) then return end

    local officerId = getOfficerRecord(src)
    local officer = MySQL.single.await('SELECT * FROM mdt_officers WHERE id = ?', { officerId })
    local officerName = officer and (officer.firstname .. ' ' .. officer.lastname) or 'Officier Inconnu'

    MySQL.insert.await(
        [[INSERT INTO mdt_warrants (citizen_id, officer_id, officer_name, reason, charges)
          VALUES (?, ?, ?, ?, ?)]],
        { data.citizen_id, officerId, officerName, data.reason, json.encode(data.charges or {}) }
    )

    -- Marquer le citoyen comme recherche
    MySQL.update.await('UPDATE mdt_citizens SET is_wanted = 1 WHERE id = ?', { data.citizen_id })

    TriggerClientEvent('mdt:client:notification', src, 'Mandat emis avec succes.', 'success')
end)

RegisterNetEvent('mdt:server:executeWarrant', function(warrantId)
    local src = source
    if not isAllowed(src) then return end

    local _, _, _ = getPlayerName(src)
    local officer = MySQL.single.await('SELECT * FROM mdt_officers WHERE identifier = ?', { getPlayerIdentifier(src) })
    local officerName = officer and (officer.firstname .. ' ' .. officer.lastname) or 'Officier'

    MySQL.update.await(
        [[UPDATE mdt_warrants SET status = 'executed', executed_by = ?, executed_at = NOW()
          WHERE id = ?]],
        { officerName, warrantId }
    )

    -- Recuperer citizen_id pour retirer is_wanted
    local warrant = MySQL.single.await('SELECT citizen_id FROM mdt_warrants WHERE id = ?', { warrantId })
    if warrant then
        MySQL.update.await('UPDATE mdt_citizens SET is_wanted = 0 WHERE id = ?', { warrant.citizen_id })
    end

    TriggerClientEvent('mdt:client:notification', src, 'Mandat execute et archive.', 'success')
end)

-- ----------------------------------------------------------
--  BOLO
-- ----------------------------------------------------------
RegisterNetEvent('mdt:server:getBolos', function()
    local src = source
    if not isAllowed(src) then return end

    local bolos = MySQL.query.await(
        "SELECT * FROM mdt_bolo WHERE status = 'active' ORDER BY created_at DESC LIMIT ?",
        { Config.MaxResults }
    )

    TriggerClientEvent('mdt:client:boloList', src, bolos or {})
end)

RegisterNetEvent('mdt:server:createBolo', function(data)
    local src = source
    if not isAllowed(src) then return end

    local officer = MySQL.single.await('SELECT * FROM mdt_officers WHERE identifier = ?', { getPlayerIdentifier(src) })
    local officerName = officer and (officer.firstname .. ' ' .. officer.lastname) or 'Officier'
    local officerId   = officer and officer.id or 0

    MySQL.insert.await(
        [[INSERT INTO mdt_bolo (officer_id, officer_name, type, target, description, reason, is_armed, is_dangerous)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)]],
        {
            officerId,
            officerName,
            data.type or 'person',
            data.target,
            data.description,
            data.reason,
            data.is_armed and 1 or 0,
            data.is_dangerous and 1 or 0,
        }
    )

    -- Diffuser a tous les officiers connectes
    TriggerClientEvent('mdt:client:notification', -1, ('BOLO emis: %s'):format(data.target), 'warning')
end)

RegisterNetEvent('mdt:server:resolveBolo', function(boloId)
    local src = source
    if not isAllowed(src) then return end

    MySQL.update.await("UPDATE mdt_bolo SET status = 'resolved' WHERE id = ?", { boloId })
    TriggerClientEvent('mdt:client:notification', src, 'BOLO resolu.', 'success')
end)

-- ----------------------------------------------------------
--  Incidents
-- ----------------------------------------------------------
RegisterNetEvent('mdt:server:getIncidents', function()
    local src = source
    if not isAllowed(src) then return end

    local incidents = MySQL.query.await(
        'SELECT * FROM mdt_incidents ORDER BY created_at DESC LIMIT ?',
        { Config.MaxResults }
    )

    TriggerClientEvent('mdt:client:incidentList', src, incidents or {})
end)

RegisterNetEvent('mdt:server:createIncident', function(data)
    local src = source
    if not isAllowed(src) then return end

    local officer = MySQL.single.await('SELECT * FROM mdt_officers WHERE identifier = ?', { getPlayerIdentifier(src) })
    local officerName = officer and (officer.firstname .. ' ' .. officer.lastname) or 'Officier'
    local officerId   = officer and officer.id or 0

    MySQL.insert.await(
        [[INSERT INTO mdt_incidents
            (title, officer_id, officer_name, involved_citizens, involved_vehicles, narrative, location, type)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)]],
        {
            data.title,
            officerId,
            officerName,
            json.encode(data.involved_citizens or {}),
            json.encode(data.involved_vehicles or {}),
            data.narrative,
            data.location or 'Inconnu',
            data.type or 'Incident',
        }
    )

    TriggerClientEvent('mdt:client:notification', src, 'Rapport d\'incident cree.', 'success')
end)

-- ----------------------------------------------------------
--  Appels / Dispatches
-- ----------------------------------------------------------
RegisterNetEvent('mdt:server:getCalls', function()
    local src = source
    if not isAllowed(src) then return end

    local calls = MySQL.query.await(
        "SELECT * FROM mdt_calls WHERE status != 'closed' ORDER BY priority ASC, created_at DESC LIMIT ?",
        { Config.MaxResults }
    )

    TriggerClientEvent('mdt:client:callsList', src, calls or {})
end)

RegisterNetEvent('mdt:server:assignToCall', function(callId)
    local src = source
    if not isAllowed(src) then return end

    local officer = MySQL.single.await('SELECT * FROM mdt_officers WHERE identifier = ?', { getPlayerIdentifier(src) })
    if not officer then return end

    local call = MySQL.single.await('SELECT * FROM mdt_calls WHERE id = ?', { callId })
    if not call then return end

    local assigned = call.assigned_to and json.decode(call.assigned_to) or {}
    -- Eviter les doublons
    for _, badge in ipairs(assigned) do
        if badge == officer.badge then
            TriggerClientEvent('mdt:client:notification', src, 'Vous etes deja assigne a cet appel.', 'warning')
            return
        end
    end

    table.insert(assigned, officer.badge)
    MySQL.update.await(
        "UPDATE mdt_calls SET assigned_to = ?, status = 'dispatched' WHERE id = ?",
        { json.encode(assigned), callId }
    )

    TriggerClientEvent('mdt:client:notification', src, 'Vous etes maintenant assigne a cet appel.', 'success')
end)

RegisterNetEvent('mdt:server:updateCallStatus', function(callId, status)
    local src = source
    if not isAllowed(src) then return end

    MySQL.update.await('UPDATE mdt_calls SET status = ? WHERE id = ?', { status, callId })
    TriggerClientEvent('mdt:client:notification', src, 'Statut de l\'appel mis a jour.', 'info')
end)

-- ----------------------------------------------------------
--  Unites actives
-- ----------------------------------------------------------
RegisterNetEvent('mdt:server:getActiveUnits', function()
    local src = source
    if not isAllowed(src) then return end

    local units = MySQL.query.await(
        "SELECT * FROM mdt_officers WHERE status != 'Hors service' ORDER BY rank DESC",
        {}
    )

    TriggerClientEvent('mdt:client:activeUnits', src, units or {})
end)

-- ----------------------------------------------------------
--  Nettoyage a la deconnexion
-- ----------------------------------------------------------
AddEventHandler('playerDropped', function()
    local src = source
    local identifier = getPlayerIdentifier(src)
    MySQL.update.await(
        "UPDATE mdt_officers SET status = 'Hors service' WHERE identifier = ?",
        { identifier }
    )
end)

-- ----------------------------------------------------------
--  Dispatch depuis systeme 911 externe (optionnel)
-- ----------------------------------------------------------
RegisterNetEvent('mdt:server:createCall', function(callData)
    local src = source
    local id = MySQL.insert.await(
        [[INSERT INTO mdt_calls (caller, location, description, type, priority, coords)
          VALUES (?, ?, ?, ?, ?, ?)]],
        {
            callData.caller or 'Anonyme',
            callData.location or 'Inconnu',
            callData.description or '',
            callData.type or 'Divers',
            callData.priority or 2,
            callData.coords and json.encode(callData.coords) or nil,
        }
    )
    callData.id = id
    -- Diffuser a tous
    TriggerClientEvent('mdt:client:newCall', -1, callData)
    log(('Nouveau dispatch cree: %s - %s'):format(callData.type, callData.location))
end)
