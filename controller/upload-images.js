'use strict';
const path = require('path');
const config = require('config');

const logger = require('../tools/logger');
const imageService = require('../services/images');

/**
 * ### 图片文件上传接口
 * 
 * 图片文件使用md5标识，可以避免文件重复问题，但是同一个文件会被多次引用，所以需要谨慎管理图片文件，避免文件丢失
 * 
 * 上传form说明：
 * 用一个隐藏的input把上传图片时使用的name告诉服务端，服务端用来索引上传的文件
 * 如：<input type="text" name="imagesInputName" value="images1,images2" hidden/>
 */

exports.uploadImgFile = function(req, res, next){
    let vhostInfo = req.vhostInfo;
    let subDir = (vhostInfo && vhostInfo.dir) ? vhostInfo.dir : config.upload.miscDir;
    let fileDir = path.join(config.upload.rootDir, subDir, config.upload.imgUrlPath);

    let fields = req.formdata.fields;
    let files = req.formdata.files;

    imageService.handleFormImage(req.headers, vhostInfo, fields, files, fileDir).then((result) =>{
        next({status:'success', msg:result.imageInfos, ext:result.fields});
    }).catch((err) =>{
        next({status:'error', err:err});
    });
}
