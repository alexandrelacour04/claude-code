local Framework = nil

-- Initialisation du framework
CreateThread(function()
    if Config.Framework == 'esx' then
        Framework = exports['es_extended']:getSharedObject()
    elseif Config.Framework == 'qbcore' then
        Framework = exports['qb-core']:GetCoreObject()
    end
end)

-- ============================================
-- FONCTIONS UTILITAIRES
-- ============================================

local function GetPlayerIdentifier(source)
    if Config.Framework == 'esx' then
        local xPlayer = Framework.GetPlayerFromId(source)
        return xPlayer and xPlayer.identifier or nil
    elseif Config.Framework == 'qbcore' then
        local player = Framework.Functions.GetPlayer(source)
        return player and player.PlayerData.citizenid or nil
    end
    return nil
end

local function GetPlayerName(source)
    if Config.Framework == 'esx' then
        local xPlayer = Framework.GetPlayerFromId(source)
        return xPlayer and xPlayer.getName() or 'Inconnu'
    elseif Config.Framework == 'qbcore' then
        local player = Framework.Functions.GetPlayer(source)
        if player then
            return player.PlayerData.charinfo.firstname .. ' ' .. player.PlayerData.charinfo.lastname
        end
    end
    return 'Inconnu'
end

local function GetPlayerJob(source)
    if Config.Framework == 'esx' then
        local xPlayer = Framework.GetPlayerFromId(source)
        return xPlayer and xPlayer.job or nil
    elseif Config.Framework == 'qbcore' then
        local player = Framework.Functions.GetPlayer(source)
        return player and player.PlayerData.job or nil
    end
    return nil
end

local function IsPolice(source)
    local job = GetPlayerJob(source)
    if not job then return false end
    local jobName = job.name
    for _, allowed in ipairs(Config.AllowedJobs) do
        if jobName == allowed then return true end
    end
    return false
end

local function GetPlayerRank(source)
    local job = GetPlayerJob(source)
    if not job then return 0 end
    return job.grade or job.grade_name and job.grade or 0
end

-- ============================================
-- CALLBACKS - DONNEES OFFICIER
-- ============================================

lib = nil
pcall(function()
    lib = exports.ox_lib
end)

-- Callback NUI: obtenir les donnees de l'officier connecte
RegisterNetEvent('mdt:server:getOfficerData')
AddEventHandler('mdt:server:getOfficerData', function()
    local source = source
    if not IsPolice(source) then return end

    local identifier = GetPlayerIdentifier(source)
    local name = GetPlayerName(source)
    local rank = GetPlayerRank(source)
    local job = GetPlayerJob(source)

    -- Recuperer ou creer le profil officier
    local officer = MySQL.Sync.fetchAll('SELECT * FROM mdt_officers WHERE identifier = ?', { identifier })

    if #officer == 0 then
        MySQL.Sync.execute('INSERT INTO mdt_officers (identifier, name, department) VALUES (?, ?, ?)', {
            identifier, name, Config.DefaultDepartment
        })
        officer = MySQL.Sync.fetchAll('SELECT * FROM mdt_officers WHERE identifier = ?', { identifier })
    end

    local data = officer[1] or {}
    data.name = name
    data.rank = Config.Ranks[rank] or 'Officier'
    data.rank_level = rank
    data.department = data.department or Config.DefaultDepartment
    data.job = job and job.name or 'police'

    TriggerClientEvent('mdt:client:receiveOfficerData', source, data)
end)

-- ============================================
-- CALLBACKS - TABLEAU DE BORD
-- ============================================

