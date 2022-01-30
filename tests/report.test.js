const app = require('../src/app')
const Check = require('../src/models/check')
const User = require('../src/models/user')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const request = require('supertest')

const user1Id = new mongoose.Types.ObjectId()
const check1Id = new mongoose.Types.ObjectId()

const user1 = {
    _id: user1Id,
    name: 'MostafaFawzy',
    email: 'mostafafawz@example.com',
    password: '12345678',
    tokens: [{
        token: jwt.sign({_id: user1Id}, process.env.JWT_KEY)
    }]
}


const checkOne = {
    _id: check1Id,
    url: 'https://mostafa-chat-app.herokuapp.com/',
    interval: 1,
    name: 'Chat App',
    owner: user1Id,
    upTimes: [],
    downTimes: []
}

beforeEach( async () => {
    await User.deleteMany()
    await new User(user1).save()
    await Check.deleteMany()
    await new Check(checkOne).save()
})


test('should generte report', async () => {
    await request(app)
    .get(`/report/${checkOne._id}`)
    .set('Authorization', `Bearer ${user1.tokens[0].token}`)
    .send()
    .expect(200)
})