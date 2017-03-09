'use strict';
const Promise = require('bluebird');
const _ = require('lodash');
const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const config = require('config');

//上传base64格式的字符串
exports.parse = function(options){
    return function(req, res, next){

        if(typeof images === 'string'){
            images = JSON.parse(images);
        }

        if(!Array.isArray(images)){
            return next({status:'paramError', msg:'images'});
        }

        let imageInfos = req.imageInfos = [];
        return Promise.resolve(images).each((image) => {
            return decodeBase64Image(image.base64String, options.uploadDir)
                .then((imageInfo) =>{
                    imageInfo.name = image.name;
                    imageInfos.push(imageInfo);
                });
        }).then(() =>{
            next();
        }).catch(next);
    }
}

function decodeBase64Image(base64String, filePath){
    base64String = _.trim(base64String);
    if(!base64String || base64String === ''){
        throw TypeError('base64String not exists');
    }

    let data = base64String.replace(/^data:image\/[a-z]{3,6};base64,/,'');
    let prefix = /^data:image\/[a-z]{3,6};base64,/.exec(base64String);

    let type = prefix ? prefix[1] : '';
    let buf = new Buffer(data, 'base64');

    let md5 = crypto.createHash('md5');
    let hash = md5.update(buf).digest('hex');

    let fileName = `${hash}.${type}`;
    let firstFile = fileName.substring(0, 2), secondFile = fileName.substring(2, 4);

    // let filePath = ;
    let fullPath = path.join(config.fileDir, `/${firstFile}/${secondFile}/${fileName}`);

    fs.mkdirsSync(path.dirname(fullPath), 755, true);

    return new Promise((resolve, reject) =>{
        
    })

}