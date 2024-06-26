const {format} = require('date-fns')
const {v4:uuid} = require('uuid')
const fs = require('fs')
const fsPromises = require('fs').promises
const path = require('path')

const logEvents = async (message, logFileName) =>{
    const dateTime = `${format(new Date(), 'yyyyMMdd\tHH:mm:ss')}`
    const logItem = `${dateTime}\t${uuid()}\t${message}\n`

    try{
        //If the logs folder does not exist, create the logs folder 
        if(!fs.existsSync(path.join(__dirname, "..", "logs"))){
            await fsPromises.mkdir(path.join(__dirname, "..", "logs"))
        }
        //After creating the logs folder load each logitem into it 
        await fsPromises.appendFile(path.join(__dirname, "..", "logs", logFileName), logItem)
    }catch(err){
        console.log(err)
    }
}

const logger = (req, res, next) =>{
    //using the logEvents function to accept message and create file(reqLog.log) in logs folder
    logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`, 'reqLog.log')
    console.log(`${req.method}\t${req.url}${req.method} ${req.path}`)
    next()
}

module.exports = {logger, logEvents}