RegisterNetEvent('mdt:server:getDashboardData')
AddEventHandler('mdt:server:getDashboardData', function()
    local source = source
    if not IsPolice(source) then return end

    local warrantCount = MySQL.Sync.fetchScalar('SELECT COUNT(*) FROM mdt_warrants WHERE status = ?', { 'active' })
    local boloCount = MySQL.Sync.fetchScalar('SELECT COUNT(*) FROM mdt_bolos WHERE status = ?', { 'active' })
    local incidentCount = MySQL.Sync.fetchScalar('SELECT COUNT(*) FROM mdt_incidents WHERE DATE(created_at) = CURDATE()', {})
    local callCount = MySQL.Sync.fetchScalar('SELECT COUNT(*) FROM mdt_dispatch_calls WHERE status NOT IN (?, ?)', { 'resolved', 'cancelled' })

    local recentIncidents = MySQL.Sync.fetchAll(
        'SELECT id, title, type, status, created_by, created_at FROM mdt_incidents ORDER BY created_at DESC LIMIT 10', {}
    )

    local activeCalls = MySQL.Sync.fetchAll(
        'SELECT * FROM mdt_dispatch_calls WHERE status NOT IN (?, ?) ORDER BY FIELD(priority, "critical", "high", "normal", "low"), created_at DESC LIMIT 10',
        { 'resolved', 'cancelled' }
    )

    local activeBolos = MySQL.Sync.fetchAll(
        'SELECT * FROM mdt_bolos WHERE status = ? ORDER BY FIELD(priority, "critical", "high", "normal", "low"), created_at DESC LIMIT 5',
        { 'active' }
    )

    TriggerClientEvent('mdt:client:receiveDashboardData', source, {
        stats = {
            warrants = warrantCount or 0,
            bolos = boloCount or 0,
            incidents = incidentCount or 0,
            activeCalls = callCount or 0,
        },
        recentIncidents = recentIncidents,
        activeCalls = activeCalls,
        activeBolos = activeBolos,
    })
end)

-- ============================================
-- CALLBACKS - RECHERCHE CITOYENS
-- ============================================

RegisterNetEvent('mdt:server:searchCitizens')
AddEventHandler('mdt:server:searchCitizens', function(query)
    local source = source
    if not IsPolice(source) then return end

    local results = {}
    if Config.Framework == 'esx' then
        results = MySQL.Sync.fetchAll(
            'SELECT identifier, firstname, lastname, dateofbirth, sex, phone_number FROM users WHERE CONCAT(firstname, " ", lastname) LIKE ? OR identifier LIKE ? LIMIT 25',
            { '%' .. query .. '%', '%' .. query .. '%' }
        )
    elseif Config.Framework == 'qbcore' then
        results = MySQL.Sync.fetchAll(
            'SELECT citizenid as identifier, JSON_EXTRACT(charinfo, "$.firstname") as firstname, JSON_EXTRACT(charinfo, "$.lastname") as lastname, JSON_EXTRACT(charinfo, "$.birthdate") as dateofbirth, JSON_EXTRACT(charinfo, "$.gender") as sex, JSON_EXTRACT(charinfo, "$.phone") as phone_number FROM players WHERE CONCAT(JSON_EXTRACT(charinfo, "$.firstname"), " ", JSON_EXTRACT(charinfo, "$.lastname")) LIKE ? OR citizenid LIKE ? LIMIT 25',
            { '%' .. query .. '%', '%' .. query .. '%' }
        )
    end

    -- Ajouter les flags pour chaque citoyen
    for i, citizen in ipairs(results) do
        local flags = MySQL.Sync.fetchAll(
            'SELECT flag_type FROM mdt_citizen_flags WHERE citizen_id = ? AND active = 1', { citizen.identifier }
        )
        results[i].flags = {}
        for _, f in ipairs(flags) do
            table.insert(results[i].flags, f.flag_type)
        end
    end

    TriggerClientEvent('mdt:client:receiveCitizenSearch', source, results)
end)

