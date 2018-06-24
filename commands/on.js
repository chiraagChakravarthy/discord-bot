const fs = require('fs'),
    config = JSON.parse(fs.readFileSync(__dirname + '/../config.json')),
    prefix = config.prefix
module.exports = function(client, command, fun){
    client.on('message', message =>{
        var split = message.content.split(' ')
        if(split[0]===prefix + command){
            fun(message, split.splice(1))
        }
    })
}