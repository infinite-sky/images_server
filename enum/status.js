/**
 * 状态
 * Created by admin on 2016/10/27.
 */
const STATUSMAP = [

  {statusCode: 200, succeed: true, code: 0, status: 'success', desc: '成功'},
  {statusCode: 200, succeed: false, code: 1, status: 'failure', desc: '失败'},
  {statusCode: 200, succeed: false, code: 2, status: 'error', desc: '请求出错'},
  {statusCode: 400, succeed: false, code: 3, status: 'badRequest', desc: '用户请求错误'},
  {statusCode: 400, succeed: false, code: 4, status: 'paramError', desc: '参数错误'},
  {statusCode: 500, succeed: false, code: 5, status: 'internalError', desc: '内部错误'},
  {statusCode: 403, succeed: false, code: 6, status: 'noAuth', desc: '未验证'},
  {statusCode: 403, succeed: false, code: 7, status: 'noPermission', desc: '无权限'},
  {statusCode: 403, succeed: false, code: 8, status: 'accessDenied', desc: '访问被拒绝'},
  {statusCode: 503, succeed: false, code: 9, status: 'networkError', desc: '网络错误'},
  {statusCode: 503, succeed: false, code: 10, status: 'databaseError', desc: '数据库错误'},
  {statusCode: 404, succeed: false, code: 11, status: 'apiNotExists', desc: 'api不存在'},
  {statusCode: 404, succeed: false, code: 12, status: 'pageNotFound', desc: '页面不存在'},
  {statusCode: 200, succeed: false, code: 13, status: 'remoteServiceError', desc: '远程服务出错'},
  {statusCode: 500, succeed: false, code: 255, status: 'UndefinedStatusError', desc: '未定义的返回状态'},
  // 业务相关返回
  // 以下返回同时使用succeed=true和code=0表示正常返回
  {statusCode: 200, succeed: false, code: 10001, status: 'userNotExist', desc: '用户不存在'},
  {statusCode: 200, succeed: false, code: 10002, status: 'userNotActive', desc: '用户未激活'},
  {statusCode: 200, succeed: false, code: 10003, status: 'userNotLogin', desc: '用户未登录'},
  {statusCode: 200, succeed: false, code: 10004, status: 'userNotAuth', desc: '用户未验证'},
  {statusCode: 200, succeed: false, code: 10005, status: 'userAuthorityDenied', desc: '用户无权限'},
];
const STATUSOBJ = {};
const CODEOBJ   = {};

STATUSMAP.forEach((item)=> {
  STATUSOBJ[item.status] = CODEOBJ[item.code] = item;
});
module.exports = {
  EMAIL         : {
    // 10: '发送成功',
    SUCCESS       : 10,
    // 11: '再次发送成功',
    RESEND_SUCCESS: 11,
    // 20: '正在发送',
    SENDING       : 20,
    // 21: '正在发送(再次发送)',
    RESENDING     : 21,
    // 30: '发送失败',
    FAILURE       : 30,
    // 31: '多次发送失败'
    RESEND_FAILURE: 31
  },
  STATUSDESCRIBE: {
    10: '发送成功',
    11: '再次发送成功',
    20: '正在发送',
    21: '正在发送(再次发送)',
    30: '发送失败',
    31: '多次发送失败'
  },
  STATUSOBJ     : STATUSOBJ,
  STATUSMAP     : STATUSMAP,
  CODEOBJ       : CODEOBJ,
};

