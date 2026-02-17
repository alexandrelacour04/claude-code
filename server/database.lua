local Database = {}

-- Initialiser les tables de la base de données
function Database.init()
    TriggerEvent('esx:getSharedObject', function(obj)
        ESX = obj
    end)

    -- Table des citations et infractions
    MySQL.query('CREATE TABLE IF NOT EXISTS mdt_citations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        citizen_id INT NOT NULL,
        officer_id INT NOT NULL,
        citation_type VARCHAR(100),
        description TEXT,
        amount INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) DEFAULT "pending"
    )')

    -- Table des avis de recherche
    MySQL.query('CREATE TABLE IF NOT EXISTS mdt_wanted (
        id INT AUTO_INCREMENT PRIMARY KEY,
        citizen_id INT NOT NULL,
        reason TEXT,
        warrant_type VARCHAR(50),
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) DEFAULT "active"
    )')

    -- Table des rapports
    MySQL.query('CREATE TABLE IF NOT EXISTS mdt_reports (
        id INT AUTO_INCREMENT PRIMARY KEY,
        officer_id INT NOT NULL,
        incident_type VARCHAR(100),
        description TEXT,
        location VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )')

    -- Table des logs d'appels
    MySQL.query('CREATE TABLE IF NOT EXISTS mdt_call_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        call_type VARCHAR(100),
        location VARCHAR(255),
        description TEXT,
        dispatch_by INT,
        officers_assigned TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        closed_at TIMESTAMP NULL
    )')

    -- Table des permissions personnalisées par onglet
    MySQL.query('CREATE TABLE IF NOT EXISTS mdt_tab_permissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tab_id VARCHAR(100),
        min_grade VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )')

    -- Insérer les permissions par défaut
    MySQL.query('INSERT IGNORE INTO mdt_tab_permissions (tab_id, min_grade) VALUES (?, ?)', {
        'search_citizen', Config.Grades.officer
    })

    print('^2[MDT] Database tables initialized^7')
end

-- Récupérer les informations d'un citoyen
function Database.getCitizenInfo(firstname, lastname)
    local promise = promise.new()

    MySQL.query('SELECT * FROM users WHERE firstname = ? AND lastname = ?', {
        firstname, lastname
    }, function(result)
        promise:resolve(result and result[1] or nil)
    end)

    return Citizen.Await(promise)
end

-- Récupérer les informations d'un véhicule
function Database.getVehicleInfo(plate)
    local promise = promise.new()

    MySQL.query('SELECT * FROM vehicles WHERE plate = ?', {plate}, function(result)
        promise:resolve(result and result[1] or nil)
    end)

    return Citizen.Await(promise)
end

-- Ajouter une citation
function Database.addCitation(citizenId, officerId, citationType, description, amount)
    local promise = promise.new()

    MySQL.insert('INSERT INTO mdt_citations (citizen_id, officer_id, citation_type, description, amount) VALUES (?, ?, ?, ?, ?)', {
        citizenId, officerId, citationType, description, amount
    }, function(id)
        promise:resolve(id)
    end)

    return Citizen.Await(promise)
end

-- Récupérer les citations d'un citoyen
function Database.getCitations(citizenId)
    local promise = promise.new()

    MySQL.query('SELECT * FROM mdt_citations WHERE citizen_id = ? ORDER BY created_at DESC', {citizenId}, function(result)
        promise:resolve(result or {})
    end)

    return Citizen.Await(promise)
end

-- Ajouter un avis de recherche
function Database.addWanted(citizenId, reason, warrantType, officerId)
    local promise = promise.new()

    MySQL.insert('INSERT INTO mdt_wanted (citizen_id, reason, warrant_type, created_by) VALUES (?, ?, ?, ?)', {
        citizenId, reason, warrantType, officerId
    }, function(id)
        promise:resolve(id)
    end)

    return Citizen.Await(promise)
end

-- Récupérer les avis de recherche actifs
function Database.getWantedList()
    local promise = promise.new()

    MySQL.query('SELECT * FROM mdt_wanted WHERE status = "active" ORDER BY created_at DESC', {}, function(result)
        promise:resolve(result or {})
    end)

    return Citizen.Await(promise)
end

-- Ajouter un rapport
function Database.addReport(officerId, incidentType, description, location)
    local promise = promise.new()

    MySQL.insert('INSERT INTO mdt_reports (officer_id, incident_type, description, location) VALUES (?, ?, ?, ?)', {
        officerId, incidentType, description, location
    }, function(id)
        promise:resolve(id)
    end)

    return Citizen.Await(promise)
end

-- Ajouter un log d'appel
function Database.addCallLog(callType, location, description, dispatchBy)
    local promise = promise.new()

    MySQL.insert('INSERT INTO mdt_call_logs (call_type, location, description, dispatch_by) VALUES (?, ?, ?, ?)', {
        callType, location, description, dispatchBy
    }, function(id)
        promise:resolve(id)
    end)

    return Citizen.Await(promise)
end

-- Récupérer les logs d'appels récents
function Database.getCallLogs(limit)
    limit = limit or 50
    local promise = promise.new()

    MySQL.query('SELECT * FROM mdt_call_logs ORDER BY created_at DESC LIMIT ?', {limit}, function(result)
        promise:resolve(result or {})
    end)

    return Citizen.Await(promise)
end

exports('Database', Database)
return Database
