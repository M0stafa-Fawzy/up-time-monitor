const express = require('express')
const Check = require('../models/check')
const auth = require('../middleware/auth')
const reportRouter = new express.Router()


reportRouter.get('/report/:id', auth, async (req, res) => {
    try{
        let totalResTime = 0
        const check = await Check.findOne({ _id: req.params.id, owner: req.user._id })
        if (!check) {
            return res.status(404).send()
        }
    
        check.upTimes.forEach((time) => {
            totalResTime += time.resTime
        })
    
        let totalUpTime = parseInt((check.upTimes[check.upTimes.length - 1].date.getTime() - check.upTimes[0].date.getTime()) / 1000)
    
        const report = {
            avrresponseTime: parseInt(totalResTime / check.upTimes.length) + ' ms',
            totaluptimes: totalUpTime + ' s',
            outages: check.downTimes.length + ' times',
            history: { ups: check.upTimes, downs: check.downTimes }
        }
        res.status(200).send({report})
    }catch(e){
        res.status(400).send(e)
    }
})


reportRouter.get('/reports/:tags', auth, async (req, res) => {
    try{
        const reports = []
        const checks = await Check.find({tags: req.params.tags, owner: req.user._id})
        if(!checks){
            return res.status(404).send()
        }
        checks.forEach(async (check, index) => {

            let totalResTime = 0
            check.upTimes.forEach((time) => {
                totalResTime += time.resTime
            })
            let totalUpTime = parseInt((check.upTimes[check.upTimes.length - 1].date.getTime() - check.upTimes[0].date.getTime()) / 1000)
            const report = {
                avrresponseTime: parseInt(totalResTime / check.upTimes.length) + ' ms',
                totaluptimes: totalUpTime + ' s',
                outages: check.downTimes.length + ' times',
                history: { ups: check.upTimes, downs: check.downTimes }
            }
            reports.push(report)
        })
        res.status(200).send(reports)
    } catch (e) {
        res.status(400).send(e)
    }
})


module.exports = reportRouter