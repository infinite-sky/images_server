/*!
 * 图片访问接口
 */
'use strict';
const path = require('path');
const fs = require('fs-extra');
const Promise = require('bluebird');
const lodash = require('lodash');
const gm = require('gm');
const config = require('config');

Promise.promisifyAll(gm.prototype);

const logger = require('../tools/logger');

const imgReg = /(?:[_.](\d{2,6})x(\d{2,6})(?:Q(\d{1,3}))?(S|SM|ST|SB|SL|SR)?\.(?:jpg|jpeg|png|webp))$/;
const gifReg = /(?:.gif)(\[0]\.(?:jpg|jpeg|png|webp))?$/;
const cropReg = /_crop_((_?\d{1,4}(?:\.\d)?){4})\.(?:jpg|jpeg|png|webp)$/;

/**
 * ###图片访问接口
 * 
 * 生成的图片格式可以为jpg、jpeg、png、webp
 * 
 * 图片名称中使用 - 分隔不同信息，附加信息使用 _ 分隔，如_120x120Q100代表120x120大小的，质量不变的图片
 * 
 * 支持的参数有 Q:图片质量（0 - 100） SM:居中截取  ST:居上截取  SB:居下截取  SL:居左截取  SR:居右截取  100x100:图片大小
 * 
 * 图片裁剪: /images/a1/04/sd98fjh23r8aj892sdgf.jpg_crop_x_y_w_h.jpg (x,y,w,h均为各个方向裁剪的数字)
 * 
 * gif图片首帧: .gif[0].jpg
 * 
 */

