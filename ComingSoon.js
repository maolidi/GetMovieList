module.exports = function () {
    const UploadLog=require('./UploadLog.js');
    const http = require('http');
    const querystring = require('querystring');
    const url = require('url');
    const md5 = require("md5");
    const app_key = 'D6DB109962C51409003832ED01BDF815';
    const app_secrect = 'tlYjIcUPXaddc9uIPTYsZxcZZnjTF1tGj8nSMF3NeRmOTZ2PNFV9oqEE';
    let curpage = 0;
    let pagesize = 100;
    let total = 0;
    let uploadLog=new UploadLog();
    this.init = () => {
        this.GetData();
    };
    this.GetData = () => {
        let obj = this;
        let contents = querystring.stringify({
            count: pagesize,
            start: curpage,
            apikey:'0b2bdeda43b5688921839c8ecb20399b',
        });
        let options = {
            hostname: url.parse('http://api.douban.com').hostname,
            path: '/v2/movie/coming_soon',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': contents.length
            }
        }
        let toCount = (curpage + pagesize) < total ? (curpage + pagesize) : total;
        console.log('开始获取' + curpage + '-' + toCount + ' 即将上映 数据');
        let req = http.request(options, function (res) {
            let strem = '';
            res.setEncoding('utf8');
            res.on('data', function (data) {
                strem = strem + data;
                //console.log("data:",data);   //一段html代码
            });
            res.on('end', () => {
                strem = JSON.parse(strem);
                if (typeof strem.total != 'undefined' && strem.total != 0) {
                    for (let i = 0; i < strem['subjects'].length; i++) {
                        let key = Object.keys(strem['subjects'][i]);
                        for (let j = 0; j < key.length; j++) {
                            if (typeof strem['subjects'][i][key[j]] == 'object') {
                                strem['subjects'][i][key[j]] = JSON.stringify(strem['subjects'][i][key[j]]);
                            }
                        }
                        strem['subjects'][i]['years'] = strem['subjects'][i]['year'];
                        strem['subjects'][i]['artId'] = strem['subjects'][i]['id'];
                        delete strem['subjects'][i]['year'];
                        delete strem['subjects'][i]['id'];
                    }
                    if (total == '0') {
                        total = strem.total;
                        obj.DeleteData(JSON.stringify(strem['subjects']));
                    } else {
                        total = strem.total;
                        obj.UpdateData(JSON.stringify(strem['subjects']));
                    }
                } else {
                    console.log(strem);
                }
            });
            req.on('error', (e) => {
                console.error(`problem with request: ${e.message}`);
            });
        });

        req.write(contents);
        req.end;
    }
    this.UpdateData = data => {
        let obj = this;
        let params = {
            app_key: app_key,
            datas: data,
            model_name: 'comingSoon',
            sign: md5(app_key + data + 'comingSoon' + 'App.Table.MultiCreate' + app_secrect).toUpperCase()
        };
        console.log('开始导入 即将上映 数据');
        let contents = querystring.stringify(params);
        let options = {
            hostname: url.parse('http://hn2.api.okayapi.com').hostname,
            path: '/?s=App.Table.MultiCreate',
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
                if (strem.ret == '200') {
                    if(curpage + pagesize < total){
                        console.log(' 即将上映 导入成功');
                        curpage += pagesize;
                        obj.GetData();
                    }else{
                        console.log(' 即将上映 数据更新完成');
                        uploadLog.UpLog(' 即将上映 数据更新完成','INFO');
                    }
                } else {
                    console.log(strem);
                }
                //myres.write(strem);
            });
            req.on('error', (e) => {
                console.error(`problem with request: ${e.message}`);
            });
        });

        req.write(contents);
        req.end;
    }
    this.DeleteData = data => {
        let obj = this;
        let params = {
            app_key: app_key,
            model_name: 'comingSoon',
            where: JSON.stringify([
                ["id", "<>", ""]
            ]),
            sign: md5(app_key + 'comingSoon' + 'App.Table.FreeDelete' + JSON.stringify([
                ["id", "<>", ""]
            ]) + app_secrect).toUpperCase()
        };
        //console.log(data);
        let contents = querystring.stringify(params);
        let options = {
            hostname: url.parse('http://hn2.api.okayapi.com').hostname,
            path: '/?s=App.Table.FreeDelete',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': contents.length
            }
        }
        console.log('正在删除 即将上映 旧数据');
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
                        console.log(' 即将上映 删除成功');
                        obj.UpdateData(data);
                    } else {
                        console.log(result);
                    }
                }
            });
            req.on('error', (e) => {
                console.error(`problem with request: ${e.message}`);
            });
        });

        req.write(contents);
        req.end;
    }
    this.GetSqlData=function(start=1,count=20,response){
        let params = {
            app_key: app_key,
            model_name: 'comingSoon',
            page:start,
            perpage:count,
            where: JSON.stringify([
                ["id", "<>", ""]
            ]),
            sign: md5(app_key + 'comingSoon'+start+count + 'App.Table.FreeQuery' + JSON.stringify([
                ["id", "<>", ""]
            ]) + app_secrect).toUpperCase()
        };
        //console.log(data);
        let contents = querystring.stringify(params);
        let options = {
            hostname: url.parse('http://hn2.api.okayapi.com').hostname,
            path: '/?s=App.Table.FreeQuery',
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
                        if(result.data['err_code']==0){
                            for(let i=0;i<result.data.list.length;i++){
                                result.data.list[i]['rating']=JSON.parse(result.data.list[i]['rating']);
                                result.data.list[i]['genres']=JSON.parse(result.data.list[i]['genres']);
                                result.data.list[i]['casts']=JSON.parse(result.data.list[i]['casts']);
                                result.data.list[i]['durations']=JSON.parse(result.data.list[i]['durations']);
                                result.data.list[i]['directors']=JSON.parse(result.data.list[i]['directors']);
                                result.data.list[i]['pubdates']=JSON.parse(result.data.list[i]['pubdates']);
                                result.data.list[i]['images']=JSON.parse(result.data.list[i]['images']);
                            }
                            response.json({'total':result.data.total,'data':result.data.list})
                        }else{
                            response.json({'error':result.data['err_msg']})
                        }
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