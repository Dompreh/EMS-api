const express = require('express')
const app = express()
const path = require('path')
require('dotenv').config()
const {logEvents,logger} = require('./middleware/logger')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const corsOptions = require('./config/corsOptions')
const connectDB = require('./config/connectDB')
const mongoose = require('mongoose')
const errorHandler = require('./middleware/errorHandler')
const PORT = process.env.PORT || 3500


connectDB()
app.use(cors(corsOptions))
app.use(logger) //custom middleware for logs
app.use(express.json())// json built-in middleware

app.use(cookieParser()) //third party middleware.Helps us to pass cookies

app.use('/', express.static(path.join(__dirname, '/public')))//built-in middleware for loading static files

app.use('/', require('./routes/root'))
app.use('/users', require('./routes/userRoute'))
app.use('/tasks', require('./routes/taskRoute'))
app.use('/auth', require('./routes/authRoute'))
app.use('/kanban', require('./routes/kanbanRoute'))
app.use('/schedule', require('./routes/scheduleRoute'))

app.all('*',(req,res) =>{
    res.status(404)
    if(req.accepts('html')){
        res.sendFile(path.join(__dirname, "views","404.html"))
    }
    else if(req.accepts('json')){
        res.json({message:"404 Not Found"})
    }
    else{
        res.type('txt').send('404 Not Found')
    }
})

app.use(errorHandler) //custom middleware for error logs

mongoose.connection.once('open', () =>{
    console.log('Connected to MongoDB')
    app.listen(PORT,() => console.log(`Server is running on PORT ${PORT}`))
})

mongoose.connection.on('error',err=>{
    console.log(err)
    logEvents(`${err.no}:${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log')
    console.log(err.stack)
})