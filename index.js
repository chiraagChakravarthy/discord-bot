const fs = require('fs'), discord = require('discord.js'), express = require('express'), crypto = require('crypto'), bodyParser = require('body-parser'), path = require('path'), archiver = require('archiver')
const goonsUp = require(__dirname + '/commands/goonsUp/goonsUp')
const roastMe = require(__dirname + '/commands/roastMe/roastMe')

var config = JSON.parse(fs.readFileSync('config.json')),
    client = new discord.Client()

roastMe(client, discord)
goonsUp(client, discord)
client.login(config.token)

var app = express()
var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.set('view engine', 'ejs')

app.get('/', (req, res)=>{
    res.render('fileReq')
})

app.post('/', urlencodedParser, (req, res)=>{
    var hash = crypto.createHmac('sha256', req.body.password).digest('hex')
    if(hash==='709f8df16dca8b307a2a8ea13356eb1f3e138f117eb6592e4e030478bef1bb04'){
        var downloads = JSON.parse(fs.readFileSync(__dirname + '/download.json'))
        var archive = archiver('zip')
        var output = fs.createWriteStream(__dirname + '/downloads.zip')
        archive.pipe(output)

        for(var i = 0; i < downloads.length; i++){
            var path = downloads[i]
            archive.append(fs.readFileSync(path), {name: path.replace(/^.*[\\\/]/, '')})
        }
        
        archive.finalize()
        setTimeout(()=>{
            res.download(__dirname + '/downloads.zip')
        }, 2000)
    }
})

app.listen(3000)