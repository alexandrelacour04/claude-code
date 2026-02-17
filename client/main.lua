local Framework = nil
local isOpen = false
local PlayerData = {}

-- Initialisation du framework
CreateThread(function()
    if Config.Framework == 'esx' then
        Framework = exports['es_extended']:getSharedObject()
        while Framework.GetPlayerData().job == nil do
            Wait(100)
        end
        PlayerData = Framework.GetPlayerData()

        RegisterNetEvent('esx:setJob')
        AddEventHandler('esx:setJob', function(job)
            PlayerData.job = job
        end)
    elseif Config.Framework == 'qbcore' then
        Framework = exports['qb-core']:GetCoreObject()
        PlayerData = Framework.Functions.GetPlayerData()

        RegisterNetEvent('QBCore:Client:OnJobUpdate')
        AddEventHandler('QBCore:Client:OnJobUpdate', function(JobInfo)
            PlayerData.job = JobInfo
        end)
    end
end)

-- Verification si le joueur est policier
local function IsPolice()
    if not PlayerData.job then return false end
    for _, allowed in ipairs(Config.AllowedJobs) do
        if PlayerData.job.name == allowed then
            return true
        end
    end
    return false
end

-- Ouvrir le MDT
local function OpenMDT()
    if isOpen then return end
    if not IsPolice() then
        -- Notification que le joueur n'est pas policier
        if Config.Framework == 'esx' then
            Framework.ShowNotification('~r~Vous n\'etes pas autorise a utiliser le MDT.')
        elseif Config.Framework == 'qbcore' then
            Framework.Functions.Notify('Vous n\'etes pas autorise a utiliser le MDT.', 'error')
        end
        return
    end

    isOpen = true
    SetNuiFocus(true, true)
    SendNUIMessage({ action = 'openMDT' })

    -- Demander les donnees de l'officier
    TriggerServerEvent('mdt:server:getOfficerData')
end

-- Fermer le MDT
local function CloseMDT()
    if not isOpen then return end
    isOpen = false
    SetNuiFocus(false, false)
    SendNUIMessage({ action = 'closeMDT' })
end

-- Keybind pour ouvrir/fermer le MDT
RegisterCommand('mdt', function()
    if isOpen then
        CloseMDT()
    else
        OpenMDT()
    end
end, false)

RegisterKeyMapping('mdt', 'Ouvrir le MDT Police', 'keyboard', Config.OpenKey)

-- ============================================
-- NUI CALLBACKS
-- ============================================

-- Fermer le MDT depuis le NUI
RegisterNUICallback('closeMDT', function(data, cb)
    CloseMDT()
    cb('ok')
end)

-- Navigation / Requetes de donnees
RegisterNUICallback('getDashboardData', function(data, cb)
    TriggerServerEvent('mdt:server:getDashboardData')
    cb('ok')
end)

RegisterNUICallback('searchCitizens', function(data, cb)
    TriggerServerEvent('mdt:server:searchCitizens', data.query)
    cb('ok')
end)

RegisterNUICallback('getCitizenProfile', function(data, cb)
    TriggerServerEvent('mdt:server:getCitizenProfile', data.citizenId)
    cb('ok')
end)

RegisterNUICallback('addCitizenNote', function(data, cb)
    TriggerServerEvent('mdt:server:addCitizenNote', data.citizenId, data.note)
    cb('ok')
end)

RegisterNUICallback('toggleCitizenFlag', function(data, cb)
    TriggerServerEvent('mdt:server:toggleCitizenFlag', data.citizenId, data.flagType, data.active)
    cb('ok')
end)

RegisterNUICallback('searchVehicles', function(data, cb)
    TriggerServerEvent('mdt:server:searchVehicles', data.query)
    cb('ok')
end)

RegisterNUICallback('reportStolenVehicle', function(data, cb)
    TriggerServerEvent('mdt:server:reportStolenVehicle', data)
    cb('ok')
end)

RegisterNUICallback('getWarrants', function(data, cb)
    TriggerServerEvent('mdt:server:getWarrants', data.filter or 'active')
    cb('ok')
end)

RegisterNUICallback('createWarrant', function(data, cb)
    TriggerServerEvent('mdt:server:createWarrant', data)
    cb('ok')
end)

