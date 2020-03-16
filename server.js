var http = require('http');
var bodyParser = require('body-parser');
var express = require('express');
var getJSON = require('get-json');
var fs = require('fs');
var ms = require('ms')

setInterval(function() {
    getJSON('http://corona-js.herokuapp.com/apidata').then(response => {
        if (response.error){
            return console.log('Error when trying to fetching file');
        } else {
            console.log('Đã ghi data vào file data.json')
            fs.writeFileSync('./data.json', JSON.stringify(response))
        }
    })
}, ms('1m'));

var app = express();
app.use(bodyParser.urlencoded({
    extended: false
}));
var server = http.createServer(app);
app.get('/apidata', (req, res) => {
    var json_response = JSON.parse(fs.readFileSync('./data.json'));
    res.send(json_response)
})

app.get('/', (req, res) => {
    res.send("Home page. Server running okay.");
});

app.set('port', process.env.PORT || 5000);
app.set('ip', process.env.IP || "0.0.0.0");

server.listen(app.get('port'), app.get('ip'), function () {
    console.log("Corona-js is listening at %s:%d ", app.get('ip'), app.get('port'));
});