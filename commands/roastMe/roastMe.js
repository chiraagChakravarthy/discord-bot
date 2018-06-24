const on = require(__dirname + '/../on'), fs = require('fs'), download = require(__dirname + '/../../download')
var roasts

module.exports = function(client, discord){
    roasts = JSON.parse(fs.readFileSync(__dirname + '/roasts.json'))
    download(__dirname + '/roasts.json')
    on(client, 'roastMe', (message, params)=>{
        message.channel.send(roasts[Math.floor(roasts.length*Math.random())])
    })

    on(client, 'addRoast', (message, params)=>{
        if(params.length===0){
            message.reply('You need to actually add a roast.')
        }
        var roast = ''
        for(var i = 0; i < params.length; i++){
            roast += params[i] + ' '
        }
        message.reply('Sick Roast Dude')
        message.delete()
        roasts.push(roast)
        write()
    })
}


function write(){
    fs.writeFileSync(__dirname + '/roasts.json', JSON.stringify(roasts))
}