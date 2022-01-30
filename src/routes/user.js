const express = require('express')
const bcrypt = require('bcryptjs')
const User = require('../models/user')
const {upMail, downMail, verificationMail} = require('../emails/email')
const Ping = require('ping-monitor')
const userRouter = new express.Router()

userRouter.post('/signup', async (req, res) => {
    try{
        let exsitingUser = await User.findOne({ email: req.body.email });
        if (exsitingUser){
            return res.status(400).send("User with given email already exist!");
        }
        const user = new User(req.body)
        await user.authToken()
        await user.generateVerificationString()
        await user.save()
        // commented email sending function because I don't wanna to recieve an email 
        // every time I fire this api
       // verificationMail(user.name, user.email, user.verificationCode)
        res.status(201).send({user})
    }catch(e){
        res.status(400).send(e)
    } 
})

userRouter.post('/login' , async(req, res) => {
    try{
        const user = await User.findOne({email: req.body.email})
        if(!user){
            return res.status(404).send("User Doesn't Exist")
        }
        const match = await bcrypt.compare(req.body.password , user.password)
        if(!match){
            return res.status(400).send("Wrong Password!. Please Confirm Password")
        }
        await user.authToken()
        res.status(200).send({user})
    }catch(e){
        res.status(400).send(e)
    }
})

// email verification
userRouter.get('/verify/:id/:verCode', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user || user.verified === true) {
            return res.status(400).send()
        } else if (user.verificationCode == req.params.verCode) {
            user.verified = true
            await user.save()
            res.status(200).send('email verified sucessfully')
        }
    } catch (e) {
        res.status(401).send(e)
    }
})


module.exports = userRouter
