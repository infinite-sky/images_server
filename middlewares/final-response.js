/**
 * Created by admin on 2016/10/19.
 */
'use strict';
const util      = require('util');
const _         = require('lodash');
const validator = require('validator');
const logger    = require('../tools/logger');
const STATUS = require('../enum').STATUS.STATUSOBJ;


module.exports = function finallyResp (options) {
  return function finally_response(result, req, res, next){
  
    let retObj = {
      RetSucceed:true,
      Code:0, 
      Message:result.msg || ''
    }
    if(result.status !== 'success'){
      retObj.Code = 1;
    }

    res.json(retObj);
  }
  // return finalResponse(result, req, res, options);
};

function finalResponse(result, req, res, options) {
  let ctx = {req:req, res:res, body:req.body};
  if (noContent(ctx)) return;
  //console.log(isFinalResponse(ctx.body), 'ctx.body');
  if (isFinalResponse(ctx.body)) return;

  let error = ctx.error || ctx.body;

  if (util.isError(error)) {
    logger.error(error);
    return serverError(ctx, error);
  }

  if (ctx.status === 404) return noExist(ctx);

  if (!needWrap(ctx.body) && ctx.body.view) {
    return render(ctx, ctx.body.view, ctx.body.message);
  } else if (needWrap(ctx.body)) {
    return ctx.body = genFinalResponse({status: 'success', message:ctx.body});
  } else {
    return ctx.body = genFinalResponse(ctx.body);
  }
}

function genFinalResponse(obj) {
  let response = {'RetSucceed': true, 'Succeed': true, 'Code': 0, 'Desc': '成功', 'Msg': {}, 'extData': {}};

  if (obj.status !== undefined) {
    //console.log(STATUS);
    response.Code = STATUS[obj.status].code;
    response.Desc = STATUS[obj.status].desc;
  }
  if (obj.message !== undefined) {
    response.Msg = obj.message;
  }
  if (obj.desc !== undefined) {
    response.Desc = obj.desc;
  }
  return response;
}

function needWrap(obj) {
  if (isFinalResponse(obj)) return false;

  if (typeof obj !== 'object') return true;

  let finalKeySet = new Set(['status', 'message', 'desc', 'error', 'view']);
  return !ownProperties(obj).every(item => finalKeySet.has(item));
}

function isFinalResponse(obj) {
  if (typeof obj !== 'object') return false;
  if (isStream(obj)) return true;

  let finalKeys = ['RetSucceed', 'Succeed', 'Code', 'Desc', 'Msg', 'extData'];
  return _.xor(finalKeys, ownProperties(obj)).length === 0;
}

function isStream(obj) {
  return obj && typeof obj === 'object' && typeof obj.pipe === 'function';
}

function ownProperties(obj) {
  if (!obj) {
    return {};
  } else {
    return Object.keys(obj).filter(key=>obj.hasOwnProperty(key));
  }
}

/**
 * 204 Return nothing
 */
function noContent(ctx) {
  return ctx.status === 204 || !!~[null, undefined].indexOf(ctx.body);
}
/**
 * 404 Not Found
 */
function noExist(ctx) {
  if (isApi) {
    return ctx.body = createMessage({status: 'apiNotExists'});
  } else {
    return render(ctx, '404', ctx.body);
  }
}
/**
 * 500 Server Error
 */
function serverError(ctx, error) {
  if (isApi) {
    return ctx.body = createMessage({
      status : 'failure',
      message: error.message
    });
  } else {
    return render(ctx, '500');
  }
}

function isApi(ctx) {
  return ctx.originalUrl.indexOf('/api') >= 0;
}

function createMessage(obj) {
  let response = {
    'RetSucceed': true,
    'Succeed'   : true,
    'Code'      : 0,
    'Desc'      : '成功',
    'Message'   : {},
    'extData'   : {}
  };
  if (obj.status !== undefined) {
    //response.Code = STATUS[obj.status].code;
    //response.Desc = STATUS[obj.status].desc;
  }
  if (obj.message !== undefined) {
    response.Message = obj.message;
  }
  if (obj.desc !== undefined) {
    response.Desc = obj.desc;
  }
  return response;
}