RegisterNetEvent('mdt:server:getCitizenProfile')
AddEventHandler('mdt:server:getCitizenProfile', function(citizenId)
    local source = source
    if not IsPolice(source) then return end

    -- Profil de base
    local citizen = nil
    if Config.Framework == 'esx' then
        local result = MySQL.Sync.fetchAll(
            'SELECT identifier, firstname, lastname, dateofbirth, sex, phone_number FROM users WHERE identifier = ?',
            { citizenId }
        )
        citizen = result[1]
    elseif Config.Framework == 'qbcore' then
        local result = MySQL.Sync.fetchAll(
            'SELECT citizenid as identifier, JSON_EXTRACT(charinfo, "$.firstname") as firstname, JSON_EXTRACT(charinfo, "$.lastname") as lastname, JSON_EXTRACT(charinfo, "$.birthdate") as dateofbirth, JSON_EXTRACT(charinfo, "$.gender") as sex, JSON_EXTRACT(charinfo, "$.phone") as phone_number FROM players WHERE citizenid = ?',
            { citizenId }
        )
        citizen = result[1]
    end

    if not citizen then
        TriggerClientEvent('mdt:client:receiveCitizenProfile', source, nil)
        return
    end

    -- Vehicules
    local vehicles = {}
    if Config.Framework == 'esx' then
        vehicles = MySQL.Sync.fetchAll(
            'SELECT plate, vehicle FROM owned_vehicles WHERE owner = ?', { citizenId }
        )
    elseif Config.Framework == 'qbcore' then
        vehicles = MySQL.Sync.fetchAll(
            'SELECT plate, vehicle FROM player_vehicles WHERE citizenid = ?', { citizenId }
        )
    end

    -- Casier judiciaire
    local records = MySQL.Sync.fetchAll(
        'SELECT * FROM mdt_criminal_records WHERE citizen_id = ? ORDER BY created_at DESC', { citizenId }
    )

    -- Notes
    local notes = MySQL.Sync.fetchAll(
        'SELECT * FROM mdt_citizen_notes WHERE citizen_id = ? ORDER BY created_at DESC', { citizenId }
    )

    -- Flags
    local flags = MySQL.Sync.fetchAll(
        'SELECT * FROM mdt_citizen_flags WHERE citizen_id = ? AND active = 1', { citizenId }
    )

    -- Mandats actifs
    local warrants = MySQL.Sync.fetchAll(
        'SELECT * FROM mdt_warrants WHERE citizen_id = ? AND status = ?', { citizenId, 'active' }
    )

    -- Licences
    local licenses = MySQL.Sync.fetchAll(
        'SELECT * FROM mdt_licenses WHERE citizen_id = ?', { citizenId }
    )

    -- Incidents impliques
    local incidents = MySQL.Sync.fetchAll(
        'SELECT i.id, i.title, i.type, i.status, i.created_at, ic.role, ic.charges FROM mdt_incident_citizens ic JOIN mdt_incidents i ON i.id = ic.incident_id WHERE ic.citizen_id = ? ORDER BY i.created_at DESC LIMIT 20',
        { citizenId }
    )

    citizen.vehicles = vehicles
    citizen.records = records
    citizen.notes = notes
    citizen.flags = {}
    for _, f in ipairs(flags) do
        table.insert(citizen.flags, f)
    end
    citizen.warrants = warrants
    citizen.licenses = licenses
    citizen.incidents = incidents

    TriggerClientEvent('mdt:client:receiveCitizenProfile', source, citizen)
end)

-- Ajouter une note sur un citoyen
RegisterNetEvent('mdt:server:addCitizenNote')
AddEventHandler('mdt:server:addCitizenNote', function(citizenId, note)
    local source = source
    if not IsPolice(source) then return end

    local officerName = GetPlayerName(source)
    MySQL.Sync.execute(
        'INSERT INTO mdt_citizen_notes (citizen_id, officer_name, note) VALUES (?, ?, ?)',
        { citizenId, officerName, note }
    )
    TriggerClientEvent('mdt:client:noteAdded', source, true)
end)

-- Ajouter/Retirer un flag citoyen
RegisterNetEvent('mdt:server:toggleCitizenFlag')
AddEventHandler('mdt:server:toggleCitizenFlag', function(citizenId, flagType, active)
    local source = source
    if not IsPolice(source) then return end

    local officerName = GetPlayerName(source)

    if active then
        MySQL.Sync.execute(
            'INSERT INTO mdt_citizen_flags (citizen_id, flag_type, set_by) VALUES (?, ?, ?)',
            { citizenId, flagType, officerName }
        )
    else
        MySQL.Sync.execute(
            'UPDATE mdt_citizen_flags SET active = 0 WHERE citizen_id = ? AND flag_type = ? AND active = 1',
            { citizenId, flagType }
        )
    end
    TriggerClientEvent('mdt:client:flagToggled', source, true)
end)

-- ============================================
-- CALLBACKS - RECHERCHE VEHICULES
-- ============================================

