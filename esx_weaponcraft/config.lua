Config = {}

-- ============================================================
-- GENERAL
-- ============================================================
Config.JobName       = 'weaponcraft'
Config.Locale        = 'fr'
Config.DrawDistance   = 15.0
Config.MarkerSize    = {x = 1.5, y = 1.5, z = 0.5}
Config.UseTarget     = false -- true = ox_target / false = markers + E

-- ============================================================
-- BLIPS
-- ============================================================
Config.Blips = {
    Harvest    = {sprite = 365, color = 47, scale = 0.8, label = 'Recolte Armurier'},
    Craft      = {sprite = 566, color = 5,  scale = 0.8, label = 'Fabrication Armes'},
    CraftSpec  = {sprite = 110, color = 1,  scale = 0.8, label = 'Fabrication Speciale'},
    Sell       = {sprite = 110, color = 2,  scale = 0.8, label = 'Vente Ammunation'},
    AutoSell   = {sprite = 52,  color = 3,  scale = 0.8, label = 'Vente Automatique'},
    Vehicle    = {sprite = 326, color = 4,  scale = 0.7, label = 'Vehicule Armurier'},
    Boss       = {sprite = 496, color = 46, scale = 0.8, label = 'Gestion Patron'},
}

-- ============================================================
-- GRADES (indices dans la DB)
-- ============================================================
Config.Grades = {
    {name = 'recruit',   label = 'Recrue',          salary = 500},
    {name = 'worker',    label = 'Ouvrier',         salary = 800},
    {name = 'craftsman', label = 'Artisan',         salary = 1200},
    {name = 'expert',    label = 'Expert',          salary = 1800},
    {name = 'boss',      label = 'Patron',          salary = 2500},
}

Config.BossGrade = 'boss'

-- ============================================================
-- POINTS DE RECOLTE (3 differents)
-- ============================================================
Config.HarvestPoints = {
    -- Point 1: Carriere (minerai de metal) - Davis Quartz
    {
        coords  = vector3(2954.13, 2774.58, 39.31),
        label   = '~b~Carriere de Metal~s~\n~w~Appuyez sur ~g~[E]~w~ pour recolter',
        item    = 'metalbrut',
        itemLabel = 'Metal Brut',
        amount  = {min = 1, max = 3},
        time    = 8000, -- ms
        anim    = {dict = 'mini@repair', clip = 'fixing_a_player'},
        minGrade = 0,
        blip    = true,
    },
    -- Point 2: Zone chimique (composants chimiques) - Humane Labs ext.
    {
        coords  = vector3(3540.74, 3675.59, 28.12),
        label   = '~y~Zone Chimique~s~\n~w~Appuyez sur ~g~[E]~w~ pour recolter',
        item    = 'composantchimique',
        itemLabel = 'Composant Chimique',
        amount  = {min = 1, max = 2},
        time    = 10000,
        anim    = {dict = 'anim@narcotics@trash', clip = 'pickup'},
        minGrade = 0,
        blip    = true,
    },
    -- Point 3: Foret (poudre / bois) - Paleto Forest
    {
        coords  = vector3(-557.89, 5336.71, 74.17),
        label   = '~g~Zone Forestiere~s~\n~w~Appuyez sur ~g~[E]~w~ pour recolter',
        item    = 'poudrearme',
        itemLabel = 'Poudre d\'Arme',
        amount  = {min = 1, max = 2},
        time    = 9000,
        anim    = {dict = 'melee@hatchet@streamed_core', clip = 'plyr_base'},
        minGrade = 0,
        blip    = true,
    },
}

-- ============================================================
-- POINTS DE FABRICATION - ARMES NORMALES (2 points)
-- ============================================================
Config.CraftPoints = {
    -- Point 1: Entrepot industriel - La Mesa
    {
        coords  = vector3(718.74, -975.36, 24.91),
        label   = '~o~Atelier de Fabrication~s~\n~w~Appuyez sur ~g~[E]~w~ pour ouvrir',
        type    = 'normal',
        minGrade = 1, -- Ouvrier minimum
        blip    = true,
    },
    -- Point 2: Sous-sol - Cypress Flats
    {
        coords  = vector3(892.64, -2170.35, 32.29),
        label   = '~o~Atelier de Fabrication 2~s~\n~w~Appuyez sur ~g~[E]~w~ pour ouvrir',
        type    = 'normal',
        minGrade = 1,
        blip    = true,
    },
}

