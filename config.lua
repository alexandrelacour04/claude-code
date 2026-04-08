Config = {}

-- Touche pour ouvrir le MDT (F9 par defaut)
Config.OpenKey = 'F9'

-- Autoriser uniquement certains jobs a acceder au MDT
Config.AllowedJobs = {
    'police',
    'sheriff',
    'highway_patrol',
    'fbi',
}

-- Framework: 'esx' ou 'standalone'
Config.Framework = 'esx'

-- Verifie le job cote serveur
Config.CheckJob = true

-- Nombre max de resultats par recherche
Config.MaxResults = 50

-- Activer les logs dans la console serveur
Config.Logs = true

-- Grades ayant acces aux fonctionnalites avancees (mandats, dossiers)
Config.SupervisorGrades = { 3, 4, 5 }

-- Couleurs des statuts
Config.StatusColors = {
    ['En service']     = '#27ae60',
    ['Hors service']   = '#e74c3c',
    ['En patrouille']  = '#f39c12',
    ['En intervention']= '#e67e22',
    ['Sur scene']      = '#8e44ad',
}

-- Infractions predefinies
Config.Offenses = {
    -- Infractions routieres
    { category = 'Circulation', label = 'Excès de vitesse', fine = 500,  jail = 0   },
    { category = 'Circulation', label = 'Conduite en etat ivresse', fine = 2000, jail = 10  },
    { category = 'Circulation', label = 'Fuite de la police', fine = 5000, jail = 30  },
    { category = 'Circulation', label = 'Conduite sans permis', fine = 1500, jail = 0   },
    { category = 'Circulation', label = 'Vehicule vole', fine = 3000, jail = 20  },
    -- Infractions contre les personnes
    { category = 'Personnes',   label = 'Voie de fait', fine = 2000, jail = 15  },
    { category = 'Personnes',   label = 'Agression grave', fine = 5000, jail = 60  },
    { category = 'Personnes',   label = 'Meurtre', fine = 0,    jail = 180 },
    { category = 'Personnes',   label = 'Sequestration', fine = 3000, jail = 90  },
    { category = 'Personnes',   label = 'Menaces de mort', fine = 1500, jail = 20  },
    -- Infractions contre les biens
    { category = 'Biens',       label = 'Vol simple', fine = 1000, jail = 10  },
    { category = 'Biens',       label = 'Vol aggrave', fine = 3000, jail = 30  },
    { category = 'Biens',       label = 'Cambriolage', fine = 5000, jail = 60  },
    { category = 'Biens',       label = 'Destruction de biens', fine = 2000, jail = 15  },
    -- Armes
    { category = 'Armes',       label = 'Port illegal d\'arme', fine = 3000, jail = 40  },
    { category = 'Armes',       label = 'Port d\'arme de guerre', fine = 8000, jail = 90  },
    { category = 'Armes',       label = 'Trafic d\'armes', fine = 10000, jail = 120 },
    -- Stupéfiants
    { category = 'Stupefiants', label = 'Usage de stupefiants', fine = 1000, jail = 5   },
    { category = 'Stupefiants', label = 'Possession de stupefiants', fine = 3000, jail = 20  },
    { category = 'Stupefiants', label = 'Trafic de stupefiants', fine = 10000, jail = 120 },
    -- Ordre public
    { category = 'Ordre public',label = 'Attroupement illegal', fine = 500,  jail = 0   },
    { category = 'Ordre public',label = 'Resistance a la force publique', fine = 2000, jail = 10  },
    { category = 'Ordre public',label = 'Refus d\'obtemperer', fine = 3000, jail = 20  },
    { category = 'Ordre public',label = 'Delit de fuite', fine = 2500, jail = 15  },
}
