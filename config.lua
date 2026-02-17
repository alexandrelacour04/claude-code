Config = {}

-- Framework: 'esx' ou 'qbcore'
Config.Framework = 'esx'

-- Touche pour ouvrir le MDT (F5)
Config.OpenKey = 'F5'

-- Jobs autorises a utiliser le MDT
Config.AllowedJobs = {
    'police',
    'lspd',
    'bcso',
    'sasp',
    'fbi',
}

-- Departement par defaut
Config.DefaultDepartment = 'LSPD'

-- Grades (rang => label)
Config.Ranks = {
    [0] = 'Cadet',
    [1] = 'Officier',
    [2] = 'Officier Senior',
    [3] = 'Caporal',
    [4] = 'Sergent',
    [5] = 'Lieutenant',
    [6] = 'Capitaine',
    [7] = 'Commandant',
    [8] = 'Chef Adjoint',
    [9] = 'Chef de Police',
}

-- Categories du Code Penal
Config.PenalCode = {
    {
        category = 'INFRACTIONS ROUTIERES',
        color = '#f59e0b',
        offenses = {
            { title = 'Exces de vitesse mineur', code = 'IR-01', fine = 500, jail = 0, points = 1, description = 'Depassement de la limite de vitesse de moins de 30 km/h' },
            { title = 'Exces de vitesse majeur', code = 'IR-02', fine = 1500, jail = 5, points = 3, description = 'Depassement de la limite de vitesse de plus de 30 km/h' },
            { title = 'Conduite dangereuse', code = 'IR-03', fine = 2000, jail = 10, points = 4, description = 'Conduite mettant en danger la vie d\'autrui' },
            { title = 'Fuite lors d\'un controle', code = 'IR-04', fine = 5000, jail = 15, points = 6, description = 'Refus d\'obtemperer et fuite' },
            { title = 'Conduite sans permis', code = 'IR-05', fine = 3000, jail = 10, points = 0, description = 'Conduite d\'un vehicule sans permis valide' },
            { title = 'Conduite en etat d\'ivresse', code = 'IR-06', fine = 5000, jail = 20, points = 8, description = 'Conduite sous l\'influence de l\'alcool' },
            { title = 'Griller un feu rouge', code = 'IR-07', fine = 750, jail = 0, points = 2, description = 'Non-respect d\'un feu de signalisation' },
            { title = 'Stationnement illegal', code = 'IR-08', fine = 300, jail = 0, points = 0, description = 'Stationnement en zone interdite' },
            { title = 'Defaut d\'assurance', code = 'IR-09', fine = 2000, jail = 0, points = 3, description = 'Circulation sans assurance valide' },
            { title = 'Course illegale', code = 'IR-10', fine = 10000, jail = 30, points = 10, description = 'Participation a une course de rue illegale' },
        }
    },
    {
        category = 'DELITS MINEURS',
        color = '#3b82f6',
        offenses = {
            { title = 'Trouble a l\'ordre public', code = 'DM-01', fine = 1000, jail = 5, points = 0, description = 'Comportement perturbant l\'ordre public' },
            { title = 'Ivresse publique', code = 'DM-02', fine = 500, jail = 5, points = 0, description = 'Etat d\'ebriete sur la voie publique' },
            { title = 'Vandalisme', code = 'DM-03', fine = 2000, jail = 10, points = 0, description = 'Degradation volontaire de biens' },
            { title = 'Outrage a agent', code = 'DM-04', fine = 3000, jail = 10, points = 0, description = 'Insultes ou menaces envers un agent de police' },
            { title = 'Refus d\'identifier', code = 'DM-05', fine = 1500, jail = 5, points = 0, description = 'Refus de fournir son identite lors d\'un controle' },
            { title = 'Intrusion', code = 'DM-06', fine = 2000, jail = 10, points = 0, description = 'Entree non autorisee dans une propriete privee' },
            { title = 'Vol simple', code = 'DM-07', fine = 3000, jail = 15, points = 0, description = 'Vol sans violence ni effraction' },
            { title = 'Recel', code = 'DM-08', fine = 2500, jail = 10, points = 0, description = 'Detention de biens voles' },
            { title = 'Fraude d\'identite', code = 'DM-09', fine = 5000, jail = 15, points = 0, description = 'Utilisation d\'une fausse identite' },
            { title = 'Tapage nocturne', code = 'DM-10', fine = 750, jail = 0, points = 0, description = 'Nuisances sonores excessives' },
        }
    },
    {
        category = 'DELITS MAJEURS',
        color = '#f97316',
        offenses = {
            { title = 'Agression', code = 'DJ-01', fine = 5000, jail = 25, points = 0, description = 'Violence physique envers autrui' },
            { title = 'Vol a main armee', code = 'DJ-02', fine = 15000, jail = 45, points = 0, description = 'Vol avec usage d\'une arme' },
            { title = 'Cambriolage', code = 'DJ-03', fine = 10000, jail = 35, points = 0, description = 'Vol avec effraction dans un lieu ferme' },
            { title = 'Braquage', code = 'DJ-04', fine = 25000, jail = 60, points = 0, description = 'Attaque a main armee d\'un commerce ou banque' },
            { title = 'Evasion', code = 'DJ-05', fine = 10000, jail = 40, points = 0, description = 'Evasion de garde a vue ou de prison' },
            { title = 'Kidnapping', code = 'DJ-06', fine = 20000, jail = 50, points = 0, description = 'Enlevement et sequestration' },
            { title = 'Trafic de drogue', code = 'DJ-07', fine = 20000, jail = 45, points = 0, description = 'Vente et distribution de substances illegales' },
            { title = 'Corruption', code = 'DJ-08', fine = 30000, jail = 50, points = 0, description = 'Corruption d\'un agent public' },
            { title = 'Extorsion', code = 'DJ-09', fine = 15000, jail = 40, points = 0, description = 'Obtention de biens par menace ou intimidation' },
            { title = 'Complicite criminelle', code = 'DJ-10', fine = 10000, jail = 30, points = 0, description = 'Aide ou assistance a la commission d\'un crime' },
        }
    },
    {
        category = 'CRIMES',
        color = '#ef4444',
        offenses = {
            { title = 'Tentative de meurtre', code = 'CR-01', fine = 50000, jail = 90, points = 0, description = 'Tentative d\'homicide volontaire' },
            { title = 'Meurtre', code = 'CR-02', fine = 75000, jail = 0, points = 0, description = 'Homicide volontaire - Prison a vie possible' },
            { title = 'Terrorisme', code = 'CR-03', fine = 100000, jail = 0, points = 0, description = 'Acte de terrorisme - Prison a vie' },
            { title = 'Trahison', code = 'CR-04', fine = 100000, jail = 0, points = 0, description = 'Haute trahison envers l\'Etat' },
            { title = 'Crime organise', code = 'CR-05', fine = 50000, jail = 80, points = 0, description = 'Direction ou participation active a une organisation criminelle' },
        }
    },
    {
        category = 'ARMES & SUBSTANCES',
        color = '#a855f7',
        offenses = {
            { title = 'Port d\'arme illegal', code = 'AS-01', fine = 5000, jail = 20, points = 0, description = 'Possession d\'une arme sans permis' },
            { title = 'Port d\'arme lourde', code = 'AS-02', fine = 15000, jail = 40, points = 0, description = 'Possession d\'une arme de guerre' },
            { title = 'Trafic d\'armes', code = 'AS-03', fine = 30000, jail = 60, points = 0, description = 'Vente illegale d\'armes a feu' },
            { title = 'Possession de drogue', code = 'AS-04', fine = 3000, jail = 10, points = 0, description = 'Possession de substances illegales (usage personnel)' },
            { title = 'Possession avec intention', code = 'AS-05', fine = 10000, jail = 30, points = 0, description = 'Possession de drogue en quantite de revente' },
            { title = 'Production de drogue', code = 'AS-06', fine = 25000, jail = 50, points = 0, description = 'Fabrication ou culture de substances illegales' },
            { title = 'Possession d\'explosifs', code = 'AS-07', fine = 20000, jail = 50, points = 0, description = 'Detention illegale de materiaux explosifs' },
        }
    },
}

