'use strict';
const path = require('path');
const config = require('config');

const imageService = require('../services/images');

exports.remoteImage = function(req, res, next){
    let vhostInfo = req.vhostInfo;
    let subDir = (vhostInfo && vhostInfo.dir) ? vhostInfo.dir : config.upload.misDir;
    let fileDir = path.join(config.upload.rootDir, subDir, config.upload.imgUrlPath);

    let imageInfos = req.imageInfos;

    imageService.handleImage(req.headers, vhostInfo, imageInfos, fileDir).then((result) =>{
        next({status:'success', msg:result.imageInfos});
    }).catch((err) =>{
        next({status:'error', err:err});
    })
}