module.exports = function () {
    const UploadLog=require('./UploadLog.js');
    const http = require('http');
    const querystring = require('querystring');
    const url = require('url');
    const md5 = require("md5");
    const app_key = 'D6DB109962C51409003832ED01BDF815';
    const app_secrect = 'tlYjIcUPXaddc9uIPTYsZxcZZnjTF1tGj8nSMF3NeRmOTZ2PNFV9oqEE';
    let uploadLog=new UploadLog();
    this.init = () => {
        this.GetData();
    };
    this.GetData = () => {
        let obj = this;
        let contents = querystring.stringify({
            apikey:'0b2bdeda43b5688921839c8ecb20399b',
        });
        let options = {
            hostname: url.parse('http://api.douban.com').hostname,
            path: '/v2/movie/weekly',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': contents.length
            }
        }
        console.log('开始获取 口碑榜  数据');
        let req = http.request(options, function (res) {
            let strem = '';
            res.setEncoding('utf8');
            res.on('data', function (data) {
                strem = strem + data;
                //console.log("data:",data);   //一段html代码
            });
            res.on('end', () => {
                strem = JSON.parse(strem);
                if (typeof strem.subjects != 'undefined') {
                    let formData=[];
                    for (let i = 0; i < strem['subjects'].length; i++) {
                        strem['subjects'][i]['subject']['years'] = strem['subjects'][i]['subject']['year'];
                        strem['subjects'][i]['subject']['artId'] = strem['subjects'][i]['subject']['id'];
                        delete strem['subjects'][i]['subject']['year'];
                        delete strem['subjects'][i]['subject']['id'];
                        let key = Object.keys(strem['subjects'][i]['subject']);
                        let tmp={};
                        for (let j = 0; j < key.length; j++) {
                            if (typeof strem['subjects'][i]['subject'][key[j]] == 'object') {
                                strem['subjects'][i]['subject'][key[j]] = JSON.stringify(strem['subjects'][i]['subject'][key[j]]);
                            }
                            tmp[key[j]]=strem['subjects'][i]['subject'][key[j]];

                        }
                        if(typeof strem['subjects'][i]['rank']!='undefined'){
                            tmp['rank']=strem['subjects'][i]['rank'];
                        }
                        formData.push(tmp);
                    }
                    //console.log(formData);
                    obj.DeleteData(JSON.stringify(formData));
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
            model_name: 'weekly',
            sign: md5(app_key + data + 'weekly' + 'App.Table.MultiCreate' + app_secrect).toUpperCase()
        };
        console.log('开始导入 口碑榜  数据');
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
                    console.log(' 口碑榜  数据更新完成');
                    uploadLog.UpLog(' 口碑榜 数据更新完成','INFO');
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
            model_name: 'weekly',
            where: JSON.stringify([
                ["id", "<>", ""]
            ]),
            sign: md5(app_key + 'weekly' + 'App.Table.FreeDelete' + JSON.stringify([
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
        console.log('正在删除 口碑榜  旧数据');
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
                        console.log(' 口碑榜  删除成功');
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
            model_name: 'weekly',
            page:start,
            perpage:count,
            where: JSON.stringify([
                ["id", "<>", ""]
            ]),
            sign: md5(app_key + 'weekly'+start+count + 'App.Table.FreeQuery' + JSON.stringify([
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