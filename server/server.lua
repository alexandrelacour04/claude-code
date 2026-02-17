ESX = nil
local Database = exports['police-mdt']:Database()

TriggerEvent('esx:getSharedObject', function(obj)
    ESX = obj
end)

-- Initialiser la base de données au démarrage
AddEventHandler('onServerResourceStart', function(resourceName)
    if GetCurrentResourceName() == resourceName then
        if Config.EnableLogs then
            TriggerEvent('esx:getSharedObject', function(obj)
                ESX = obj
            end)
        end
        Database.init()
    end
end)

-- Événement pour récupérer les infos d'un citoyen
RegisterServerEvent('mdt:getCitizenInfo')
AddEventHandler('mdt:getCitizenInfo', function(firstname, lastname)
    local source = source
    local xPlayer = ESX.GetPlayerFromId(source)

    if not xPlayer or xPlayer.job.name ~= Config.PoliceJob then
        TriggerClientEvent('mdt:notification', source, 'Erreur', 'Vous n\'êtes pas autorisé!', 'error')
        return
    end

    local citizenInfo = Database.getCitizenInfo(firstname, lastname)
    TriggerClientEvent('mdt:citizenInfoReceived', source, citizenInfo)
end)

-- Événement pour récupérer les infos d'un véhicule
RegisterServerEvent('mdt:getVehicleInfo')
AddEventHandler('mdt:getVehicleInfo', function(plate)
    local source = source
    local xPlayer = ESX.GetPlayerFromId(source)

    if not xPlayer or xPlayer.job.name ~= Config.PoliceJob then
        TriggerClientEvent('mdt:notification', source, 'Erreur', 'Vous n\'êtes pas autorisé!', 'error')
        return
    end

    local vehicleInfo = Database.getVehicleInfo(plate)
    TriggerClientEvent('mdt:vehicleInfoReceived', source, vehicleInfo)
end)

-- Événement pour ajouter une citation
RegisterServerEvent('mdt:addCitation')
AddEventHandler('mdt:addCitation', function(citizenId, citationType, description, amount)
    local source = source
    local xPlayer = ESX.GetPlayerFromId(source)

    if not xPlayer or xPlayer.job.name ~= Config.PoliceJob then
        TriggerClientEvent('mdt:notification', source, 'Erreur', 'Vous n\'êtes pas autorisé!', 'error')
        return
    end

    local citationId = Database.addCitation(citizenId, xPlayer.source, citationType, description, amount)

    if citationId then
        TriggerClientEvent('mdt:notification', source, 'Succès', 'Citation ajoutée avec succès', 'success')
        TriggerClientEvent('mdt:citationAdded', source, citationId)
    else
        TriggerClientEvent('mdt:notification', source, 'Erreur', 'Impossible d\'ajouter la citation', 'error')
    end
end)

-- Événement pour ajouter un avis de recherche
RegisterServerEvent('mdt:addWanted')
AddEventHandler('mdt:addWanted', function(citizenId, reason, warrantType)
    local source = source
    local xPlayer = ESX.GetPlayerFromId(source)

    if not xPlayer or xPlayer.job.name ~= Config.PoliceJob then
        TriggerClientEvent('mdt:notification', source, 'Erreur', 'Vous n\'êtes pas autorisé!', 'error')
        return
    end

    -- Vérifie le grade minimum (Sergeant)
    local minGradeHierarchy = Config.Grades['sergeant'].hierarchy
    local playerGradeHierarchy = Config.Grades[xPlayer.job.grade].hierarchy

    if playerGradeHierarchy < minGradeHierarchy then
        TriggerClientEvent('mdt:notification', source, 'Erreur', 'Vous n\'avez pas le grade requis', 'error')
        return
    end

    local wantedId = Database.addWanted(citizenId, reason, warrantType, xPlayer.source)

    if wantedId then
        TriggerClientEvent('mdt:notification', source, 'Succès', 'Avis de recherche créé', 'success')
        TriggerClientEvent('mdt:wantedAdded', source, wantedId)
        -- Notifier tous les agents
        TriggerClientEvent('mdt:updateWantedList', -1)
    end
end)

-- Événement pour ajouter un rapport
RegisterServerEvent('mdt:addReport')
AddEventHandler('mdt:addReport', function(incidentType, description, location)
    local source = source
    local xPlayer = ESX.GetPlayerFromId(source)

    if not xPlayer or xPlayer.job.name ~= Config.PoliceJob then
        TriggerClientEvent('mdt:notification', source, 'Erreur', 'Vous n\'êtes pas autorisé!', 'error')
        return
    end

    local reportId = Database.addReport(xPlayer.source, incidentType, description, location)

    if reportId then
        TriggerClientEvent('mdt:notification', source, 'Succès', 'Rapport créé avec succès', 'success')
        TriggerClientEvent('mdt:reportAdded', source, reportId)
    end
end)

-- Événement pour ajouter un log d'appel
RegisterServerEvent('mdt:addCallLog')
AddEventHandler('mdt:addCallLog', function(callType, location, description)
    local source = source
    local xPlayer = ESX.GetPlayerFromId(source)

    if not xPlayer or xPlayer.job.name ~= Config.PoliceJob then
        TriggerClientEvent('mdt:notification', source, 'Erreur', 'Vous n\'êtes pas autorisé!', 'error')
        return
    end

    local logId = Database.addCallLog(callType, location, description, xPlayer.source)

    if logId then
        TriggerClientEvent('mdt:notification', source, 'Succès', 'Log d\'appel créé', 'success')
        TriggerClientEvent('mdt:callLogAdded', source, logId)
        -- Notifier tous les agents
        TriggerClientEvent('mdt:updateCallLogs', -1)
    end
end)

-- Événement pour récupérer les données du MDT
RegisterServerEvent('mdt:getData')
AddEventHandler('mdt:getData', function(dataType)
    local source = source
    local xPlayer = ESX.GetPlayerFromId(source)

    if not xPlayer or xPlayer.job.name ~= Config.PoliceJob then
        return
    end

    if dataType == 'wanted' then
        local wanted = Database.getWantedList()
        TriggerClientEvent('mdt:dataReceived', source, 'wanted', wanted)
    elseif dataType == 'call_logs' then
        local callLogs = Database.getCallLogs(50)
        TriggerClientEvent('mdt:dataReceived', source, 'call_logs', callLogs)
    end
end)

-- Export pour vérifier si un joueur est flic
function IsPlayerCop(playerId)
    local xPlayer = ESX.GetPlayerFromId(playerId)
    return xPlayer and xPlayer.job.name == Config.PoliceJob or false
end

-- Export pour ouvrir le MDT
function OpenMDT(playerId)
    TriggerClientEvent('mdt:toggleMDT', playerId, true)
end

-- Export pour fermer le MDT
function CloseMDT(playerId)
    TriggerClientEvent('mdt:toggleMDT', playerId, false)
end

-- Export pour basculer le MDT
function ToggleMDT(playerId)
    TriggerClientEvent('mdt:toggleMDT', playerId, nil)
end

-- Export pour changer le grade d'un joueur de manière dynamique
function SetPlayerGrade(playerId, grade)
    local xPlayer = ESX.GetPlayerFromId(playerId)
    if xPlayer then
        xPlayer.setJob(Config.PoliceJob, grade)
        return true
    end
    return false
end

exports('OpenMDT', OpenMDT)
exports('CloseMDT', CloseMDT)
exports('ToggleMDT', ToggleMDT)
exports('SetPlayerGrade', SetPlayerGrade)
exports('IsPlayerCop', IsPlayerCop)

print('^2[MDT] Server initialized^7')
