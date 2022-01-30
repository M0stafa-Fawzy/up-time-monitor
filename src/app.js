const express = require('express')
const userRouter = require('./routes/user')
const checkRouter = require('./routes/check')
const reportRouter = require('./routes/report')
const app = express()

app.use(express.json())
app.use(userRouter)
app.use(checkRouter)
app.use(reportRouter)

module.exports = app