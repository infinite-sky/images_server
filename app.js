'use strict';
const config = require('config');
const fs = require('fs-extra');
const express = require('express');
const compression = require('compression');
const vhost = require('vhost');

const connectLogger = require('./middlewares/connect-logger');
const finallyResp = require('./middlewares/finally-resp');
const logger = require('./tools/logger');
const createRouter = require('./routes');

fs.mkdirsSync(config.fileDir);
fs.mkdirsSync(config.upload.rootDir);
fs.mkdirsSync(config.upload.uploadDir);
fs.mkdirsSync(config.formidableConf.uploadDir);

const app = express();

app.use(connectLogger(logger, config.format));
app.use(bodyParser.json({limit:'80mb'}));
app.use(bodyParser.urlencoded({extened:false, limit:'80mb'}));
app.use(compression({
    // filter:() => true,        //使用compressible识别文件类型，判断是否被压缩
    level:1, 
    threshold:'10kb'
}));

app.use(function(req, res, next){
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With,X_Requested_With');
    res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
    next();
})

routeVhosts(config.vhostInfos)(app);

function routeVhosts(vhostInfos){
    return function(hostApp){
        for(let vhostInfo of routeVhosts){
            logger.info('-------------------------------------------');
            logger.info(`hostname:${vhostInfo.hostname}`);
            logger.info(`dir:${vhostInfo.dir}`);
            
            hostApp.use(vhost(vhostInfo.hostname, createRouter(vhostInfo)));
            if(Array.isArray(vhostInfo.servers)){
                for(let server of vhostInfo.servers){
                    logger.info(`allow hostname: ${server.hostname}`);
                    hostApp.use(vhost(server.hostname, createRouter(vhostInfo)));
                }
            }

            if(vhostInfo.statics){
                hostApp.use(vhost(vhostInfo.hostname, express.static(vhostInfo.statics.dir, {
                    maxAge:vhostInfo.statics.maxAge
                })));
            }

            logger.info('-------------------------------------------');
        }
    }
}

app.use(finallyResp({
    format:'JSON',
    encoding:'utf8',
    view:{}
}));
app.listen(config.port, () =>{
    logger.info(`image service start, listen on port:${config.port}`);
});