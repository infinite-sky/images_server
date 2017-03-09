'use strict';
/**
 * Created by admin on 2016/8/15.
 */
const Promise = require('bluebird');
const mongoose = require('mongoose');
const config = require('config');

if(config.mongodb && config.mongodb.url){
    let image = mongoose.model('Image', require('./image'));

    mongoose.connect(config.mongodb.url);

    image.getImgInfoAsync = function(vhostInfo, file){
        return image.findOne({host:vhostInfo.host, hash:file.hash});
    };

    exports.Image = image;
}else{
   exports.Image = {
       getImgInfoAsync :function(){
           return Promise.resolve(null);
       }
   }; 
}

