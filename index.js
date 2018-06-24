const fs = require('fs'), discord = require('discord.js')
const goonsUp = require(__dirname + '/commands/goonsUp/goonsUp')


var config = JSON.parse(fs.readFileSync('config.json')),
    client = new discord.Client()
goonsUp(client, discord)

client.login(config.token)