RegisterNetEvent('mdt:server:searchVehicles')
AddEventHandler('mdt:server:searchVehicles', function(query)
    local source = source
    if not IsPolice(source) then return end

    local results = {}
    if Config.Framework == 'esx' then
        results = MySQL.Sync.fetchAll(
            'SELECT ov.plate, ov.vehicle, u.firstname, u.lastname, u.identifier FROM owned_vehicles ov LEFT JOIN users u ON ov.owner = u.identifier WHERE ov.plate LIKE ? LIMIT 25',
            { '%' .. query .. '%' }
        )
    elseif Config.Framework == 'qbcore' then
        results = MySQL.Sync.fetchAll(
            'SELECT pv.plate, pv.vehicle, JSON_EXTRACT(p.charinfo, "$.firstname") as firstname, JSON_EXTRACT(p.charinfo, "$.lastname") as lastname, p.citizenid as identifier FROM player_vehicles pv LEFT JOIN players p ON pv.citizenid = p.citizenid WHERE pv.plate LIKE ? LIMIT 25',
            { '%' .. query .. '%' }
        )
    end

    -- Verifier si vehicule vole
    for i, v in ipairs(results) do
        local stolen = MySQL.Sync.fetchAll(
            'SELECT id FROM mdt_stolen_vehicles WHERE plate = ? AND status = ?', { v.plate, 'stolen' }
        )
        results[i].stolen = #stolen > 0

        local bolo = MySQL.Sync.fetchAll(
            'SELECT id FROM mdt_bolos WHERE vehicle_plate = ? AND status = ?', { v.plate, 'active' }
        )
        results[i].bolo = #bolo > 0
    end

    TriggerClientEvent('mdt:client:receiveVehicleSearch', source, results)
end)

-- Signaler vehicule vole
RegisterNetEvent('mdt:server:reportStolenVehicle')
AddEventHandler('mdt:server:reportStolenVehicle', function(data)
    local source = source
    if not IsPolice(source) then return end

    local officerName = GetPlayerName(source)
    MySQL.Sync.execute(
        'INSERT INTO mdt_stolen_vehicles (plate, model, color, owner_name, reported_by, location, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
        { data.plate, data.model, data.color, data.owner, officerName, data.location, data.description }
    )
    TriggerClientEvent('mdt:client:stolenReported', source, true)
end)

-- ============================================
-- CALLBACKS - MANDATS
-- ============================================

RegisterNetEvent('mdt:server:getWarrants')
AddEventHandler('mdt:server:getWarrants', function(filter)
    local source = source
    if not IsPolice(source) then return end

    local warrants = {}
    if filter == 'all' then
        warrants = MySQL.Sync.fetchAll('SELECT * FROM mdt_warrants ORDER BY created_at DESC LIMIT 50', {})
    else
        warrants = MySQL.Sync.fetchAll('SELECT * FROM mdt_warrants WHERE status = ? ORDER BY created_at DESC LIMIT 50', { filter })
    end

    TriggerClientEvent('mdt:client:receiveWarrants', source, warrants)
end)

RegisterNetEvent('mdt:server:createWarrant')
AddEventHandler('mdt:server:createWarrant', function(data)
    local source = source
    if not IsPolice(source) then return end

    local identifier = GetPlayerIdentifier(source)
    local name = GetPlayerName(source)

    MySQL.Sync.execute(
        'INSERT INTO mdt_warrants (citizen_id, citizen_name, type, title, description, charges, issued_by, issued_by_id, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        { data.citizenId, data.citizenName, data.type, data.title, data.description, data.charges, name, identifier, data.expiresAt }
    )

    -- Ajouter flag "wanted" au citoyen
    MySQL.Sync.execute(
        'INSERT INTO mdt_citizen_flags (citizen_id, flag_type, set_by, description) VALUES (?, ?, ?, ?)',
        { data.citizenId, 'wanted', name, 'Mandat actif: ' .. data.title }
    )

    TriggerClientEvent('mdt:client:warrantCreated', source, true)
end)

RegisterNetEvent('mdt:server:updateWarrantStatus')
AddEventHandler('mdt:server:updateWarrantStatus', function(warrantId, status)
    local source = source
    if not IsPolice(source) then return end

    local name = GetPlayerName(source)

    if status == 'served' then
        MySQL.Sync.execute(
            'UPDATE mdt_warrants SET status = ?, served_by = ?, served_at = NOW() WHERE id = ?',
            { status, name, warrantId }
        )
        -- Retirer le flag wanted si pas d'autre mandat actif
        local warrant = MySQL.Sync.fetchAll('SELECT citizen_id FROM mdt_warrants WHERE id = ?', { warrantId })
        if warrant[1] then
            local remaining = MySQL.Sync.fetchScalar(
                'SELECT COUNT(*) FROM mdt_warrants WHERE citizen_id = ? AND status = ? AND id != ?',
                { warrant[1].citizen_id, 'active', warrantId }
            )
            if remaining == 0 then
                MySQL.Sync.execute(
                    'UPDATE mdt_citizen_flags SET active = 0 WHERE citizen_id = ? AND flag_type = ?',
                    { warrant[1].citizen_id, 'wanted' }
                )
            end
        end
    else
        MySQL.Sync.execute('UPDATE mdt_warrants SET status = ? WHERE id = ?', { status, warrantId })
    end

    TriggerClientEvent('mdt:client:warrantUpdated', source, true)
end)

