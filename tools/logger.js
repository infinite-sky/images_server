/**
 * Created by admin on 2016/10/19.
 */
'use strict';
const config = require('config');
const path = require('path');
const log4js = require('log4js');
const fs = require('fs-extra');

fs.mkdirsSync(config.log.dir);

const defaultAppenders = [
  {
    category: 'main',
    type: 'dateFile',
    filename: path.join(config.log.dir, 'log.'),
    pattern: 'yyyyMMdd',
    alwaysIncludePattern: true,
    maxLogSize: 1024 * 1024 * 30
  },
  {
    category: 'main',
    type: 'logLevelFilter',
    level: 'WARN',
    appender: {
      type: 'file',
      filename: path.join(config.log.dir, 'log.warn'),
      maxLogSize: 1024 * 1024 * 30
    }
  },
  {
    category: 'main',
    type: 'logLevelFilter',
    level: 'ERROR',
    appender: {
      type: 'file',
      filename: path.join(config.log.dir, 'log.error'),
      maxLogSize: 1024 * 1024 * 30
    }
  }
];

if (config.log.console) {
  defaultAppenders.push({
    type: 'console'
  });
}

const conf = {
  replaceConsole: config.log.replaceConsole,
  appenders: config.log.appenders || defaultAppenders
};

log4js.configure(conf);

//log4js.getLogger('main').prototype.errMsg = function(err){
//  log4js.error(err);
//};

const mainLogger = module.exports = log4js.getLogger('main');

mainLogger.setLevel(config.log.level);
mainLogger.log4js = log4js;