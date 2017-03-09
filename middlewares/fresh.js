/**
 * Created by admin on 2016/10/19.
 */
'use strict';
module.exports = function () {
  return function *(next) {
    yield next;
    if(!this.body || this.status === 304){
      return;
    }

    if(this.fresh){
      this.status = 304;
      this.response.remove('Content-Type');
      this.response.remove('Content-Length');
    }
  }
};