-- ============================================================
-- POINT DE FABRICATION - ARMES SPECIALES (1 point)
-- ============================================================
Config.CraftSpecialPoint = {
    coords   = vector3(2343.97, 2567.37, 46.68),
    label    = '~r~Atelier Special~s~\n~w~Appuyez sur ~g~[E]~w~ pour ouvrir',
    minGrade = 3, -- Expert minimum
    blip     = true,
}

-- ============================================================
-- RECETTES - ARMES NORMALES
-- ============================================================
Config.NormalRecipes = {
    {
        name     = 'WEAPON_PISTOL',
        label    = 'Pistolet',
        category = 'Pistolets',
        time     = 15000,
        ingredients = {
            {item = 'metalbrut',         label = 'Metal Brut',          count = 5},
            {item = 'composantchimique', label = 'Composant Chimique',  count = 2},
            {item = 'poudrearme',        label = 'Poudre d\'Arme',     count = 3},
        },
    },
    {
        name     = 'WEAPON_COMBATPISTOL',
        label    = 'Pistolet de Combat',
        category = 'Pistolets',
        time     = 18000,
        ingredients = {
            {item = 'metalbrut',         label = 'Metal Brut',          count = 7},
            {item = 'composantchimique', label = 'Composant Chimique',  count = 3},
            {item = 'poudrearme',        label = 'Poudre d\'Arme',     count = 4},
        },
    },
    {
        name     = 'WEAPON_MICROSMG',
        label    = 'Micro SMG',
        category = 'SMGs',
        time     = 20000,
        ingredients = {
            {item = 'metalbrut',         label = 'Metal Brut',          count = 10},
            {item = 'composantchimique', label = 'Composant Chimique',  count = 4},
            {item = 'poudrearme',        label = 'Poudre d\'Arme',     count = 5},
        },
    },
    {
        name     = 'WEAPON_SMG',
        label    = 'SMG',
        category = 'SMGs',
        time     = 22000,
        ingredients = {
            {item = 'metalbrut',         label = 'Metal Brut',          count = 12},
            {item = 'composantchimique', label = 'Composant Chimique',  count = 5},
            {item = 'poudrearme',        label = 'Poudre d\'Arme',     count = 6},
        },
    },
    {
        name     = 'WEAPON_PUMPSHOTGUN',
        label    = 'Fusil a Pompe',
        category = 'Fusils',
        time     = 25000,
        ingredients = {
            {item = 'metalbrut',         label = 'Metal Brut',          count = 14},
            {item = 'composantchimique', label = 'Composant Chimique',  count = 3},
            {item = 'poudrearme',        label = 'Poudre d\'Arme',     count = 8},
        },
    },
    {
        name     = 'ammo_pistol',
        label    = 'Munitions Pistolet (x24)',
        category = 'Munitions',
        isItem   = true,
        time     = 8000,
        ingredients = {
            {item = 'metalbrut',         label = 'Metal Brut',          count = 2},
            {item = 'poudrearme',        label = 'Poudre d\'Arme',     count = 3},
        },
    },
    {
        name     = 'ammo_rifle',
        label    = 'Munitions Fusil (x30)',
        category = 'Munitions',
        isItem   = true,
        time     = 10000,
        ingredients = {
            {item = 'metalbrut',         label = 'Metal Brut',          count = 3},
            {item = 'poudrearme',        label = 'Poudre d\'Arme',     count = 4},
        },
    },
}

-- ============================================================
-- RECETTES - ARMES SPECIALES
-- ============================================================
Config.SpecialRecipes = {
    {
        name     = 'WEAPON_ASSAULTRIFLE',
        label    = 'Fusil d\'Assaut',
        category = 'Fusils d\'Assaut',
        time     = 35000,
        ingredients = {
            {item = 'metalbrut',         label = 'Metal Brut',          count = 20},
            {item = 'composantchimique', label = 'Composant Chimique',  count = 8},
            {item = 'poudrearme',        label = 'Poudre d\'Arme',     count = 12},
        },
    },
    {
        name     = 'WEAPON_CARBINERIFLE',
        label    = 'Carabine',
        category = 'Fusils d\'Assaut',
        time     = 38000,
        ingredients = {
            {item = 'metalbrut',         label = 'Metal Brut',          count = 22},
            {item = 'composantchimique', label = 'Composant Chimique',  count = 9},
            {item = 'poudrearme',        label = 'Poudre d\'Arme',     count = 14},
        },
    },
    {
        name     = 'WEAPON_SNIPERRIFLE',
        label    = 'Fusil de Sniper',
        category = 'Sniper',
        time     = 45000,
        ingredients = {
            {item = 'metalbrut',         label = 'Metal Brut',          count = 25},
            {item = 'composantchimique', label = 'Composant Chimique',  count = 12},
            {item = 'poudrearme',        label = 'Poudre d\'Arme',     count = 15},
        },
    },
    {
        name     = 'WEAPON_RPG',
        label    = 'Lance-Roquette',
        category = 'Armes Lourdes',
        time     = 60000,
        ingredients = {
            {item = 'metalbrut',         label = 'Metal Brut',          count = 35},
            {item = 'composantchimique', label = 'Composant Chimique',  count = 18},
            {item = 'poudrearme',        label = 'Poudre d\'Arme',     count = 20},
        },
    },
}

