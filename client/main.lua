-- ============================================================
--  MDT FiveM - Script Client
-- ============================================================

local mdtOpen    = false
local playerData = {}

-- ----------------------------------------------------------
--  Utilitaires framework
-- ----------------------------------------------------------
local function getPlayerJob()
    if Config.Framework == 'esx' then
        local ESX = exports['es_extended']:getSharedObject()
        local ped = ESX.GetPlayerData()
        if ped and ped.job then
            return ped.job.name, ped.job.grade
        end
    end
    return 'police', 0
end

local function isAllowedJob()
    if not Config.CheckJob then return true end
    local job = getPlayerJob()
    for _, allowed in ipairs(Config.AllowedJobs) do
        if job == allowed then return true end
    end
    return false
end

-- ----------------------------------------------------------
--  Ouverture / Fermeture MDT
-- ----------------------------------------------------------
local function openMDT()
    if mdtOpen then return end
    if not isAllowedJob() then
        -- Notification
        TriggerEvent('esx:showNotification', '~r~Acces refuse. Vous n\'etes pas autorise a utiliser le MDT.')
        return
    end

    mdtOpen = true
    SetNuiFocus(true, true)

    -- Recuperer les infos officier
    TriggerServerEvent('mdt:server:getOfficerData')
end

local function closeMDT()
    if not mdtOpen then return end
    mdtOpen = false
    SetNuiFocus(false, false)
    SendNUIMessage({ action = 'close' })
end

-- ----------------------------------------------------------
--  Keybind (F9 ou touche configuree)
-- ----------------------------------------------------------
RegisterCommand('mdt', function()
    if mdtOpen then closeMDT() else openMDT() end
end, false)

RegisterKeyMapping('mdt', 'Ouvrir/Fermer le MDT', 'keyboard', Config.OpenKey)

-- ----------------------------------------------------------
--  Callbacks NUI -> Client -> Serveur
-- ----------------------------------------------------------
RegisterNUICallback('close', function(_, cb)
    closeMDT()
    cb('ok')
end)

RegisterNUICallback('searchCitizen', function(data, cb)
    TriggerServerEvent('mdt:server:searchCitizen', data.query)
    cb('ok')
end)

RegisterNUICallback('getCitizen', function(data, cb)
    TriggerServerEvent('mdt:server:getCitizen', data.id)
    cb('ok')
end)

RegisterNUICallback('createRecord', function(data, cb)
    TriggerServerEvent('mdt:server:createRecord', data)
    cb('ok')
end)

RegisterNUICallback('searchVehicle', function(data, cb)
    TriggerServerEvent('mdt:server:searchVehicle', data.plate)
    cb('ok')
end)

RegisterNUICallback('getWarrants', function(data, cb)
    TriggerServerEvent('mdt:server:getWarrants')
    cb('ok')
end)

RegisterNUICallback('createWarrant', function(data, cb)
    TriggerServerEvent('mdt:server:createWarrant', data)
    cb('ok')
end)

RegisterNUICallback('executeWarrant', function(data, cb)
    TriggerServerEvent('mdt:server:executeWarrant', data.id)
    cb('ok')
end)

RegisterNUICallback('getBolos', function(data, cb)
    TriggerServerEvent('mdt:server:getBolos')
    cb('ok')
end)

RegisterNUICallback('createBolo', function(data, cb)
    TriggerServerEvent('mdt:server:createBolo', data)
    cb('ok')
end)

RegisterNUICallback('resolveBolo', function(data, cb)
    TriggerServerEvent('mdt:server:resolveBolo', data.id)
    cb('ok')
end)

RegisterNUICallback('getIncidents', function(data, cb)
    TriggerServerEvent('mdt:server:getIncidents')
    cb('ok')
end)

RegisterNUICallback('createIncident', function(data, cb)
    TriggerServerEvent('mdt:server:createIncident', data)
    cb('ok')
end)

RegisterNUICallback('getCalls', function(data, cb)
    TriggerServerEvent('mdt:server:getCalls')
    cb('ok')
end)

RegisterNUICallback('assignToCall', function(data, cb)
    TriggerServerEvent('mdt:server:assignToCall', data.id)
    cb('ok')
end)

RegisterNUICallback('updateCallStatus', function(data, cb)
    TriggerServerEvent('mdt:server:updateCallStatus', data.id, data.status)
    cb('ok')
end)

RegisterNUICallback('getActiveUnits', function(data, cb)
    TriggerServerEvent('mdt:server:getActiveUnits')
    cb('ok')
end)

RegisterNUICallback('updateStatus', function(data, cb)
    TriggerServerEvent('mdt:server:updateOfficerStatus', data.status)
    cb('ok')
end)

RegisterNUICallback('setVehicleStolen', function(data, cb)
    TriggerServerEvent('mdt:server:setVehicleStolen', data.plate, data.stolen)
    cb('ok')
end)

RegisterNUICallback('createBoloCar', function(data, cb)
    TriggerServerEvent('mdt:server:createBolo', data)
    cb('ok')
end)

-- ----------------------------------------------------------
--  Evenements Serveur -> Client -> NUI
-- ----------------------------------------------------------
RegisterNetEvent('mdt:client:openWithData', function(officer)
    playerData = officer
    SendNUIMessage({
        action     = 'open',
        officer    = officer,
        offenses   = Config.Offenses,
    })
end)

RegisterNetEvent('mdt:client:searchCitizenResult', function(results)
    SendNUIMessage({ action = 'searchCitizenResult', data = results })
end)

RegisterNetEvent('mdt:client:citizenData', function(citizen, records)
    SendNUIMessage({ action = 'citizenData', citizen = citizen, records = records })
end)

RegisterNetEvent('mdt:client:vehicleData', function(vehicle)
    SendNUIMessage({ action = 'vehicleData', data = vehicle })
end)

RegisterNetEvent('mdt:client:warrantsList', function(warrants)
    SendNUIMessage({ action = 'warrantsList', data = warrants })
end)

RegisterNetEvent('mdt:client:boloList', function(bolos)
    SendNUIMessage({ action = 'boloList', data = bolos })
end)

RegisterNetEvent('mdt:client:incidentList', function(incidents)
    SendNUIMessage({ action = 'incidentList', data = incidents })
end)

RegisterNetEvent('mdt:client:callsList', function(calls)
    SendNUIMessage({ action = 'callsList', data = calls })
end)

RegisterNetEvent('mdt:client:activeUnits', function(units)
    SendNUIMessage({ action = 'activeUnits', data = units })
end)

RegisterNetEvent('mdt:client:notification', function(msg, type)
    SendNUIMessage({ action = 'notification', message = msg, type = type or 'info' })
end)

-- Nouveau dispatch entrant (push temps reel)
RegisterNetEvent('mdt:client:newCall', function(call)
    if mdtOpen then
        SendNUIMessage({ action = 'newCall', data = call })
    end
    -- Notification meme si MDT ferme
    TriggerEvent('esx:showNotification', ('~b~[MDT] Nouveau dispatch: %s - %s'):format(call.type, call.location))
end)

-- ----------------------------------------------------------
--  Evenement ESX : mise a jour des donnees joueur
-- ----------------------------------------------------------
AddEventHandler('esx:playerLoaded', function(xPlayer)
    -- Enregistrer l'officier en DB si nouveau
    TriggerServerEvent('mdt:server:registerOfficer')
end)
