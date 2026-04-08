fx_version 'cerulean'
game 'gta5'

name        'MDT System'
description 'Mobile Data Terminal - Systeme de gestion policier complet'
author      'FiveM MDT'
version     '1.0.0'

lua54 'yes'

shared_scripts {
    'config.lua',
}

client_scripts {
    'client/main.lua',
}

server_scripts {
    '@oxmysql/lib/MySQL.lua',
    'server/main.lua',
}

ui_page 'html/index.html'

files {
    'html/index.html',
    'html/css/style.css',
    'html/js/app.js',
    'html/js/api.js',
}