-- ============================================
-- CALLBACKS - BOLO
-- ============================================

RegisterNetEvent('mdt:server:getBolos')
AddEventHandler('mdt:server:getBolos', function(filter)
    local source = source
    if not IsPolice(source) then return end

    local bolos = {}
    if filter == 'all' then
        bolos = MySQL.Sync.fetchAll('SELECT * FROM mdt_bolos ORDER BY FIELD(priority, "critical", "high", "normal", "low"), created_at DESC LIMIT 50', {})
    else
        bolos = MySQL.Sync.fetchAll('SELECT * FROM mdt_bolos WHERE status = ? ORDER BY FIELD(priority, "critical", "high", "normal", "low"), created_at DESC LIMIT 50', { filter })
    end

    TriggerClientEvent('mdt:client:receiveBolos', source, bolos)
end)

RegisterNetEvent('mdt:server:createBolo')
AddEventHandler('mdt:server:createBolo', function(data)
    local source = source
    if not IsPolice(source) then return end

    local identifier = GetPlayerIdentifier(source)
    local name = GetPlayerName(source)

    MySQL.Sync.execute(
        'INSERT INTO mdt_bolos (type, title, description, person_name, person_description, vehicle_plate, vehicle_model, vehicle_color, last_seen_location, reason, priority, created_by, created_by_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        { data.type, data.title, data.description, data.personName, data.personDescription, data.vehiclePlate, data.vehicleModel, data.vehicleColor, data.lastSeenLocation, data.reason, data.priority, name, identifier }
    )
    TriggerClientEvent('mdt:client:boloCreated', source, true)
end)

RegisterNetEvent('mdt:server:updateBoloStatus')
AddEventHandler('mdt:server:updateBoloStatus', function(boloId, status)
    local source = source
    if not IsPolice(source) then return end

    local name = GetPlayerName(source)
    if status == 'resolved' then
        MySQL.Sync.execute(
            'UPDATE mdt_bolos SET status = ?, resolved_by = ?, resolved_at = NOW() WHERE id = ?',
            { status, name, boloId }
        )
    else
        MySQL.Sync.execute('UPDATE mdt_bolos SET status = ? WHERE id = ?', { status, boloId })
    end
    TriggerClientEvent('mdt:client:boloUpdated', source, true)
end)

-- ============================================
-- CALLBACKS - INCIDENTS / RAPPORTS
-- ============================================

RegisterNetEvent('mdt:server:getIncidents')
AddEventHandler('mdt:server:getIncidents', function(filter)
    local source = source
    if not IsPolice(source) then return end

    local incidents = {}
    if filter == 'all' then
        incidents = MySQL.Sync.fetchAll('SELECT * FROM mdt_incidents ORDER BY created_at DESC LIMIT 50', {})
    elseif filter == 'mine' then
        local identifier = GetPlayerIdentifier(source)
        incidents = MySQL.Sync.fetchAll('SELECT * FROM mdt_incidents WHERE created_by_id = ? ORDER BY created_at DESC LIMIT 50', { identifier })
    else
        incidents = MySQL.Sync.fetchAll('SELECT * FROM mdt_incidents WHERE status = ? ORDER BY created_at DESC LIMIT 50', { filter })
    end

    TriggerClientEvent('mdt:client:receiveIncidents', source, incidents)
end)

RegisterNetEvent('mdt:server:getIncidentDetail')
AddEventHandler('mdt:server:getIncidentDetail', function(incidentId)
    local source = source
    if not IsPolice(source) then return end

    local incident = MySQL.Sync.fetchAll('SELECT * FROM mdt_incidents WHERE id = ?', { incidentId })
    if #incident == 0 then
        TriggerClientEvent('mdt:client:receiveIncidentDetail', source, nil)
        return
    end

    local citizens = MySQL.Sync.fetchAll(
        'SELECT * FROM mdt_incident_citizens WHERE incident_id = ? ORDER BY role', { incidentId }
    )

    incident[1].citizens = citizens
    TriggerClientEvent('mdt:client:receiveIncidentDetail', source, incident[1])
end)

