fx_version 'cerulean'
game 'gta5'

name 'lspd-mdt'
description 'MDT Complet pour le LSPD - Mobile Data Terminal Police'
author 'LSPD MDT Project'
version '1.0.0'

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

ui_page 'ui/index.html'

files {
    'ui/index.html',
    'ui/css/style.css',
    'ui/js/app.js',
}
