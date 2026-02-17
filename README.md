# Police MDT pour FiveM - LSPD

Un système complet de **Mobile Data Terminal (MDT)** gratuit pour FiveM, conçu pour la Police LSPD. Le MDT offre toutes les fonctionnalités que les meilleurs MDT payants proposent, totalement gratuitement.

## 🎯 Fonctionnalités

### 📋 Onglets Principaux

1. **Recherche Citoyen** - Rechercher un citoyen dans le système et voir ses informations
2. **Recherche Véhicule** - Rechercher un véhicule par plaque d'immatriculation
3. **Citations & Infractions** - Créer et gérer les citations/infractions
4. **Dossiers & Rapports** - Créer et consulter les rapports d'incidents
5. **Logs d'Appels** - Historique complet des appels d'urgence
6. **Avis de Recherche** - Émettre et consulter les avis de recherche actifs
7. **Personnel** - Gestion des grades et agents (Commandant uniquement)
8. **Statistiques** - Tableaux de bord avec statistiques

### 🔐 Système de Permissions Avancé

- **Permissions par Onglet** - Chaque onglet a un grade minimum requis
- **Permissions Dynamiques** - Modification en temps réel sans relancer le script
- **Gestion des Grades** - 7 grades avec hiérarchie (Recruit → Commander)
- **Contrôle Commandant** - Le Commandant peut modifier les accès par onglet et les grades

### 🗄️ Intégration Base de Données

- Intégration ESX complète
- Tables MySQL automatiquement créées
- Stockage des citations, rapports, avis de recherche, logs d'appels
- Permissions persistantes dans la base de données

## 📦 Installation

### Prérequis

- FiveM Server
- Framework ESX installé
- MySQL/MariaDB
- Driver MySQL pour Lua (ghmattimysql ou oxmysql)

### Étapes d'Installation

1. **Télécharger le resource**
   ```bash
   git clone https://github.com/yourusername/police-mdt.git police-mdt
   ```

2. **Placer dans le dossier resources**
   ```
   /your-server/resources/police-mdt
   ```

3. **Ajouter au server.cfg**
   ```
   ensure police-mdt
   ```

4. **Démarrer le serveur**
   - Le script créera automatiquement les tables MySQL nécessaires
   - Assurez-vous que votre utilisateur MySQL a les permissions nécessaires

## ⌨️ Commandes et Contrôles

### Clé d'Ouverture

- **F10** - Ouvrir/Fermer le MDT (pour les flics uniquement)

### Contrôles dans le MDT

- **ESC** - Fermer le MDT
- **TAB** - Naviguer entre les onglets
- **SOURIS** - Interagir avec l'interface

## 📝 Configuration

Modifiez `shared/config.lua` pour personnaliser le MDT:

```lua
-- Clé pour ouvrir le MDT
Config.OpenKey = 'F10'

-- Job de police
Config.PoliceJob = 'police'

-- Grades disponibles
Config.Grades = {
    ['recruit'] = { label = 'Recruit', hierarchy = 1 },
    ['officer'] = { label = 'Officer', hierarchy = 2 },
    -- ... etc
}

-- Onglets et permissions minimales
Config.Tabs = {
    {
        id = 'search_citizen',
        label = 'Recherche Citoyen',
        minGrade = 'officer',
        -- ... etc
    },
    -- ... etc
}
```

## 🛠️ Structures de Base de Données

Le script crée automatiquement les tables suivantes:

### mdt_citations
```sql
- id INT PRIMARY KEY
- citizen_id INT (ID du citoyen)
- officer_id INT (ID de l'agent)
- citation_type VARCHAR (Type d'infraction)
- description TEXT (Description)
- amount INT (Montant en $)
- created_at TIMESTAMP
- status VARCHAR (pending/paid/cancelled)
```

### mdt_wanted
```sql
- id INT PRIMARY KEY
- citizen_id INT
- reason TEXT
- warrant_type VARCHAR (felony/warrant/missing/dangerous)
- created_by INT (Agent qui a émis)
- created_at TIMESTAMP
- status VARCHAR (active/resolved/expired)
```

