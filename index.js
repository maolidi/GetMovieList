const express = require('express');
const app = express();
const https = require("https");
const fs = require("fs");
const bodyParser = require('body-parser');
const TopMovie = require('./topMovie.js');
const ComingSoon = require('./ComingSoon.js');
const Weekly = require('./Weekly.js');
const InTheaters = require('./InTheaters.js');
const NewMovies = require('./NewMovies.js');
const UsBox = require('./UsBox.js');
const SearchMovie = require('./SearchMovie.js');
let topData = new TopMovie();
let comingSoon = new ComingSoon();
let weekly=new Weekly();
let inTheaters=new InTheaters();
let newMovies=new NewMovies();
let usBox=new UsBox();
let searchMovie=new SearchMovie();

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

setInterval(function () {
    let t = new Date().getHours();
    if (t >= 1 && t <= 3) {
        init();
    }
}, 3600000*3);

//init();
function init() {
    //更新TOP250数据
    topData.init();
    //更新即将上映
    comingSoon.init();
    //更新热映榜
    inTheaters.init();
    //更新新片榜
    newMovies.init();
    //更新口碑榜
    weekly.init();
    //更新北美票房榜
    usBox.init();
}

app.get('/', function(req, res) {
    // 获取参数
    var query = req.body;
    res.send('hello , world');
});
app.post('/comingSoon', function(req, res) {
    // 获取参数
    let query = req.body;
    comingSoon.GetSqlData(query.start,query.count,res);
});
app.post('/inTheaters', function(req, res) {
    // 获取参数
    let query = req.body;
    inTheaters.GetSqlData(query.start,query.count,res);
});
app.post('/newMovies', function(req, res) {
    // 获取参数
    let query = req.body;
    newMovies.GetSqlData(query.start,query.count,res);
});
app.post('/usBox', function(req, res) {
    // 获取参数
    let query = req.body;
    usBox.GetSqlData(query.start,query.count,res);
});
app.post('/weekly', function(req, res) {
    // 获取参数
    let query = req.body;
    weekly.GetSqlData(query.start,query.count,res);
});
app.post('/topMovie', function(req, res) {
    // 获取参数
    let query = req.body;
    topData.GetSqlData(query.start,query.count,res);
});
app.post('/searchMovie', function(req, res) {
    // 获取参数
    let query = req.body;
    searchMovie.SearchMovie(query.start,query.count,query.q,res);
});
const server = app.listen(3000, () => {
    console.log('0.0.0.0:3000 server已启动');
});
// Configuare httpsconst
httpsOption = { key : fs.readFileSync("./ssl/ssl.key"), cert: fs.readFileSync("./ssl/ssl.pem")}
// Create servicelet
https.createServer(httpsOption, app,()=>{
    console.log('https://0.0.0.0:44330 server已启动');
}).listen(44330);
