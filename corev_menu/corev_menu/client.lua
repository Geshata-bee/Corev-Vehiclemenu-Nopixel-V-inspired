local isOpen   = false
local veh      = 0
local windows  = {}
local lights   = {}
local hazards  = {}

local DOOR   = { door_fl = 0, door_fr = 1, door_rl = 2, door_rr = 3, hood = 4, trunk = 5 }
local WINDOW = { win_fl = 0, win_fr = 1, win_rl = 2, win_rr = 3 }
local SEAT   = { seat_d = -1, seat_p = 0, seat_rl = 1, seat_rr = 2 }

local function notify(msg)
    BeginTextCommandThefeedPost('STRING')
    AddTextComponentSubstringPlayerName(msg)
    EndTextCommandThefeedPostTicker(false, false)
end

local function getTarget()
    local ped = PlayerPedId()
    local v = GetVehiclePedIsIn(ped, false)
    if v ~= 0 then return v end
    local c = GetEntityCoords(ped)
    v = GetClosestVehicle(c.x, c.y, c.z, Config.MaxDistance + 0.0, 0, 71)
    if v ~= 0 and DoesEntityExist(v) then return v end
    return nil
end

local function takeControl(v)
    if NetworkHasControlOfEntity(v) then return end
    NetworkRequestControlOfEntity(v)
    local t = GetGameTimer() + 500
    while not NetworkHasControlOfEntity(v) and GetGameTimer() < t do Wait(0) end
end

local function vehicleName(v)
    local model = GetEntityModel(v)
    local label = GetLabelText(GetDisplayNameFromVehicleModel(model))
    if label == 'NULL' or label == '' then label = GetDisplayNameFromVehicleModel(model) end
    return label
end

local function buildState(v)
    local ped = PlayerPedId()
    local s = {}
    for id, idx in pairs(DOOR) do
        s[id] = GetVehicleDoorAngleRatio(v, idx) > 0.1
    end
    for id, idx in pairs(WINDOW) do
        s[id] = windows[v] and windows[v][idx] or false
    end
    for id, seat in pairs(SEAT) do
        s[id] = GetPedInVehicleSeat(v, seat) == ped
    end
    s.engine = GetIsVehicleEngineRunning(v)
    s.lights = lights[v] or false
    s.hazard = hazards[v] or false
    return s
end

local function doAction(v, id)
    takeControl(v)

    if DOOR[id] then
        local idx = DOOR[id]
        if GetVehicleDoorAngleRatio(v, idx) > 0.1 then
            SetVehicleDoorShut(v, idx, false)
        else
            SetVehicleDoorOpen(v, idx, false, false)
        end

    elseif WINDOW[id] then
        local idx = WINDOW[id]
        windows[v] = windows[v] or {}
        if windows[v][idx] then
            RollUpWindow(v, idx)
            windows[v][idx] = false
        else
            RollDownWindow(v, idx)
            windows[v][idx] = true
        end

    elseif SEAT[id] then
        local seat = SEAT[id]
        local ped = PlayerPedId()
        if GetPedInVehicleSeat(v, seat) ~= ped then
            if seat < GetVehicleModelNumberOfSeats(GetEntityModel(v)) - 1 and IsVehicleSeatFree(v, seat) then
                SetPedIntoVehicle(ped, v, seat)
            else
                notify('That seat is not available.')
            end
        end

    elseif id == 'engine' then
        local on = not GetIsVehicleEngineRunning(v)
        SetVehicleEngineOn(v, on, false, true)

    elseif id == 'lights' then
        lights[v] = not lights[v]
        SetVehicleLights(v, lights[v] and 2 or 0)

    elseif id == 'hazard' then
        hazards[v] = not hazards[v]
        SetVehicleIndicatorLights(v, 0, hazards[v])
        SetVehicleIndicatorLights(v, 1, hazards[v])
    end
end

local function closeMenu()
    if not isOpen then return end
    isOpen = false
    SetNuiFocus(false, false)
    SendNUIMessage({ action = 'close' })
end

local function openMenu()
    if isOpen then return end
    local v = getTarget()
    if not v then
        notify('No vehicle nearby.')
        return
    end
    veh = v
    isOpen = true
    SetNuiFocus(true, true)
    SendNUIMessage({
        action = 'open',
        name   = vehicleName(v),
        state  = buildState(v),
        seats  = GetVehicleModelNumberOfSeats(GetEntityModel(v)),
        doors  = {
            fl = GetIsDoorValid(v, 0),
            fr = GetIsDoorValid(v, 1),
            rl = GetIsDoorValid(v, 2),
            rr = GetIsDoorValid(v, 3)
        },
        config = { background = Config.Background }
    })

    CreateThread(function()
        while isOpen do
            if not DoesEntityExist(veh) or #(GetEntityCoords(PlayerPedId()) - GetEntityCoords(veh)) > (Config.MaxDistance + 4.0) then
                closeMenu()
                break
            end
            SendNUIMessage({ action = 'state', state = buildState(veh) })
            Wait(400)
        end
    end)
end

RegisterCommand(Config.Command, function()
    if isOpen then closeMenu() else openMenu() end
end, false)

RegisterKeyMapping(Config.Command, 'COREV MENU - open vehicle menu', 'keyboard', Config.Key)

RegisterNUICallback('action', function(data, cb)
    if isOpen and DoesEntityExist(veh) and data and data.id then
        doAction(veh, data.id)
        Wait(60)
        cb(buildState(veh))
    else
        cb({})
    end
end)

RegisterNUICallback('close', function(_, cb)
    closeMenu()
    cb({})
end)

AddEventHandler('onResourceStop', function(res)
    if res == GetCurrentResourceName() and isOpen then
        SetNuiFocus(false, false)
    end
end)
