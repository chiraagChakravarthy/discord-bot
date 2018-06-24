const fs = require('fs')
var downloads = JSON.parse(fs.readFileSync(__dirname + '/download.json'))
module.exports = function(download){
    if(!downloads.includes(download)){
        downloads.push(download)
        fs.writeFileSync(__dirname + '/download.json', JSON.stringify(downloads))
    }
}