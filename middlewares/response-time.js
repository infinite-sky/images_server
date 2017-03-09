/**
 * Created by admin on 2016/10/19.
 */
'use strict';
module.exports = function () {
  return function *(next) {
    let startTime = Date.now();
    yield next;
    let endTime = Date.now();
    this.set('X-Response_Time', endTime - startTime + 'ms');
  }
};