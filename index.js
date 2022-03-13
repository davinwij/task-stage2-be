const express = require('express')
const router = require('./src/routes')
require('dotenv').config

const app = express()

const port = 5000

app.listen(port, () => console.log(`Listening on port ${port} `))

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use('/products', express.static("uploads"))

app.use('/api/v1', router)