exports.accessImage = function(req, res){
    let url = decodeURIComponent(req.url);
    let vhostInfo = req.vhostInfo;                      //vhosts.json中内容
    let subDir = (vhostInfo && vhostInfo.dir) ? vhostInfo.dir : config.upload.misDir;
    let fileDir = path.join(config.upload.rootDir, subDir);

    let pathName = path.join(fileDir, url);

    logger.info('accessImage fileDir', fileDir);
    logger.info('accessImage subDir', subDir);
    logger.info('accessImage pathname', pathName);       //图片完整路径

    function sendFile(filePath){
        res.header('Cache-Control', 'public, max-age=3153600');
        return res.sendFile(filePath, {root:'/'});
    }

    //处理GIF图片，根据url判断返回的第一帧还是原图，如果返回gifMatch[1]值为'[0].jpg'
    let gifMatch = pathName.match(gifReg);
    if(gifMatch){
        if(gifMatch[1]){
            let thumbnail10 = path.join(fileDir, url.replace('images', 'thumbnail'));

            //第一帧存在即直接返回
            if(fs.existsSync(thumbnail10)) return sendFile(thumbnail10);
            let oriFilePath = pathName.replace(gifMatch[1], '');
            if(fs.existsSync(oriFilePath)){
                let pathName0 = `${oriFilePath}[0]`;
                fs.mkdirsSync(path.dirname(thumbnail10));
                return gm(pathName0).writeAsync(thumbnail10).then(() =>{
                    return sendFile(thumbnail10);
                }).catch((err) =>{
                    logger.err(err);
                    res.status(404);
                    return res.end();
                });
            }else{
                logger.warn('原图不存在');
                res.status(404);
                return res.end();
            }
        }else{
            if(fs.existsSync(pathName)) return sendFile(pathName);
            res.status(404);
            return res.end();
        }
    }

    //裁剪图片
    let cropRegMatch = pathName.match(cropReg);
    if(cropRegMatch){
        let cropImgFile = path.join(fileDir, url.replace('images', 'crops'));

        if(fs.existsSync(cropImgFile)) return sendFile(cropImgFile);

        let originImgUrl = pathName.replace(cropRegMatch[0], '');
        if(fs.existsSync(originImgUrl)){
            let xywh = cropRegMatch[1].split('_');

            let cropX = xywh[0];
            let cropY = xywh[1];
            let cropW = xywh[2];
            let cropH = xywh[3];

            fs.mkdirsSync(path.dirname(cropImgFile));

            return gm(originImgUrl).crop(cropW, cropH, cropX, cropY).writeAsync(cropImgFile)
            .then(() => {
                return sendFile(cropImgFile);
            })
            .catch((err) => {
                logger.error(err);
                return sendFile(originImgUrl);
            })
        }else{
                logger.warn('原图不存在');
                res.status(404);
                return res.end();
        }
    }

        //缩略图
        let strMatch = pathName.match(imgReg);

        if(!strMatch){
            if(fs.existsSync(pathName)){
                return sendFile(pathName);
            }else{
                res.status(404);
                return res.end();
            }
        }

        // TODO 使用缓存提升判断速度，合并产生的同样图片的URL

        let thumbnail = path.join(fileDir, url.replace('images', 'thumbnail'));

        //缩略图存在直接返回
        if(fs.existsSync(thumbnail)){
            return sendFile(thumbnail);
        }

        let x = strMatch[1];
        let y = strMatch[2];
        let q = strMatch[3] || 100;
        let s = strMatch[4];

        if(config.imgSizes && !config.imgSizes[`${x}x${y}`]){
            res.status(404);
            return res.end();
        }

        let originImgPath = pathName.replace(strMatch[0], '');

        if(fs.existsSync(originImgPath)){
            return getImgSizeInfoAsync().then((image) =>{
                let width = image.width;
                let height = image.height;
                let w = width,h = height;

                if(width >= height && height > x){
                    w = parseInt(x * width / height, 10);
                    h = x;
                }else if(width < height && width > x){
                    w = x;
                    h = parseInt(x * height / width, 10);
                }else{
                    //原图尺寸小于缩略图尺寸，返回原图
                    return sendFile(originImgPath);
                }

                fs.mkdirsSync(path.dirname(thumbnail));

                let onlyThumbnailPath = s ? thumbnail.replace(s, '') : thumbnail;

                function thumbAsync(){
                    if(!fs.existsSync(onlyThumbnailPath)) return gm(originImgPath).thumbAsync(w, h, onlyThumbnailPath, q);
                    return Promise.resolve();
                }

                return thumbAsync().then(() => {
                    logger.info('thumbnail:', thumbnail);

                    if(width !== height && s){
                        let min = lodash.min([x, y]);
                        let posLTx = 0,posLTy = 0;

                        if(width > height){
                            switch(s){
                                case 'SM':
                                    posLTx = (w - min) / 2;
                                    break;
                                case 'SL':
                                    posLTx = 0;
                                    break;
                                case 'SR':
                                    posLTx = w - min;
                                    break;
                                default:
                                    posLTx = (w - min) / 2;
                                    posLTy = (h - min) / 2;
                            }
                        }else{
                             switch(s){
                                case 'SM':
                                    posLTx = (h - min) / 2;
                                    break;
                                case 'ST':
                                    posLTx = 0;
                                    break;
                                case 'SB':
                                    posLTx = h - min;
                                    break;
                                default:
                                    posLTx = (w - min) / 2;
                                    posLTy = (h - min) / 2;
                            }                           
                        }

                        logger.info('crop:', s, min, min , posLTx, posLTy, onlyThumbnailPath);

                        let cropThumbnail = thumbnail;
                        return gm(onlyThumbnailPath).crop(min, min, posLTx, posLTy).writeAsync(cropThumbnail)
                            .then(() =>{
                                return sendFile(cropThumbnail);
                            })
                            .catch((err) =>{
                                logger.error(err);
                                return sendFile(originImgPath);
                            });
                    }
                    return sendFile(onlyThumbnailPath);
                });
            }).catch((err) => {
                logger.error(err);
                return sendFile(originImgPath);
            })
        }else{
            logger.warn(`原图不存在：${originImgPath}`);
            res.status(404);
            return res.end();
        }

        function getImgSizeInfoAsync(){
            let matchImgInfo = /\/[a-z0-9]{2}\/[a-z0-9]{2}\/[a-z0-9]{32}-(\d{1,10})-(\d{1,5})x(\d{1,5}).*$/.exec(url);
            if(!matchImgInfo) return gm(originImgPath).sizeAsync();
            return Promise.resolve({
                size:+matchImgInfo[1],
                width:+matchImgInfo[2],
                height:+matchImgInfo[3]
            });
        }

}
