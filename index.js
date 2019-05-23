var express = require('express')
var shortid = require('shortid')
var app = express();
var fs = require('fs')
var server = require('http').Server(app);
var io = require('socket.io')(server);
var puppeteer = require('puppeteer');
var exec = require('child_process').exec

app.use(express.static('public'))
app.use(express.static('bower_components'))
app.set('view engine', 'ejs')

app.get('/', function (req, res) {
  res.render('index');
});

//socket.emit('feed', { screen: 'abc', ts: 'abc' });
io.on('connection', function (socket) {
        screenGrab(socket);
    });

var screenGrab = function(socket){
        var fn = `screen.png`;
        var url = 'https://www.timeanddate.com/worldclock/india/new-delhi';
        (async function(){
            //const browser = await puppeteer.launch({headless: true})
            const browser = await puppeteer.launch({
              ignoreHTTPSErrors: true,
             slowMo : 150,
               args: [
                '--no-sandbox',
                '--window-size:1920,1080'
                // '--disable-setuid-sandbox',
              ]
            });
            const page = await browser.newPage()
            await page.setViewport({width:1920, height: 1080});
            await page.goto(url,{ 
              waitUntil: 'networkidle2'
            });
            await page.screenshot({ path: `${__dirname}/public/screenshots/${fn}` });
            browser.close();
            socket.emit('feed', {screen: fn, ts: 'abc'})
            screenGrab(socket);
          })();
};

server.listen(3000);