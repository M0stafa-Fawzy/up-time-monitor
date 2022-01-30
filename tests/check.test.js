const app = require('../src/app')
const Check = require('../src/models/check')
const User = require('../src/models/user')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const request = require('supertest')

const user1Id = new mongoose.Types.ObjectId()
const check1Id = new mongoose.Types.ObjectId()
console.log(check1Id)

const user1 = {
    _id: user1Id,
    name: 'Mostafa Fawzy',
    email: 'mostafafawzy@example.com',
    password: '123456789',
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
    await Check.deleteMany()
    await new Check(checkOne).save()
    await User.deleteMany()
    await new User(user1).save()
})

test('should create check', async () => {
    await request(app)
    .post('/checks')
    .set('Authorization', `Bearer ${user1.tokens[0].token}`)
    .send({
        url: 'https://mostafa-chat-app.herokuapp.com/',
        interval: 1,
        name: 'Chat App',
        owner: user1._id
    })
    .expect(201)
})

test('should delete check', async () => {
    await request(app)
    .delete(`/checks/${checkOne._id}`)
    .set('Authorization', `Bearer ${user1.tokens[0].token}`)
    .send()
    .expect(200)
})

test('should update check', async () => {
    await request(app)
    .patch(`/checks/${checkOne._id}`)
    .set('Authorization', `Bearer ${user1.tokens[0].token}`)
    .send({
        name: 'New Check Name'
    })
    .expect(200)
})






