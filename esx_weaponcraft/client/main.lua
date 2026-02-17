-- ============================================================
-- esx_weaponcraft - Client
-- ============================================================

local ESX = exports['es_extended']:getSharedObject()

local PlayerData  = {}
local isInJob     = false
local isBusy      = false
local spawnedVeh  = nil
local nuiOpen     = false

-- ============================================================
-- INIT
-- ============================================================
RegisterNetEvent('esx:playerLoaded')
AddEventHandler('esx:playerLoaded', function(xPlayer)
    PlayerData = xPlayer
    isInJob = (PlayerData.job and PlayerData.job.name == Config.JobName)
end)

RegisterNetEvent('esx:setJob')
AddEventHandler('esx:setJob', function(job)
    PlayerData.job = job
    isInJob = (job.name == Config.JobName)
end)

CreateThread(function()
    while not ESX.IsPlayerLoaded() do Wait(100) end
    PlayerData = ESX.GetPlayerData()
    isInJob = (PlayerData.job and PlayerData.job.name == Config.JobName)
end)

-- ============================================================
-- BLIPS
-- ============================================================
CreateThread(function()
    while not ESX.IsPlayerLoaded() do Wait(500) end

    local function CreateJobBlip(coords, cfg)
        local blip = AddBlipForCoord(coords.x, coords.y, coords.z)
        SetBlipSprite(blip, cfg.sprite)
        SetBlipDisplay(blip, 4)
        SetBlipScale(blip, cfg.scale)
        SetBlipColour(blip, cfg.color)
        SetBlipAsShortRange(blip, true)
        BeginTextCommandSetBlipName('STRING')
        AddTextComponentSubstringPlayerName(cfg.label)
        EndTextCommandSetBlipName(blip)
    end

    -- Recolte
    for _, v in ipairs(Config.HarvestPoints) do
        if v.blip then CreateJobBlip(v.coords, Config.Blips.Harvest) end
    end
    -- Fabrication normale
    for _, v in ipairs(Config.CraftPoints) do
        if v.blip then CreateJobBlip(v.coords, Config.Blips.Craft) end
    end
    -- Fabrication speciale
    if Config.CraftSpecialPoint.blip then
        CreateJobBlip(Config.CraftSpecialPoint.coords, Config.Blips.CraftSpec)
    end
    -- Vente Ammunation
    if Config.SellPoint.blip then
        CreateJobBlip(Config.SellPoint.coords, Config.Blips.Sell)
    end
    -- Vente auto
    if Config.AutoSellPoint.blip then
        CreateJobBlip(Config.AutoSellPoint.coords, Config.Blips.AutoSell)
    end
    -- Vehicule
    if Config.VehicleSpawn.blip then
        CreateJobBlip(Config.VehicleSpawn.coords, Config.Blips.Vehicle)
    end
    -- Boss
    if Config.BossPoint.blip then
        CreateJobBlip(Config.BossPoint.coords, Config.Blips.Boss)
    end
end)

-- ============================================================
-- HELPERS
-- ============================================================
local function DrawMarkerLocal(markerCfg, coords)
    DrawMarker(
        markerCfg.type, coords.x, coords.y, coords.z - 0.98,
        0, 0, 0, 0, 0, 0,
        Config.MarkerSize.x, Config.MarkerSize.y, Config.MarkerSize.z,
        markerCfg.color.r, markerCfg.color.g, markerCfg.color.b, markerCfg.color.a,
        false, true, 2, nil, nil, false
    )
end

local function DrawText3DLocal(coords, text)
    SetTextScale(0.35, 0.35)
    SetTextFont(4)
    SetTextProportional(true)
    SetTextColour(255, 255, 255, 215)
    SetTextEntry('STRING')
    SetTextCentre(true)
    AddTextComponentString(text)
    SetDrawOrigin(coords.x, coords.y, coords.z, 0)
    DrawText(0.0, 0.0)
    ClearDrawOrigin()
end

