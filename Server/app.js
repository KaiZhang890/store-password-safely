var express = require('express');
var https = require('https');
var fs = require('fs');
var bcrypt = require('bcrypt-nodejs');

var passwords = ["$2a$10$FoMAdDroEAnHKCAC9wL4f.Gdl5y1q77TshMM5qPK4Wdlkasrl43em"];

var options = {
	key: fs.readFileSync('keys/privatekey.pem'),
	cert: fs.readFileSync('keys/certificate.pem')
};

var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function (req, res) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ name: 'test' }));
});

app.post('/password', function (req, res) {
         var p = req.body.password;
         if (typeof p !== 'underfined' && p) {
            res.setHeader('Content-Type', 'application/json');
            bcrypt.hash(p, null, null, function(err, hash) {
                res.send(JSON.stringify({password: hash}));
            });
         } else {
            res.send({ status: 'FAILED' });
         }
         
});

app.get('/password', function (req, res) {
        res.setHeader('Content-Type', 'application/json');
        
        var p = req.query.password;
        if (typeof p !== 'underfined' && p) {
            var isExists = false;
            for (var i = 0; i < passwords.length; i++) {
                if (bcrypt.compareSync(p, passwords[i])) {
                    isExists = true;
                    break;
                }
            }
            if (isExists) {
                res.send({ status: 'Exist' });
            } else {
                res.send({ status: 'Not Exist' });
            }
        } else {
            res.send({ status: 'FAILED' });
        }
});

var httpsServer = https.createServer(options, app);
httpsServer.listen(8080);