RegisterNetEvent('mdt:server:createIncident')
AddEventHandler('mdt:server:createIncident', function(data)
    local source = source
    if not IsPolice(source) then return end

    local identifier = GetPlayerIdentifier(source)
    local name = GetPlayerName(source)

    local id = MySQL.Sync.insert(
        'INSERT INTO mdt_incidents (title, type, location, description, evidence, priority, created_by, created_by_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        { data.title, data.type, data.location, data.description, data.evidence, data.priority, name, identifier }
    )

    -- Ajouter citoyens impliques
    if data.citizens and #data.citizens > 0 then
        for _, citizen in ipairs(data.citizens) do
            MySQL.Sync.execute(
                'INSERT INTO mdt_incident_citizens (incident_id, citizen_id, citizen_name, role, charges, fine_amount, jail_time, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                { id, citizen.citizenId or '', citizen.name, citizen.role, citizen.charges, citizen.fine or 0, citizen.jail or 0, citizen.notes }
            )

            -- Ajouter au casier judiciaire si suspect avec charges
            if citizen.role == 'suspect' and citizen.charges and citizen.charges ~= '' then
                MySQL.Sync.execute(
                    'INSERT INTO mdt_criminal_records (citizen_id, citizen_name, incident_id, charge_code, charge_title, fine_amount, jail_time, officer_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    { citizen.citizenId or '', citizen.name, id, '', citizen.charges, citizen.fine or 0, citizen.jail or 0, name }
                )
            end
        end
    end

    TriggerClientEvent('mdt:client:incidentCreated', source, id)
end)

RegisterNetEvent('mdt:server:updateIncident')
AddEventHandler('mdt:server:updateIncident', function(incidentId, data)
    local source = source
    if not IsPolice(source) then return end

    MySQL.Sync.execute(
        'UPDATE mdt_incidents SET title = ?, type = ?, location = ?, description = ?, evidence = ?, status = ?, priority = ?, updated_at = NOW() WHERE id = ?',
        { data.title, data.type, data.location, data.description, data.evidence, data.status, data.priority, incidentId }
    )

    if data.status == 'closed' then
        MySQL.Sync.execute('UPDATE mdt_incidents SET closed_at = NOW() WHERE id = ?', { incidentId })
    end

    TriggerClientEvent('mdt:client:incidentUpdated', source, true)
end)

-- ============================================
-- CALLBACKS - DISPATCH
-- ============================================

RegisterNetEvent('mdt:server:getDispatchCalls')
AddEventHandler('mdt:server:getDispatchCalls', function()
    local source = source
    if not IsPolice(source) then return end

    local calls = MySQL.Sync.fetchAll(
        'SELECT * FROM mdt_dispatch_calls WHERE status NOT IN (?, ?) ORDER BY FIELD(priority, "critical", "high", "normal", "low"), created_at DESC',
        { 'resolved', 'cancelled' }
    )

    TriggerClientEvent('mdt:client:receiveDispatchCalls', source, calls)
end)

RegisterNetEvent('mdt:server:createDispatchCall')
AddEventHandler('mdt:server:createDispatchCall', function(data)
    local source = source
    if not IsPolice(source) then return end

    local name = GetPlayerName(source)

    MySQL.Sync.execute(
        'INSERT INTO mdt_dispatch_calls (caller_name, phone_number, location, description, type, priority, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
        { data.callerName, data.phoneNumber, data.location, data.description, data.type, data.priority, name }
    )

    -- Notifier tous les policiers connectes
    TriggerClientEvent('mdt:client:newDispatchCall', -1, {
        type = data.type,
        location = data.location,
        description = data.description,
        priority = data.priority,
    })

    TriggerClientEvent('mdt:client:callCreated', source, true)
end)

RegisterNetEvent('mdt:server:updateCallStatus')
AddEventHandler('mdt:server:updateCallStatus', function(callId, status, units)
    local source = source
    if not IsPolice(source) then return end

    local name = GetPlayerName(source)

    if status == 'resolved' then
        MySQL.Sync.execute(
            'UPDATE mdt_dispatch_calls SET status = ?, resolved_by = ?, resolved_at = NOW() WHERE id = ?',
            { status, name, callId }
        )
    else
        MySQL.Sync.execute(
            'UPDATE mdt_dispatch_calls SET status = ?, assigned_units = ? WHERE id = ?',
            { status, units, callId }
        )
    end

    TriggerClientEvent('mdt:client:callUpdated', source, true)
end)