local function ShowNotification(msg, type)
    SendNUIMessage({
        action = 'notification',
        message = msg,
        type = type or 'info'
    })
end

local function HasMinGrade(minGrade)
    if not PlayerData.job then return false end
    return PlayerData.job.grade >= minGrade
end

local function PlayAnim(dict, clip, duration)
    RequestAnimDict(dict)
    while not HasAnimDictLoaded(dict) do Wait(10) end
    TaskPlayAnim(PlayerPedId(), dict, clip, 8.0, -8.0, duration, 1, 0, false, false, false)
end

-- ============================================================
-- NUI CALLBACKS
-- ============================================================
RegisterNUICallback('closeMenu', function(_, cb)
    SetNuiFocus(false, false)
    nuiOpen = false
    cb('ok')
end)

RegisterNUICallback('craftItem', function(data, cb)
    if isBusy then
        cb({success = false})
        return
    end
    TriggerServerEvent('weaponcraft:craft', data.recipeName, data.craftType)
    cb({success = true})
end)

RegisterNUICallback('sellWeapon', function(data, cb)
    TriggerServerEvent('weaponcraft:sellWeapon', data.weaponName)
    cb({success = true})
end)

RegisterNUICallback('stockItem', function(data, cb)
    TriggerServerEvent('weaponcraft:stockItem', data.itemName, data.amount)
    cb({success = true})
end)

RegisterNUICallback('buyFromAutoSell', function(data, cb)
    TriggerServerEvent('weaponcraft:buyFromAutoSell', data.itemName)
    cb({success = true})
end)

-- Boss menu NUI callbacks
RegisterNUICallback('boss:hire', function(data, cb)
    TriggerServerEvent('weaponcraft:boss:hire', data.playerId)
    cb({success = true})
end)

RegisterNUICallback('boss:fire', function(data, cb)
    TriggerServerEvent('weaponcraft:boss:fire', data.playerId)
    cb({success = true})
end)

RegisterNUICallback('boss:promote', function(data, cb)
    TriggerServerEvent('weaponcraft:boss:promote', data.playerId)
    cb({success = true})
end)

RegisterNUICallback('boss:demote', function(data, cb)
    TriggerServerEvent('weaponcraft:boss:demote', data.playerId)
    cb({success = true})
end)

RegisterNUICallback('boss:setSalary', function(data, cb)
    TriggerServerEvent('weaponcraft:boss:setSalary', data.grade, data.salary)
    cb({success = true})
end)

RegisterNUICallback('boss:setPrice', function(data, cb)
    TriggerServerEvent('weaponcraft:boss:setPrice', data.itemName, data.price)
    cb({success = true})
end)

RegisterNUICallback('boss:getMoney', function(_, cb)
    TriggerServerEvent('weaponcraft:boss:getMoney')
    cb({success = true})
end)

RegisterNUICallback('boss:withdraw', function(data, cb)
    TriggerServerEvent('weaponcraft:boss:withdraw', data.amount)
    cb({success = true})
end)

RegisterNUICallback('boss:deposit', function(data, cb)
    TriggerServerEvent('weaponcraft:boss:deposit', data.amount)
    cb({success = true})
end)

-- F6 Menu callbacks
RegisterNUICallback('f6:invoice', function(data, cb)
    TriggerServerEvent('weaponcraft:f6:invoice', data.playerId, data.amount, data.reason)
    cb({success = true})
end)

RegisterNUICallback('f6:givePPA', function(data, cb)
    TriggerServerEvent('weaponcraft:f6:givePPA', data.playerId)
    cb({success = true})
end)

RegisterNUICallback('f6:removePPA', function(data, cb)
    TriggerServerEvent('weaponcraft:f6:removePPA', data.playerId)
    cb({success = true})
end)

