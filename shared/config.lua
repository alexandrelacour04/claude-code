Config = {}

-- Clé pour ouvrir le MDT
Config.OpenKey = 'F10'

-- Job de police
Config.PoliceJob = 'police'

-- Grades disponibles avec hiérarchie
Config.Grades = {
    -- Grade = { Label, Hiérarchie }
    ['recruit'] = { label = 'Recruit', hierarchy = 1 },
    ['officer'] = { label = 'Officer', hierarchy = 2 },
    ['senior_officer'] = { label = 'Senior Officer', hierarchy = 3 },
    ['sergeant'] = { label = 'Sergeant', hierarchy = 4 },
    ['lieutenant'] = { label = 'Lieutenant', hierarchy = 5 },
    ['captain'] = { label = 'Captain', hierarchy = 6 },
    ['commander'] = { label = 'Commander', hierarchy = 7 },
}

-- Configuration des onglets et permissions minimales
Config.Tabs = {
    {
        id = 'search_citizen',
        label = 'Recherche Citoyen',
        icon = 'fa-search',
        minGrade = 'officer', -- Officer minimum
        description = 'Rechercher un citoyen dans le système'
    },
    {
        id = 'search_vehicle',
        label = 'Recherche Véhicule',
        icon = 'fa-car',
        minGrade = 'officer',
        description = 'Rechercher un véhicule par plaque'
    },
    {
        id = 'citations',
        label = 'Citations & Infractions',
        icon = 'fa-file-pdf',
        minGrade = 'officer',
        description = 'Gérer les citations et infractions'
    },
    {
        id = 'reports',
        label = 'Dossiers & Rapports',
        icon = 'fa-folder',
        minGrade = 'sergeant',
        description = 'Accéder aux dossiers et rapports'
    },
    {
        id = 'call_logs',
        label = 'Logs d\'appels',
        icon = 'fa-phone',
        minGrade = 'officer',
        description = 'Historique des appels d\'urgence'
    },
    {
        id = 'wanted',
        label = 'Avis de Recherche',
        icon = 'fa-exclamation-triangle',
        minGrade = 'sergeant',
        description = 'Gestion des avis de recherche'
    },
    {
        id = 'employees',
        label = 'Agents',
        icon = 'fa-users',
        minGrade = 'sergeant',
        description = 'Gestion du personnel de police'
    },
    {
        id = 'statistics',
        label = 'Statistiques',
        icon = 'fa-chart-bar',
        minGrade = 'captain',
        description = 'Statistiques et rapports'
    },
}

-- Configuration de la base de données
Config.Database = {
    -- Utilise le même système que ESX (généralement 'ghmattimysql' ou 'oxmysql')
    -- Les tables seront créées automatiquement si elles n'existent pas
}

-- Configuration des permissions commandant
Config.CommanderPermissions = {
    canEditTabAccess = true,  -- Modifier l'accès aux onglets
    canEditGrades = true,     -- Modifier les grades
    canEditPlayers = true,    -- Modifier les joueurs
    canEditReports = true,    -- Modifier les rapports
}

-- Affichages du MDT
Config.UI = {
    width = 1200,
    height = 800,
    x = 0.5,
    y = 0.5,
}

-- Logs
Config.EnableLogs = true
Config.LogLevel = 'info' -- 'debug', 'info', 'warn', 'error'

print('^2MDT Police Config Loaded^7')
