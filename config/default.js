'use strict';
module.exports = {
    port:8088,

    log:{
        dir:'/raid/image_service/log/',
        format:':remote-addr :method :url :statue :content-length :response-time',
        replaceConsole: true,
        level         : 'AUTO',
        console       : true
    },

    vhostInfos:require('./vhosts.json'),

    fileDir:'/raid/image_service',
    thumbnail:'/raid/image_service/thumbnail',

    formidableConf:{
        uploadDir:'/raid/image_service/tmp',
        encoding:'utf-8',
        maxFieldsSize:1024 * 1024 * 128,   //128M
        keepExtensions:true,
        hash:'md5'
    },

    upload:{
        uploadDir:'/raid/image_service/tmp',
        rootDir:'/raid/image_service',
        mesDir:'misc',
        imgUrlPath:'/images'
    },

    mongodb:{
        url:'mongodb://127.0.0.1'
    },

    imgSizes:null
}