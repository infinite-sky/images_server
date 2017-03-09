'use strict';
const mongoose = require('mongoose');

const schema = module.exports = new mongoose.Schema({
    referer:{type:String, required:false,unique:false,comment:'referer'},
    host:{type:String, required:false,unique:false,comment:'host'},
    ua:{type:String, required:false,unique:false,comment:'User-Agent'},
    hash:{type:String, required:false,unique:false,comment:'hash'},
    name:{type:String, required:false,unique:false,comment:'name'},
    size:{type:Number, required:false,unique:false,comment:'size'},
    mime:{type:String, required:true,unique:false,comment:'mime'},
    format:{type:String, required:true,unique:false,comment:'fromat'},
    url:{type:String, required:true,unique:false,comment:'url'},
    root:{type:String, required:true,unique:false,comment:'root dir'},
    date:{type:Date, required:true,unique:false,comment:'createTime'},
})