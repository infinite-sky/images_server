'use strict';
module.exports = function attachVhostInfo(vhostInfo){
    return function (req, res, next){
        req.vhostInfo = vhostInfo;
        next();
    }
}