ESX = nil
local MDTOpen = false
local MenuOpen = false

TriggerEvent('esx:getSharedObject', function(obj)
    ESX = obj
end)

-- Attendre que ESX soit prêt
AddEventHandler('esx:playerLoaded', function()
    ESX = ESX or {}
end)

-- Ouvrir/Fermer le MDT avec la clé F10
Citizen.CreateThread(function()
    while true do
        Wait(10)

        if IsControlJustReleased(0, GetHashKey(Config.OpenKey)) then
            if IsPlayerCop() then
                ToggleMDT()
            else
                TriggerEvent('chat:addMessage', {
                    args = {'MDT', 'Vous n\'êtes pas flic!'},
                    color = {255, 0, 0}
                })
            end
        end
    end
end)

-- Vérifier si le joueur est flic
function IsPlayerCop()
    if ESX and ESX.PlayerData and ESX.PlayerData.job then
        return ESX.PlayerData.job.name == Config.PoliceJob
    end
    return false
end

-- Basculer l'interface MDT
function ToggleMDT()
    MDTOpen = not MDTOpen
    SendNUIMessage({
        type = 'toggleMDT',
        open = MDTOpen,
        playerGrade = ESX.PlayerData.job.grade,
        playerName = ESX.PlayerData.firstName .. ' ' .. ESX.PlayerData.lastName
    })
    SetNuiFocus(MDTOpen, MDTOpen)
end

-- Fermer le MDT avec Echap
Citizen.CreateThread(function()
    while true do
        Wait(0)
        if MDTOpen and IsControlJustReleased(0, 322) then -- ESC
            MDTOpen = false
            SendNUIMessage({
                type = 'toggleMDT',
                open = false
            })
            SetNuiFocus(false, false)
        end
    end
end)

-- Recevoir les messages de l'interface NUI
RegisterNUICallback('search_citizen', function(data, cb)
    TriggerServerEvent('mdt:getCitizenInfo', data.firstname, data.lastname)
    cb('ok')
end)

RegisterNUICallback('search_vehicle', function(data, cb)
    TriggerServerEvent('mdt:getVehicleInfo', data.plate)
    cb('ok')
end)

RegisterNUICallback('add_citation', function(data, cb)
    TriggerServerEvent('mdt:addCitation', data.citizenId, data.type, data.description, data.amount)
    cb('ok')
end)

RegisterNUICallback('add_wanted', function(data, cb)
    TriggerServerEvent('mdt:addWanted', data.citizenId, data.reason, data.type)
    cb('ok')
end)

RegisterNUICallback('add_report', function(data, cb)
    TriggerServerEvent('mdt:addReport', data.type, data.description, data.location)
    cb('ok')
end)

RegisterNUICallback('add_call_log', function(data, cb)
    TriggerServerEvent('mdt:addCallLog', data.type, data.location, data.description)
    cb('ok')
end)

RegisterNUICallback('get_data', function(data, cb)
    TriggerServerEvent('mdt:getData', data.type)
    cb('ok')
end)

RegisterNUICallback('close', function(data, cb)
    ToggleMDT()
    cb('ok')
end)

-- Recevoir les réponses du serveur
RegisterNetEvent('mdt:notification')
AddEventHandler('mdt:notification', function(title, message, type)
    SendNUIMessage({
        type = 'notification',
        title = title,
        message = message,
        notificationType = type
    })
end)

RegisterNetEvent('mdt:citizenInfoReceived')
AddEventHandler('mdt:citizenInfoReceived', function(citizenInfo)
    SendNUIMessage({
        type = 'citizenInfoReceived',
        data = citizenInfo
    })
end)

RegisterNetEvent('mdt:vehicleInfoReceived')
AddEventHandler('mdt:vehicleInfoReceived', function(vehicleInfo)
    SendNUIMessage({
        type = 'vehicleInfoReceived',
        data = vehicleInfo
    })
end)

RegisterNetEvent('mdt:citationAdded')
AddEventHandler('mdt:citationAdded', function(citationId)
    SendNUIMessage({
        type = 'citationAdded',
        id = citationId
    })
end)

RegisterNetEvent('mdt:wantedAdded')
AddEventHandler('mdt:wantedAdded', function(wantedId)
    SendNUIMessage({
        type = 'wantedAdded',
        id = wantedId
    })
end)

RegisterNetEvent('mdt:reportAdded')
AddEventHandler('mdt:reportAdded', function(reportId)
    SendNUIMessage({
        type = 'reportAdded',
        id = reportId
    })
end)

RegisterNetEvent('mdt:callLogAdded')
AddEventHandler('mdt:callLogAdded', function(logId)
    SendNUIMessage({
        type = 'callLogAdded',
        id = logId
    })
end)

RegisterNetEvent('mdt:updateWantedList')
AddEventHandler('mdt:updateWantedList', function()
    SendNUIMessage({
        type = 'updateWantedList'
    })
end)

RegisterNetEvent('mdt:updateCallLogs')
AddEventHandler('mdt:updateCallLogs', function()
    SendNUIMessage({
        type = 'updateCallLogs'
    })
end)

RegisterNetEvent('mdt:dataReceived')
AddEventHandler('mdt:dataReceived', function(dataType, data)
    SendNUIMessage({
        type = 'dataReceived',
        dataType = dataType,
        data = data
    })
end)

-- Export pour ouvrir le MDT depuis d'autres ressources
function OpenMDT()
    if IsPlayerCop() then
        if not MDTOpen then
            ToggleMDT()
        end
    end
end

exports('OpenMDT', OpenMDT)

print('^2[MDT] Client initialized^7')