RegisterNUICallback('updateWarrantStatus', function(data, cb)
    TriggerServerEvent('mdt:server:updateWarrantStatus', data.warrantId, data.status)
    cb('ok')
end)

RegisterNUICallback('getBolos', function(data, cb)
    TriggerServerEvent('mdt:server:getBolos', data.filter or 'active')
    cb('ok')
end)

RegisterNUICallback('createBolo', function(data, cb)
    TriggerServerEvent('mdt:server:createBolo', data)
    cb('ok')
end)

RegisterNUICallback('updateBoloStatus', function(data, cb)
    TriggerServerEvent('mdt:server:updateBoloStatus', data.boloId, data.status)
    cb('ok')
end)

RegisterNUICallback('getIncidents', function(data, cb)
    TriggerServerEvent('mdt:server:getIncidents', data.filter or 'all')
    cb('ok')
end)

RegisterNUICallback('getIncidentDetail', function(data, cb)
    TriggerServerEvent('mdt:server:getIncidentDetail', data.incidentId)
    cb('ok')
end)

RegisterNUICallback('createIncident', function(data, cb)
    TriggerServerEvent('mdt:server:createIncident', data)
    cb('ok')
end)

RegisterNUICallback('updateIncident', function(data, cb)
    TriggerServerEvent('mdt:server:updateIncident', data.incidentId, data)
    cb('ok')
end)

RegisterNUICallback('getDispatchCalls', function(data, cb)
    TriggerServerEvent('mdt:server:getDispatchCalls')
    cb('ok')
end)

RegisterNUICallback('createDispatchCall', function(data, cb)
    TriggerServerEvent('mdt:server:createDispatchCall', data)
    cb('ok')
end)

RegisterNUICallback('updateCallStatus', function(data, cb)
    TriggerServerEvent('mdt:server:updateCallStatus', data.callId, data.status, data.units)
    cb('ok')
end)

RegisterNUICallback('getOnlineOfficers', function(data, cb)
    TriggerServerEvent('mdt:server:getOnlineOfficers')
    cb('ok')
end)

RegisterNUICallback('updateOfficerProfile', function(data, cb)
    TriggerServerEvent('mdt:server:updateOfficerProfile', data)
    cb('ok')
end)

RegisterNUICallback('updateLicense', function(data, cb)
    TriggerServerEvent('mdt:server:updateLicense', data.citizenId, data.licenseType, data.status, data.reason)
    cb('ok')
end)

-- ============================================
-- EVENEMENTS CLIENT (reponses du serveur)
-- ============================================

RegisterNetEvent('mdt:client:receiveOfficerData')
AddEventHandler('mdt:client:receiveOfficerData', function(data)
    SendNUIMessage({ action = 'setOfficerData', data = data })
end)

RegisterNetEvent('mdt:client:receiveDashboardData')
AddEventHandler('mdt:client:receiveDashboardData', function(data)
    SendNUIMessage({ action = 'setDashboardData', data = data })
end)

RegisterNetEvent('mdt:client:receiveCitizenSearch')
AddEventHandler('mdt:client:receiveCitizenSearch', function(data)
    SendNUIMessage({ action = 'setCitizenSearchResults', data = data })
end)

RegisterNetEvent('mdt:client:receiveCitizenProfile')
AddEventHandler('mdt:client:receiveCitizenProfile', function(data)
    SendNUIMessage({ action = 'setCitizenProfile', data = data })
end)

RegisterNetEvent('mdt:client:noteAdded')
AddEventHandler('mdt:client:noteAdded', function(success)
    SendNUIMessage({ action = 'noteAdded', data = { success = success } })
end)

RegisterNetEvent('mdt:client:flagToggled')
AddEventHandler('mdt:client:flagToggled', function(success)
    SendNUIMessage({ action = 'flagToggled', data = { success = success } })
end)

RegisterNetEvent('mdt:client:receiveVehicleSearch')
AddEventHandler('mdt:client:receiveVehicleSearch', function(data)
    SendNUIMessage({ action = 'setVehicleSearchResults', data = data })
end)

RegisterNetEvent('mdt:client:stolenReported')
AddEventHandler('mdt:client:stolenReported', function(success)
    SendNUIMessage({ action = 'stolenReported', data = { success = success } })
end)

RegisterNetEvent('mdt:client:receiveWarrants')
AddEventHandler('mdt:client:receiveWarrants', function(data)
    SendNUIMessage({ action = 'setWarrants', data = data })
end)

