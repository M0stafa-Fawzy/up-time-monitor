require('../db/mongoose')
const mongoose = require('mongoose')

const checkSchema = new mongoose.Schema({
    name: {
       type: String,
       required: true
    }, url: {
       type: String,
       required: true
    }, protocol: {
        type: String,
        required: true,
    }, path: String
    , webhook: String
    , timeout: Date
    , interval: Number
    , threshold: Number
    , authentication: String
    , httpHeaders: String
    , tags: String
    , assert: String
    , ignoreSSL: Boolean
    , owner : {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'user'
    }, upTimes: []
    , downTimes: []
}, {timestamps: true})

const Check = mongoose.model('check', checkSchema)

module.exports = Check