-- Vehicle callback
RegisterNUICallback('spawnVehicle', function(data, cb)
    local model = data.model
    if spawnedVeh and DoesEntityExist(spawnedVeh) then
        DeleteVehicle(spawnedVeh)
        spawnedVeh = nil
    end

    local hash = GetHashKey(model)
    RequestModel(hash)
    while not HasModelLoaded(hash) do Wait(10) end

    local coords = Config.VehicleSpawn.coords
    local veh = CreateVehicle(hash, coords.x, coords.y, coords.z, Config.VehicleSpawn.heading, true, false)
    SetEntityAsMissionEntity(veh, true, true)
    SetVehicleNumberPlateText(veh, 'ARMU-' .. math.random(100, 999))
    SetVehicleColours(veh, 0, 0)
    TaskWarpPedIntoVehicle(PlayerPedId(), veh, -1)
    spawnedVeh = veh
    SetModelAsNoLongerNeeded(hash)

    ShowNotification('Vehicule sorti !', 'success')
    SetNuiFocus(false, false)
    nuiOpen = false
    cb({success = true})
end)

-- ============================================================
-- SERVER EVENTS
-- ============================================================
RegisterNetEvent('weaponcraft:notify')
AddEventHandler('weaponcraft:notify', function(msg, type)
    ShowNotification(msg, type)
end)

RegisterNetEvent('weaponcraft:startCraftAnim')
AddEventHandler('weaponcraft:startCraftAnim', function(duration)
    isBusy = true
    PlayAnim('mini@repair', 'fixing_a_player', duration)

    SetNuiFocus(false, false)
    nuiOpen = false

    -- Progress bar via NUI
    SendNUIMessage({
        action = 'progressBar',
        duration = duration,
        label = 'Fabrication en cours...'
    })

    SetTimeout(duration, function()
        isBusy = false
        ClearPedTasks(PlayerPedId())
    end)
end)

RegisterNetEvent('weaponcraft:openBossMenu')
AddEventHandler('weaponcraft:openBossMenu', function(data)
    SetNuiFocus(true, true)
    nuiOpen = true
    SendNUIMessage({
        action   = 'openBossMenu',
        employees = data.employees,
        grades    = Config.Grades,
        prices    = data.prices,
        society   = data.society,
        nearbyPlayers = data.nearbyPlayers,
    })
end)

RegisterNetEvent('weaponcraft:updateBossData')
AddEventHandler('weaponcraft:updateBossData', function(data)
    SendNUIMessage({
        action    = 'updateBossData',
        employees = data.employees,
        prices    = data.prices,
        society   = data.society,
    })
end)

RegisterNetEvent('weaponcraft:openAutoSell')
AddEventHandler('weaponcraft:openAutoSell', function(stock)
    SetNuiFocus(true, true)
    nuiOpen = true
    local isEmployee = isInJob
    SendNUIMessage({
        action     = 'openAutoSell',
        stock      = stock,
        isEmployee = isEmployee,
        prices     = Config.DefaultSellPrices,
    })
end)