RegisterNetEvent('mdt:client:warrantCreated')
AddEventHandler('mdt:client:warrantCreated', function(success)
    SendNUIMessage({ action = 'warrantCreated', data = { success = success } })
end)

RegisterNetEvent('mdt:client:warrantUpdated')
AddEventHandler('mdt:client:warrantUpdated', function(success)
    SendNUIMessage({ action = 'warrantUpdated', data = { success = success } })
end)

RegisterNetEvent('mdt:client:receiveBolos')
AddEventHandler('mdt:client:receiveBolos', function(data)
    SendNUIMessage({ action = 'setBolos', data = data })
end)

RegisterNetEvent('mdt:client:boloCreated')
AddEventHandler('mdt:client:boloCreated', function(success)
    SendNUIMessage({ action = 'boloCreated', data = { success = success } })
end)

RegisterNetEvent('mdt:client:boloUpdated')
AddEventHandler('mdt:client:boloUpdated', function(success)
    SendNUIMessage({ action = 'boloUpdated', data = { success = success } })
end)

RegisterNetEvent('mdt:client:receiveIncidents')
AddEventHandler('mdt:client:receiveIncidents', function(data)
    SendNUIMessage({ action = 'setIncidents', data = data })
end)

RegisterNetEvent('mdt:client:receiveIncidentDetail')
AddEventHandler('mdt:client:receiveIncidentDetail', function(data)
    SendNUIMessage({ action = 'setIncidentDetail', data = data })
end)

RegisterNetEvent('mdt:client:incidentCreated')
AddEventHandler('mdt:client:incidentCreated', function(id)
    SendNUIMessage({ action = 'incidentCreated', data = { id = id } })
end)

RegisterNetEvent('mdt:client:incidentUpdated')
AddEventHandler('mdt:client:incidentUpdated', function(success)
    SendNUIMessage({ action = 'incidentUpdated', data = { success = success } })
end)

RegisterNetEvent('mdt:client:receiveDispatchCalls')
AddEventHandler('mdt:client:receiveDispatchCalls', function(data)
    SendNUIMessage({ action = 'setDispatchCalls', data = data })
end)

RegisterNetEvent('mdt:client:callCreated')
AddEventHandler('mdt:client:callCreated', function(success)
    SendNUIMessage({ action = 'callCreated', data = { success = success } })
end)

RegisterNetEvent('mdt:client:callUpdated')
AddEventHandler('mdt:client:callUpdated', function(success)
    SendNUIMessage({ action = 'callUpdated', data = { success = success } })
end)

RegisterNetEvent('mdt:client:newDispatchCall')
AddEventHandler('mdt:client:newDispatchCall', function(data)
    if not IsPolice() then return end
    -- Notification in-game
    if Config.Framework == 'esx' then
        Framework.ShowNotification('~b~[DISPATCH]~w~ ' .. data.type .. ' - ' .. data.location)
    elseif Config.Framework == 'qbcore' then
        Framework.Functions.Notify('[DISPATCH] ' .. data.type .. ' - ' .. data.location, 'primary')
    end
    -- Mise a jour du NUI si ouvert
    if isOpen then
        SendNUIMessage({ action = 'newDispatchAlert', data = data })
    end
end)

RegisterNetEvent('mdt:client:receiveOnlineOfficers')
AddEventHandler('mdt:client:receiveOnlineOfficers', function(data)
    SendNUIMessage({ action = 'setOnlineOfficers', data = data })
end)

RegisterNetEvent('mdt:client:profileUpdated')
AddEventHandler('mdt:client:profileUpdated', function(success)
    SendNUIMessage({ action = 'profileUpdated', data = { success = success } })
end)

RegisterNetEvent('mdt:client:licenseUpdated')
AddEventHandler('mdt:client:licenseUpdated', function(success)
    SendNUIMessage({ action = 'licenseUpdated', data = { success = success } })
end)

-- Fermer MDT avec Echap
CreateThread(function()
    while true do
        Wait(0)
        if isOpen then
            DisableControlAction(0, 1, true)
            DisableControlAction(0, 2, true)
            if IsDisabledControlJustReleased(0, 200) then -- ESC
                CloseMDT()
            end
        end
    end
end)

print('^2[LSPD-MDT]^0 Client charge avec succes.')