### mdt_reports
```sql
- id INT PRIMARY KEY
- officer_id INT
- incident_type VARCHAR
- description TEXT
- location VARCHAR
- created_at TIMESTAMP
- updated_at TIMESTAMP
```

### mdt_call_logs
```sql
- id INT PRIMARY KEY
- call_type VARCHAR
- location VARCHAR
- description TEXT
- dispatch_by INT
- officers_assigned TEXT
- created_at TIMESTAMP
- closed_at TIMESTAMP
```

### mdt_tab_permissions
```sql
- id INT PRIMARY KEY
- tab_id VARCHAR (ID de l'onglet)
- min_grade VARCHAR (Grade minimum requis)
- created_at TIMESTAMP
- updated_at TIMESTAMP
```

## 🎮 Utilisation par Role

### Officer Standard
- Rechercher des citoyens et véhicules
- Créer des citations
- Créer des rapports
- Consulter les logs d'appels

### Sergeant+
- Toutes les fonctionnalités Officer
- Émettre des avis de recherche
- Consulter les avis de recherche actifs
- Gérer le personnel

### Commander
- Toutes les fonctionnalités
- **Spécial**: Modifier l'accès minimum de chaque onglet
- **Spécial**: Changer les grades des agents en temps réel

## 📱 API Exports

Le script expose plusieurs exports pour utilisation par d'autres resources:

```lua
-- Ouvrir le MDT
exports['police-mdt']:OpenMDT()

-- Fermer le MDT
exports['police-mdt']:CloseMDT()

-- Basculer le MDT
exports['police-mdt']:ToggleMDT()

-- Vérifier si un joueur est flic
local isCop = exports['police-mdt']:IsPlayerCop(playerId)

-- Changer le grade d'un joueur
exports['police-mdt']:SetPlayerGrade(playerId, 'sergeant')
```

## 🔧 Événements Serveur

### Événements Disponibles

- `mdt:getCitizenInfo` - Récupérer les infos d'un citoyen
- `mdt:getVehicleInfo` - Récupérer les infos d'un véhicule
- `mdt:addCitation` - Ajouter une citation
- `mdt:addWanted` - Ajouter un avis de recherche
- `mdt:addReport` - Ajouter un rapport
- `mdt:addCallLog` - Ajouter un log d'appel
- `mdt:getData` - Récupérer des données (wanted, call_logs, etc)

## 🎨 Interface

L'interface MDT est conçue avec:
- **Design Moderne** - Interface épurée et professionnelle
- **Thème Policier** - Couleurs bleu/noir/gris comme les vrais MDT
- **Responsive** - Fonctionne sur tous les résolutions
- **Dark Mode** - Facile pour les yeux même en jeu

## ⚙️ Permissions Dynamiques

Le système de permissions est entièrement dynamique:

1. **Ajouter une Permission**
```lua
-- Dans le client ou serveur
TriggerServerEvent('mdt:updateTabPermission', 'search_citizen', 'sergeant')
```

2. **Modifier des Grades**
```lua
-- Directement en temps réel
exports['police-mdt']:SetPlayerGrade(playerId, 'captain')
```

3. **Configuration Commandant**
- Les Commandants accèdent à un onglet "Admin" (à venir)
- Interface pour modifier chaque permission par onglet
- Historique des modifications

## 🐛 Troubleshooting

### Le MDT ne s'ouvre pas
- Vérifiez que vous êtes flic (`/job police`)
- Vérifiez que F10 n'est pas utilisé par une autre ressource
- Vérifiez la console pour les erreurs

### Les données ne s'affichent pas
- Vérifiez la connexion MySQL
- Vérifiez que les tables sont créées
- Vérifiez les logs du serveur

### Erreur "You are not authorized"
- Vous devez être flic pour utiliser le MDT
- Vérifiez votre grade pour l'onglet spécifique

## 📞 Support

Pour les problèmes ou suggestions:
- Ouvrez une issue sur GitHub
- Contactez le développeur

## 📄 Licence

Ce projet est fourni gratuitement pour la communauté FiveM.

## 🙏 Crédits

Développé avec ❤️ pour la communauté FiveM.

---

**Version**: 1.0.0
**Dernière mise à jour**: Février 2026