-- ============================================================
-- MAIN LOOP - MARKERS + INTERACTIONS
-- ============================================================
CreateThread(function()
    while true do
        local sleep = 500
        local ped = PlayerPedId()
        local pCoords = GetEntityCoords(ped)

        if isInJob then
            -- ========== RECOLTE ==========
            for i, harvest in ipairs(Config.HarvestPoints) do
                local dist = #(pCoords - harvest.coords)
                if dist < Config.DrawDistance then
                    sleep = 0
                    DrawMarkerLocal(Config.Markers.Harvest, harvest.coords)
                    if dist < 1.5 then
                        DrawText3DLocal(harvest.coords + vector3(0, 0, 0.8), harvest.label)
                        if IsControlJustReleased(0, 38) and not isBusy then -- E
                            if HasMinGrade(harvest.minGrade) then
                                isBusy = true
                                PlayAnim(harvest.anim.dict, harvest.anim.clip, harvest.time)
                                SendNUIMessage({
                                    action   = 'progressBar',
                                    duration = harvest.time,
                                    label    = 'Recolte de ' .. harvest.itemLabel .. '...'
                                })
                                SetTimeout(harvest.time, function()
                                    ClearPedTasks(PlayerPedId())
                                    TriggerServerEvent('weaponcraft:harvest', i)
                                    isBusy = false
                                end)
                            else
                                ShowNotification('Grade insuffisant !', 'error')
                            end
                        end
                    end
                end
            end

            -- ========== FABRICATION NORMALE ==========
            for _, craft in ipairs(Config.CraftPoints) do
                local dist = #(pCoords - craft.coords)
                if dist < Config.DrawDistance then
                    sleep = 0
                    DrawMarkerLocal(Config.Markers.Craft, craft.coords)
                    if dist < 1.5 then
                        DrawText3DLocal(craft.coords + vector3(0, 0, 0.8), craft.label)
                        if IsControlJustReleased(0, 38) and not isBusy and not nuiOpen then
                            if HasMinGrade(craft.minGrade) then
                                SetNuiFocus(true, true)
                                nuiOpen = true
                                SendNUIMessage({
                                    action  = 'openCraftMenu',
                                    recipes = Config.NormalRecipes,
                                    type    = 'normal',
                                    title   = 'Fabrication - Armes Standard'
                                })
                            else
                                ShowNotification('Grade insuffisant !', 'error')
                            end
                        end
                    end
                end
            end

            -- ========== FABRICATION SPECIALE ==========
            local distSpec = #(pCoords - Config.CraftSpecialPoint.coords)
            if distSpec < Config.DrawDistance then
                sleep = 0
                DrawMarkerLocal(Config.Markers.Special, Config.CraftSpecialPoint.coords)
                if distSpec < 1.5 then
                    DrawText3DLocal(Config.CraftSpecialPoint.coords + vector3(0, 0, 0.8), Config.CraftSpecialPoint.label)
                    if IsControlJustReleased(0, 38) and not isBusy and not nuiOpen then
                        if HasMinGrade(Config.CraftSpecialPoint.minGrade) then
                            SetNuiFocus(true, true)
                            nuiOpen = true
                            SendNUIMessage({
                                action  = 'openCraftMenu',
                                recipes = Config.SpecialRecipes,
                                type    = 'special',
                                title   = 'Fabrication - Armes Speciales'
                            })
                        else
                            ShowNotification('Grade insuffisant ! (Expert minimum)', 'error')
                        end
                    end
                end
            end

            -- ========== VENTE AMMUNATION ==========
            local distSell = #(pCoords - Config.SellPoint.coords)
            if distSell < Config.DrawDistance then
                sleep = 0
                DrawMarkerLocal(Config.Markers.Sell, Config.SellPoint.coords)
                if distSell < 1.5 then
                    DrawText3DLocal(Config.SellPoint.coords + vector3(0, 0, 0.8), Config.SellPoint.label)
                    if IsControlJustReleased(0, 38) and not isBusy and not nuiOpen then
                        TriggerServerEvent('weaponcraft:openSellMenu')
                    end
                end
            end

            -- ========== VENTE AUTOMATIQUE (employes: stocker / clients: acheter) ==========
            local distAuto = #(pCoords - Config.AutoSellPoint.coords)
            if distAuto < Config.DrawDistance then
                sleep = 0
                DrawMarkerLocal(Config.Markers.AutoSell, Config.AutoSellPoint.coords)
                if distAuto < 1.5 then
                    DrawText3DLocal(Config.AutoSellPoint.coords + vector3(0, 0, 0.8), Config.AutoSellPoint.label)
                    if IsControlJustReleased(0, 38) and not nuiOpen then
                        TriggerServerEvent('weaponcraft:getAutoSellStock')
                    end
                end
            end

            -- ========== VEHICULE ==========
            local distVeh = #(pCoords - Config.VehicleSpawn.coords)
            if distVeh < Config.DrawDistance then
                sleep = 0
                DrawMarkerLocal(Config.Markers.Vehicle, Config.VehicleSpawn.coords)
                if distVeh < 1.5 then
                    DrawText3DLocal(Config.VehicleSpawn.coords + vector3(0, 0, 0.8), Config.VehicleSpawn.label)
                    if IsControlJustReleased(0, 38) and not nuiOpen then
                        -- Filtrer vehicules par grade
                        local available = {}
                        for _, veh in ipairs(Config.VehicleSpawn.vehicles) do
                            if HasMinGrade(veh.minGrade) then
                                table.insert(available, veh)
                            end
                        end
                        SetNuiFocus(true, true)
                        nuiOpen = true
                        SendNUIMessage({
                            action   = 'openVehicleMenu',
                            vehicles = available,
                        })
                    end
                end
            end

            -- ========== BOSS MENU ==========
            local distBoss = #(pCoords - Config.BossPoint.coords)
            if distBoss < Config.DrawDistance then
                sleep = 0
                DrawMarkerLocal(Config.Markers.Boss, Config.BossPoint.coords)
                if distBoss < 1.5 then
                    DrawText3DLocal(Config.BossPoint.coords + vector3(0, 0, 0.8), Config.BossPoint.label)
                    if IsControlJustReleased(0, 38) and not nuiOpen then
                        if PlayerData.job.grade_name == Config.BossGrade then
                            TriggerServerEvent('weaponcraft:openBossMenu')
                        else
                            ShowNotification('Seul le patron peut acceder a ce menu !', 'error')
                        end
                    end
                end
            end
        else
            -- Non employe : acces vente automatique uniquement
            local distAuto = #(pCoords - Config.AutoSellPoint.coords)
            if distAuto < Config.DrawDistance then
                sleep = 0
                DrawMarkerLocal(Config.Markers.AutoSell, Config.AutoSellPoint.coords)
                if distAuto < 1.5 then
                    DrawText3DLocal(Config.AutoSellPoint.coords + vector3(0, 0, 0.8), '~p~Boutique d\'Armes~s~\n~w~Appuyez sur ~g~[E]~w~ pour acheter')
                    if IsControlJustReleased(0, 38) and not nuiOpen then
                        TriggerServerEvent('weaponcraft:getAutoSellStock')
                    end
                end
            end
        end

        Wait(sleep)
    end
end)

