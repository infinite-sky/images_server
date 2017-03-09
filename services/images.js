'use strict';
const Promise = require('bluebird');
const fs = require('fs-extra');
const fspro = require('node-fs');
const path = require('path');
const mime = require('mime');
const gm = require('gm');
const _ = require('lodash');
const config = require('config');
const hasha = require('hasha');

const models = require('../models');

const imageFieldsPick = ['name', 'date', 'hash', 'size', 'format', 'mime', 'url'];

Promise.promisifyAll(gm.prototype);
Promise.promisifyAll(fs);

let hashFileAsync = Promise.promisifyAll(hasha.fromFile);

function saveAsFile(file, rootDir){
    console.log('saveAsFile, ====================================');
    let pathName = file.path;
    let ext = path.extname(pathName).toLowerCase();
    let fileName = path.basename(pathName, ext).replace(/^upload_/, '');
    let firstFile = fileName.substring(0, 2);
    let secondFile = fileName.substring(2, 4);

    let realExt = `.${file.format.toLowerCase()}`;

    //gif图片下，file.geometry是一个数组，为了避免图片过长只取file.geimetry[0]
    let geometry = file.geometry;

    geometry = Array.isArray(geometry) ? file.geometry[0] : geometry;

    fileName += `-${file.size}-${geometry}${ext}`;

    if(ext !== realExt && ext !== '.jpg' && ext !== '.jpeg') fileName += realExt;

    let filePath = `/${firstFile}/${secondFile}/${fileName}`;
    let newFilePath = path.join(rootDir, filePath);

    fspro.mkdirSync(path.dirname(newFilePath), 755, true);
    fs.renameSync(pathName, newFilePath);
    return filePath;
}

exports.handleImage = function(headers, vhostInfo, fields, files, fileDir, options){
    let date = new Date();
    let imageInfos = [];
    return Promise.resolve(files).each((file) => {
        return saveImageToDB(headers, vhostInfo, fileDir, file, date, options).then((imageInfo) =>{
            imageInfos.push(_.pick(imageInfo, imageFieldsPick));
        });        
    }).return({imageInfos});
}

exports.handleFormImage = function(headers, vhostInfo, fields, files, fileDir){
    let imageInputNames = fields.imagesInputName || 'images';
    let date = new Date(), imageInfos = [];

    return Promise.resolve(imageInputNames.split(',')).each((filename) =>{
        let file = files[filename];

        if(!file) return Promise.reject(`找不到文件：${filename}`);

        if(file.size === 0) return Promise.reject(`文件为空：${filename}`);

        return saveImageToDB(headers, vhostInfo, fileDir, file, date).then((imageInfo) =>{
            imageInfos.push(_.pick(imageInfo, imageFieldsPick));
        });
    }).return({imageInfos})
};


function saveImageToDB(headers, vhostInfo, fileDir, file, date, options){
    options = options || {};
    return models.Image.getImgInfoAsync(vhostInfo, file).then((result) =>{
        date = date || new Date();

        let imageInfo = {
            name:file.name,
            hash:file.hash,
            size:file.size,
            host:vhostInfo.host,
            ua:headers['user-agent'],
            root:fileDir,
            date:date
        };

        if(result){
            imageInfo.url = result.url;
            imageInfo.format = result.fromat;
            return Promise.resolve(imageInfo);
        }else{
            if(options.autoOrient){
                //图片信息被修改，hash和size需要重新计算
                delete file.hash;
                delete file.size;
                return gm(file.path).autoOrient().writeAsync(file.path).then(() => saveAs());
            }
            return saveAs().tap((image) => models.Image.create(image));
        }

        function saveAs(){
            return exports.attchFileInfo(file).then(() =>{
                return gm(file.path).identifyAsync().then((identify) =>{
                    file.format = imageInfo.format = identify.format;
                    file.mime = file.type || mime.lookup(file.format.toLowerCase());
                    file.geometry = imageInfo.geometry = identify.Geometry;
                    imageInfo.mime = file.mime;
                    imageInfo.url = `http://${vhostInfo.host}${config.upload.imgUrlPath}${saveAsFile(file, fileDir)}`;
                    return Promise.resolve(imageInfo);
                });
            });
        }
    });
}

exports.attchFileInfo = function(file){
    return Promise.resolve()
        .then(() =>{
            if(!file.hash){
                return hashFileAsync(file.path, {algorithm:'md5'}).then((stat) => (file.hash = hash));
            }
            return null;
        })
        .then(() => {
            file.name = file.name || file.hash;
        })
}

