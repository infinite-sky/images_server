'use strict';
const express = require('express');
const config = require('config');

const accessImageCtrl = require('../controller/access-images');
// const qrcodeImageCtrl = require('../controller/qrcode-images');
// const remoteImageCtrl = require('../controller/remote-images');
// const ueditorImageCtrl = require('../controller/ueditor-images');
const uploadImageCtrl = require('../controller/upload-images');
// const webpageImageCtrl = require('../controller/webpage-images');

const attachVhostInfo = require('../middlewares/vhost-info');

const middlewares = require('../middlewares');
const formParser = middlewares.formParser;
const base64image = middlewares.base64image;
// const remoteImage = middlewares.remoteImage;
// const webpageImage = middlewares.webpageImage;

module.exports = function createRouter(vhostInfo){
    let vhostRouter = express.Router().use(attachVhostInfo(vhostInfo));
    vhostRouter.post('/images', formParser.parse(config.formidableConf), uploadImageCtrl.uploadImgFile);
    // vhostRouter.post('/images/base64', base64image.parse(config.upload), uploadImageCtrl.uploadBase64String);

    vhostRouter.get('/images/:xx/:yy/*', accessImageCtrl.accessImage);

    return vhostRouter;
}
