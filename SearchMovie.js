module.exports = function () {
    const http = require('http');
    const querystring = require('querystring');
    const url = require('url');
    let curpage = 0;
    let pagesize = 100;
    let total = 0;
    this.SearchMovie=function(start=1,count=20,q,response){
        let params = {
            apikey: '0b2bdeda43b5688921839c8ecb20399b',
            q: q,
            start:start,
            count:count,
        };
        let contents = querystring.stringify(params);
        let options = {
            hostname: url.parse('https://api.douban.com').hostname,
            path: '/v2/movie/search',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': contents.length
            }
        }
        let strem = '';
        let req = http.request(options, function (res) {
            let strem = '';
            res.setEncoding('utf8');
            res.on('data', function (data) {
                strem = strem + data;
                //console.log("data:",data);   //一段html代码
            });
            res.on('end', () => {
                if (strem != '') {
                    let result = JSON.parse(strem);
                    if (result.ret == '200') {
                        response.json(result)
                    } else {
                        response.json({'error':result.msg})
                    }
                }
            });
            req.on('error', (e) => {
                response.json({'error':`${e.message}`});
            });
        });

        req.write(contents);
        req.end;
    }
}