const express = require('express')
const Ping = require('ping-monitor'); 
const User = require('../models/user')
const Check = require('../models/check')
const auth = require('../middleware/auth')
const { downMail, upMail } = require('../emails/email')
const checkRouter = new express.Router()

const ping = (url, interval, name='') => {
    let monitor = new Ping({
        website: url,
        interval: interval,
        title: name
    })
    return monitor
}

// start a check for a specific url
checkRouter.post('/checks', auth, async (req, res) => {
    try{
        const check = new Check({
            ...req.body,
            owner: req.user._id
        })
        await check.save()
        const monitor = ping(req.body.url, req.body.interval, req.body.name)

        monitor.on('up', async (response, state) => {
            check.upTimes.push({date: new Date(), resTime: response.responseTime })
            await check.save()
            // commented email sending function because I don't wanna to recieve an email 
            // every time I fire this api
            // upMail(req.user.email, check.name)
        })

        monitor.on('down', async (response) => {
            check.downTimes.push(new Date())
            await check.save()
            // commented email sending function because I don't wanna to recieve an email 
            // every time I fire this api
           // downMail(req.user.email, check.name)
        })

        monitor.on('stop', () => {
            return res.status(400).send('monitor has stopped')
        })

        monitor.on('error', (err) => {
            return res.status(400).send(err)
        })
        res.status(201).send(check)
    }catch(e){
        res.status(400).send(e)
    }
})

checkRouter.delete('/checks/:id', auth, async (req, res) => {
    try{
        const check = await Check.findByIdAndDelete({_id: req.params.id, owner: req.user._id})
        if(!check){
            return res.status(404).send()
        }
        res.status(200).send(check)
    }catch(e){
        res.status(400).send(e)
    }
})

checkRouter.patch('/checks/:id', auth, async (req, res) => {
    const check = await Check.findOne({ _id: req.params.id, owner: req.user._id })
    if (!check) {
        return res.status(404).send()
    }
    const keys = Object.keys(req.body)
    const allowsUpdates = ['name', 'protocol', 'url', 'path', 'webhook', 'timeout', 'interval', 'threshold', 'httpHeaders', 'tags', 'assert', 'ignoreSSL']
    const valid = keys.every((update) => allowsUpdates.includes(update))
    if (!valid) {
        return res.status(500).send({ error: 'invalid updates' })
    }
    try {
        keys.forEach((update) => {
            check[update] = req.body[update]
        })
        await check.save()
        res.status(200).send(check)
    } catch (e) {
        res.status(400).send(e)
    }
})

// pause or stop a check  process
checkRouter.get('/checks/:id', auth, async (req, res) => {
    try{
        const check = await Check.findOne({_id: req.params.id, owner:req.user._id})
        if(!check){
            return res.status(404).send()
        }

        const monitor = ping(check.url, check.interval)
        monitor.on('up', (response, state) => {
            if(state.isUp){
                monitor.stop()
            }
        })
        res.status(200).send('paused')
        
    }catch(e){
        res.status(400).send(e)
    }
})

module.exports = checkRouter