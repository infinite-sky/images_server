'use strict';
const uuid = require('node-uuid');
const Promise = require('bluebird');
const gm = require('gm');
const path = require('path');

Promise.promisifyAll(gm.prototype);