-- Codes radio (10-codes)
Config.RadioCodes = {
    { code = '10-1', description = 'Mauvaise reception' },
    { code = '10-4', description = 'Bien recu / Affirmatif' },
    { code = '10-6', description = 'Occupe' },
    { code = '10-7', description = 'Hors service' },
    { code = '10-8', description = 'En service' },
    { code = '10-9', description = 'Repetez le message' },
    { code = '10-10', description = 'Negatif' },
    { code = '10-11', description = 'Controle routier' },
    { code = '10-13', description = 'Agent en danger' },
    { code = '10-14', description = 'Individu suspect' },
    { code = '10-15', description = 'Individu en garde a vue' },
    { code = '10-17', description = 'En route' },
    { code = '10-20', description = 'Position actuelle' },
    { code = '10-23', description = 'Arrive sur place' },
    { code = '10-25', description = 'Renfort demande' },
    { code = '10-31', description = 'Crime en cours' },
    { code = '10-32', description = 'Personne armee' },
    { code = '10-33', description = 'Urgence - Toutes unites' },
    { code = '10-35', description = 'Alerte generale' },
    { code = '10-41', description = 'Debut de service' },
    { code = '10-42', description = 'Fin de service' },
    { code = '10-50', description = 'Accident de la route' },
    { code = '10-55', description = 'Conducteur en etat d\'ivresse' },
    { code = '10-70', description = 'Incendie' },
    { code = '10-71', description = 'Fusillade' },
    { code = '10-80', description = 'Poursuite en cours' },
    { code = '10-99', description = 'Urgence - Officier a terre' },
    { code = 'Code 1', description = 'Repondre sans urgence' },
    { code = 'Code 2', description = 'Repondre en urgence (sans sirene)' },
    { code = 'Code 3', description = 'Repondre en urgence (sirene + gyrophare)' },
    { code = 'Code 4', description = 'Situation sous controle' },
    { code = 'Code 5', description = 'Surveillance en cours' },
}
