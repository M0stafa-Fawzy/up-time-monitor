const app = require('../src/app')
const request = require('supertest')
const User = require('../src/models/user')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

const user1Id = new mongoose.Types.ObjectId()

const user1 = {
    _id: user1Id,
    name: 'Mostafa',
    email: 'mostafa@example.com',
    password: 'myPassword!!',
    tokens: [{
        token: jwt.sign({_id: user1Id}, process.env.JWT_KEY)
    }]
}


beforeEach( async () => {
    await User.deleteMany()
    await new User(user1).save()
})


test('should signup', async () => {
    const response = await request(app)
    .post('/signup')
    .send({
        name : "Mostafaa" , 
        email : "mostafaa@example.com" ,
        password: "mypass123!" 
    }).expect(201)

    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()
})

test('should login', async () => {
    const response = await request(app)
    .post('/login')
    .send({
        email: user1.email,
        password: user1.password
    })
    .expect(200)
})