-- ============================================================
-- POINT DE VENTE - AMMUNATION
-- ============================================================
Config.SellPoint = {
    coords = vector3(22.15, -1105.67, 29.80), -- Ammunation Pillbox Hill
    label  = '~g~Ammunation - Revente~s~\n~w~Appuyez sur ~g~[E]~w~ pour vendre',
    blip   = true,
}

-- Prix de vente par defaut (modifiables par le patron)
Config.DefaultSellPrices = {
    ['WEAPON_PISTOL']        = 2500,
    ['WEAPON_COMBATPISTOL']  = 3500,
    ['WEAPON_MICROSMG']      = 5000,
    ['WEAPON_SMG']           = 6500,
    ['WEAPON_PUMPSHOTGUN']   = 7000,
    ['WEAPON_ASSAULTRIFLE']  = 15000,
    ['WEAPON_CARBINERIFLE']  = 17000,
    ['WEAPON_SNIPERRIFLE']   = 22000,
    ['WEAPON_RPG']           = 45000,
    ['ammo_pistol']          = 500,
    ['ammo_rifle']           = 750,
}

-- ============================================================
-- POINT DE VENTE AUTOMATIQUE (avec stock)
-- ============================================================
Config.AutoSellPoint = {
    coords     = vector3(252.63, -50.00, 69.94), -- Vinewood, facile d'acces
    label      = '~p~Vente Automatique~s~\n~w~Appuyez sur ~g~[E]~w~ pour gerer',
    blip       = true,
    maxStock   = 50,
}

-- ============================================================
-- POINT DE SORTIE VEHICULE
-- ============================================================
Config.VehicleSpawn = {
    coords  = vector3(725.17, -984.70, 24.13),
    heading = 90.0,
    label   = '~b~Sortie Vehicule~s~\n~w~Appuyez sur ~g~[E]~w~ pour sortir un vehicule',
    blip    = true,
    vehicles = {
        {model = 'burrito3', label = 'Fourgon de Livraison', minGrade = 0},
        {model = 'rumpo',    label = 'Rumpo',                minGrade = 1},
        {model = 'speedo',   label = 'Speedo',               minGrade = 2},
        {model = 'mule',     label = 'Mule (Transport)',     minGrade = 3},
    },
}

-- ============================================================
-- MENU PATRON (boss)
-- ============================================================
Config.BossPoint = {
    coords = vector3(712.52, -968.24, 30.40),
    label  = '~y~Menu Patron~s~\n~w~Appuyez sur ~g~[E]~w~ pour gerer',
    blip   = true,
}

-- ============================================================
-- MENU F6
-- ============================================================
Config.F6Key = 'F6' -- Touche pour le menu job
Config.F6KeyMapping = 'F6'

Config.PPA = {
    itemName  = 'ppa_armurier',
    itemLabel = 'Permis de Port d\'Arme',
}

-- ============================================================
-- DIVERS
-- ============================================================
Config.Markers = {
    Harvest  = {type = 25, color = {r = 50,  g = 150, b = 255, a = 120}},
    Craft    = {type = 27, color = {r = 255, g = 150, b = 0,   a = 120}},
    Special  = {type = 27, color = {r = 255, g = 50,  b = 50,  a = 120}},
    Sell     = {type = 25, color = {r = 50,  g = 255, b = 50,  a = 120}},
    AutoSell = {type = 29, color = {r = 180, g = 50,  b = 255, a = 120}},
    Vehicle  = {type = 36, color = {r = 50,  g = 100, b = 255, a = 120}},
    Boss     = {type = 22, color = {r = 255, g = 200, b = 0,   a = 120}},
}

Config.Notifications = {
    duration = 5000,
}
