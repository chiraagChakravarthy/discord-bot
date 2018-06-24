const on = require(__dirname + '/../on'), fs = require('fs')
const topics = JSON.parse(fs.readFileSync(__dirname + '/topics.json'))
var stage = 0, gameHost, players, quitting = false, rounds, currentRound, currentPlayer, inGame, availableTopics, scores, currentTopic, timeout

module.exports = function(client, discord){
    on(client, 'gu', (message, params)=>{
        if(quitting){
            quit(message, params, client, discord)
        }
        else if(params.length>0&&params[0].toLowerCase()==='(exit)'){
            if(message.member===gameHost){
                quitting = true
                message.reply('Are you sure you want to quit (\"Y\" for Yes)')
            }
            else {
                message.channel.send('Only ' + nickname(gameHost) + ' can stop it now.')
            }
        }
        else if(stage===0){
            stage0(message, params, client, discord)
        }
        else if(stage===1){
            stage1(message, params, client, discord)
        }
        else if(stage===2){
            stage2(message, params, client, discord)
        }
    })
}

function quit(message, params, client, discord){
    if(message.member===gameHost){
        if(params[0].toLowerCase()==='y'){
            stage = 0
            message.channel.send(nickname(gameHost) + ' HAS DESTROYED US ALL!!!')
            if(timeout !== null && timeout !== undefined){
                clearTimeout(timeout)
            }
        }
        else{
            message.channel.send(nickname(gameHost).toUpperCase() + ' HAS SAVED US!!!! WE WILL FOREVER BE IN HIS UNPAYABLE DEBT!!!!')
        }
        quitting = false
    }
    else{
        message.channel.send('ITS TOO LATE. ONLY ' + nickname(gameHost).toUpperCase() + ' CAN SAVE US!')
    }
}

function stage0(message, params, client, discord){
    if(params.length===0){
        message.reply('I guese no one\'s playing.')
        return
    }
    gameHost = message.member
    players = []
    players.push(gameHost)
    for(var i = 0; i < params.length; i++){
        var id = params[i].replace(/[<@!>]/g, '')
        if(client.users.has(id)){
            var user = message.guild.member(id)
            if(user===gameHost){
                message.reply('You can\'t play against yourself!')
                players = []
                return
            }
            else if(players.includes(user)){
                players = []
                message.reply('You already mentioned' + nickname(user))
                return
            }
            else {
                players.push(user)
            }
        }
        else{
            message.reply('\"' + params[i] + '\" is not a user')
            return
        }
    }
    listInstructions(message.channel)
    message.reply('Okay then. How many times should each player guess?')
    stage = 1
}

function stage1(message, params, client, discord){
    if(message.member===gameHost){
        if(isNaN(params[0])){
            message.reply('That\'s not a number!')
            return
        }
        else{
            var roundInput = parseInt(params[0])
            if(roundInput>5){
                message.reply('You can only play a max of 5 rounds per game.');
                return
            }
            else{
                rounds = roundInput
                message.reply('Alright, we\'re ready. Type \"/gu\" to begin')
                scores = []
                for(var i = 0; i < players.length; i++){
                    scores.push(0)
                }
                stage = 2
                availableTopics = []
                for(var i = 0; i < topics.length; i++){
                    availableTopics.push(i)
                }
                inGame = false
                currentPlayer = 0
                currentRound = -1
            }
        }
    }
    else{
        message.channel.send('Only ' + nickname(gameHost) + ' can decide this.')
        return
    }
}

function stage2(message, params, client, discord){
    if(inGame){
        if(message.member===players[currentPlayer]){
            var answer = ''
            params.forEach(element => {
                answer += element
            });
            if(toBaseForm(topics[currentTopic])===toBaseForm(answer)){
                scores[currentPlayer] += 20
                message.reply('That\'s correct! +20pts for ' + nickname(players[currentPlayer]))
                postRound(message, discord)
            }
            else{
                message.reply('Haha Nope!')
            }
        }
        else {
            message.channel.send('It is ' + nickname(players[currentPlayer]) + '\'s turn.')
        }
    }
    else {
        if(message.member===gameHost){
            inGame = true
            var topicIndex = Math.floor(Math.random()*availableTopics.length)
            currentTopic = availableTopics[topicIndex]
            availableTopics.splice(topicIndex, 1)
            for(var i = 0; i < players.length; i++){
                if(players[currentPlayer] !== players[i])
                    players[i].send(nickname(players[currentPlayer]) + '\'s person is ' + topics[currentTopic])
            }
            message.channel.send('Okay ' + nickname(players[currentPlayer]) + ', it\'s your turn! Guess who you are!')
            timeout = setTimeout(()=>{
                message.channel.send('Haha, you loose. You fat, arrogant, anticharasmatic server-wide embarrasment known as ' + players[currentPlayer].username)
                message.channel.send('The answer was ' + topics[currentTopic])
                postRound(message, discord)
            }, 60000)
        }
        else{
            message.channel.send('Only ' + nickname(gameHost) + ' can begin the next round.')
        }
    }
}

function toBaseForm(val){
    return val.toLowerCase().replace(/ /g, '').replace(/./g, '')
}

function postRound(message, discord){
    inGame = false
    clearTimeout(timeout)
    currentPlayer++
    if(currentPlayer >= players.length){
        currentPlayer = 0
        message.channel.send('That\'s the end of this round! Here are the scores')
        var winner = listScores(message.channel, discord)
        currentRound++
        if(currentRound >= rounds){
            stage = 0
            message.channel.send('The winner is ' + nickname(players[winner]))
            return
        }
    }
    message.channel.send(nickname(gameHost) + ', type \"/gu\" to begin the next round.')
}

function listScores(channel, discord){
    var max = 0, maxIndex = 0, embed = new discord.RichEmbed()
    embed.setTitle('Scores')
    embed.setColor(0xff00ff)
    for(var i = 0; i < players.length; i++){
        if(scores[i] > max){
            max = scores[i]
            maxIndex = i
        }
        embed.addField(nickname(players[i]), scores[i])
    }
    channel.send({embed})
    return maxIndex
}

function listInstructions(channel){
    channel.send('Welcome to Goons Up\nThe goal of the game is to help other players guess the FULL NAME of their person, and when it\'s your turn, to guess your own.\nBe sure not to tell other players the answers. You don\'t want to make it too easy!')
}

function nickname(player){
    return player.nickname===null||player.nickname===undefined?player.username:player.nickname
}

/*
TODO
    remove dots from topics names
    create three difficulty lists and ask for difficulty (1-3)
    Add overarching scoreboard
*/