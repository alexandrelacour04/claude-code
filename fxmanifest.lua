fx_version 'cerulean'
game 'gta5'

author 'MDT Police LSPD'
description 'MDT (Mobile Data Terminal) pour la Police LSPD - Système complet de gestion'
version '1.0.0'

lua54 'yes'

shared_scripts {
    'shared/config.lua',
}

server_scripts {
    'server/database.lua',
    'server/server.lua',
}

client_scripts {
    'client/client.lua',
}

files {
    'html/index.html',
    'html/css/style.css',
    'html/js/main.js',
    'html/js/api.js',
    'html/js/ui.js',
}

ui_page 'html/index.html'

dependencies {
    'es_extended',
}

exports {
    'openMDT',
    'closeMDT',
    'toggleMDT',
    'setPlayerGrade',
    'isPlayerCop',
}

escrow_ignore {
    'shared/**',
    'client/**',
    'server/**',
    'html/**',
}
