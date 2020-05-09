
var express = require('express');
var app = express();
var path = require('path');
var fs = require('fs');

var nodeServer = function(port){
    app.use(express.static(path.join(__dirname, '../dist')));  
    app.use(function(req, res, next) {
        fs.readFile(path.join(__dirname, '../dist') + '/index.html', function(err, data){
            if(err){
                console.log(err);
                res.send('后台错误');
            } else {
                res.writeHead(200, {
                    'Content-type': 'text/html',
                    'Connection':'keep-alive'
                });
                res.end(data);
            }
        })
    });
    //开启服务
    app.listen(port, (err) => {
        if (err) {
            return console.error(err);
        }
        console.info(`监听 ${port} 端口`);
    });
}

module.exports = nodeServer;