-- ============================================================
-- SELL MENU (from server)
-- ============================================================
RegisterNetEvent('weaponcraft:openSellMenuClient')
AddEventHandler('weaponcraft:openSellMenuClient', function(weapons, prices)
    SetNuiFocus(true, true)
    nuiOpen = true
    SendNUIMessage({
        action  = 'openSellMenu',
        weapons = weapons,
        prices  = prices,
    })
end)

-- ============================================================
-- F6 MENU
-- ============================================================
RegisterCommand('+weaponcraftMenu', function()
    if not isInJob or nuiOpen or isBusy then return end

    -- Get nearby players
    local ped = PlayerPedId()
    local pCoords = GetEntityCoords(ped)
    local nearbyPlayers = {}

    for _, playerId in ipairs(GetActivePlayers()) do
        local targetPed = GetPlayerPed(playerId)
        if targetPed ~= ped then
            local targetCoords = GetEntityCoords(targetPed)
            if #(pCoords - targetCoords) < 5.0 then
                table.insert(nearbyPlayers, {
                    id = GetPlayerServerId(playerId),
                    name = GetPlayerName(playerId)
                })
            end
        end
    end

    SetNuiFocus(true, true)
    nuiOpen = true
    SendNUIMessage({
        action = 'openF6Menu',
        nearbyPlayers = nearbyPlayers,
        jobLabel = PlayerData.job.label,
        gradeLabel = PlayerData.job.grade_label,
    })
end, false)

RegisterKeyMapping('+weaponcraftMenu', 'Menu Job Armurier', 'keyboard', Config.F6KeyMapping)

-- ============================================================
-- CLEANUP on resource stop
-- ============================================================
AddEventHandler('onResourceStop', function(resourceName)
    if resourceName == GetCurrentResourceName() then
        if spawnedVeh and DoesEntityExist(spawnedVeh) then
            DeleteVehicle(spawnedVeh)
        end
        SetNuiFocus(false, false)
    end
end)
