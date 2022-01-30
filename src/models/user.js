require('../db/mongoose')
const mongoose = require('mongoose')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
    name : String , 
    email : {
        type : String , 
        unique : true,
        required : true ,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Valid Email is required')
            }
        }
    } , password : {
        type : String , 
        required : true ,    
    },  tokens: [{
        token: {
            type: String,
            required: true
        }
    }], verified: {
        type: Boolean,
        default: false
    }, verificationCode: {
        type: Number
    }
})

userSchema.methods.authToken = async function (){
    const token = jwt.sign({_id: this._id.toString()}, process.env.JWT_KEY)
    this.tokens = this.tokens.concat({token})
    await this.save()
    return token
}

userSchema.methods.generateVerificationString = async function (){
    const verCode = Math.floor(Math.random()*1000000)+100000
    this.verificationCode = verCode
    await this.save()
}


userSchema.pre('save', async function (next) {
    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password, 8)
    }

    next()
})

const User = mongoose.model('user', userSchema)

module.exports = User