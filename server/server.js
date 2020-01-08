const express = require('express')
const cors = require('cors') //austin

var http = require('http')
const bodyParser = require('body-parser')

const outSrc = require('./routers/outSrc')

const invIn = require('./routers/invIn')
const process = require('./routers/process')  // Tracy 20181026
const equip = require('./routers/equip')      // Tracy 20181124
const mold = require('./routers/mold')        // Tracy 20181211
const fortop = require('./routers/fortop')
const approval = require('./routers/approval')  // Tracy 20190311
const peelinfo = require('./routers/peelinfo')  // Rain 20190529

const schedule = require('./routers/schedule')  // Rain 20190703
const order = require('./routers/order')        //Mingzoo, 20191010
const jobreport = require('./routers/jobreport')  // CY 20190730

const qualityresume = require('./routers/qualityresume')  // Siu 20191015

const statistic = require('./routers/statistic')//Mingzoo, 20191112

const human_resource = require('./routers/human_resource')//Mingzoo, 20191112


const app = express()
//app.use(bodyParser.json())
//app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json({limit: '50mb'}));	//Mingzoo 20191021
app.use(bodyParser.urlencoded({limit: '50mb', extended: true, parameterLimit:50000}));	//Mingzoo 20191021

app.use(cors()) //austin
app.use('/api_outsrc', outSrc)
app.use('/api', invIn)
app.use('/api/process', process)   // Tracy 20181026
app.use('/api/equip', equip)       // Tracy 20181124
app.use('/api/mold', mold)         // Tracy 20181211
app.use('/api/fortop', fortop)
app.use('/api/approval', approval)  // Tracy 20190311
app.use('/api/peelinfo', peelinfo)  // Rain 20190311

app.use('/api/schedule', schedule)  // Rain 20190703
app.use('/api/order', order)		//Mingzoo
app.use('/api/jobreport', jobreport)  // Rain 20190703

app.use('/api/qualityresume', qualityresume)  // Siu 20191015

app.use('/api/statistic', statistic)//Mingzoo, 20191112
app.use('/api/human_resource', human_resource)//Mingzoo

var httpServer = http.createServer(app)

httpServer.listen(3001,() => {
  console.log('HTTP Server running on port 3001.')
})



