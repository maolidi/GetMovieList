module.exports = function () {
    const http = require('http');
    const querystring = require('querystring');
    const url = require('url');
    const md5 = require("md5");
    const app_key = 'D6DB109962C51409003832ED01BDF815';
    const app_secrect = 'tlYjIcUPXaddc9uIPTYsZxcZZnjTF1tGj8nSMF3NeRmOTZ2PNFV9oqEE';

    this.UpLog = (log, type) => {
        let obj = this;
        let params = {
            app_key: app_key,
            message: log,
            type: type,//ERROR/WARNING/NOTICE/INFO/DEBUG
            sign: md5(app_key + log + 'App.Logger.Record' + type + app_secrect).toUpperCase()
        };
        let contents = querystring.stringify(params);
        let options = {
            hostname: url.parse('http://hn2.api.okayapi.com').hostname,
            path: '/?s=App.Logger.Record',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': contents.length
            }
        }
        let req = http.request(options, function (res) {
            let strem = '';
            res.setEncoding('utf8');
            res.on('data', function (data) {
                strem = strem + data;
                //console.log("data:",data);   //一段html代码
            });
            res.on('end', () => {
                strem = JSON.parse(strem);
                console.log(strem);
                //myres.write(strem);
            });
            req.on('error', (e) => {
                console.error(`problem with request: ${e.message}`);
            });
        });

        req.write(contents);
        req.end;
    }
}