'use strict';
const qrdecoder = require('node-zxing')({});

/**
 * 上传二维码并识别二维码信息
 */
exports.decode = function(req, res, next){
    qrdecoder.decode(path, (err, out) =>{

    })
}

/**
 * 生成二维码信息
 */
exports.encode = function(req, res, next){
    
}