-- ============================================
-- CALLBACKS - PROFIL OFFICIER
-- ============================================

RegisterNetEvent('mdt:server:updateOfficerProfile')
AddEventHandler('mdt:server:updateOfficerProfile', function(data)
    local source = source
    if not IsPolice(source) then return end

    local identifier = GetPlayerIdentifier(source)

    MySQL.Sync.execute(
        'UPDATE mdt_officers SET callsign = ?, badge_number = ?, phone = ?, image_url = ? WHERE identifier = ?',
        { data.callsign, data.badgeNumber, data.phone, data.imageUrl, identifier }
    )

    TriggerClientEvent('mdt:client:profileUpdated', source, true)
end)

-- ============================================
-- CALLBACKS - OFFICIERS EN LIGNE
-- ============================================

RegisterNetEvent('mdt:server:getOnlineOfficers')
AddEventHandler('mdt:server:getOnlineOfficers', function()
    local source = source
    if not IsPolice(source) then return end

    local officers = {}

    if Config.Framework == 'esx' then
        local xPlayers = Framework.GetExtendedPlayers()
        for _, xPlayer in pairs(xPlayers) do
            local job = xPlayer.job
            for _, allowed in ipairs(Config.AllowedJobs) do
                if job.name == allowed then
                    local officerData = MySQL.Sync.fetchAll(
                        'SELECT callsign, badge_number, department FROM mdt_officers WHERE identifier = ?',
                        { xPlayer.identifier }
                    )
                    local od = officerData[1] or {}
                    table.insert(officers, {
                        name = xPlayer.getName(),
                        rank = Config.Ranks[job.grade] or 'Officier',
                        callsign = od.callsign or 'N/A',
                        badge = od.badge_number or 'N/A',
                        department = od.department or Config.DefaultDepartment,
                        serverId = xPlayer.source,
                    })
                    break
                end
            end
        end
    elseif Config.Framework == 'qbcore' then
        local players = Framework.Functions.GetQBPlayers()
        for _, player in pairs(players) do
            local job = player.PlayerData.job
            for _, allowed in ipairs(Config.AllowedJobs) do
                if job.name == allowed then
                    local officerData = MySQL.Sync.fetchAll(
                        'SELECT callsign, badge_number, department FROM mdt_officers WHERE identifier = ?',
                        { player.PlayerData.citizenid }
                    )
                    local od = officerData[1] or {}
                    table.insert(officers, {
                        name = player.PlayerData.charinfo.firstname .. ' ' .. player.PlayerData.charinfo.lastname,
                        rank = Config.Ranks[job.grade.level] or 'Officier',
                        callsign = od.callsign or 'N/A',
                        badge = od.badge_number or 'N/A',
                        department = od.department or Config.DefaultDepartment,
                        serverId = player.PlayerData.source,
                    })
                    break
                end
            end
        end
    end

    TriggerClientEvent('mdt:client:receiveOnlineOfficers', source, officers)
end)

-- ============================================
-- CALLBACKS - LICENCES
-- ============================================

RegisterNetEvent('mdt:server:updateLicense')
AddEventHandler('mdt:server:updateLicense', function(citizenId, licenseType, status, reason)
    local source = source
    if not IsPolice(source) then return end

    local officerName = GetPlayerName(source)

    local existing = MySQL.Sync.fetchAll(
        'SELECT id FROM mdt_licenses WHERE citizen_id = ? AND type = ?', { citizenId, licenseType }
    )

    if #existing > 0 then
        MySQL.Sync.execute(
            'UPDATE mdt_licenses SET status = ?, suspended_by = ?, suspended_reason = ? WHERE citizen_id = ? AND type = ?',
            { status, officerName, reason, citizenId, licenseType }
        )
    else
        MySQL.Sync.execute(
            'INSERT INTO mdt_licenses (citizen_id, type, status) VALUES (?, ?, ?)',
            { citizenId, licenseType, status }
        )
    end

    TriggerClientEvent('mdt:client:licenseUpdated', source, true)
end)

print('^2[LSPD-MDT]^0 Serveur charge avec succes.')
