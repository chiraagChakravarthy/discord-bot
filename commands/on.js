
var prefix = process.env.PREFIX

module.exports = function(client, command, fun){
    client.on('message', message =>{
        var split = message.content.split(' ')
        if(split[0]===prefix + command){
            fun(message, split.splice(1))
        }
    })
}