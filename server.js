const express = require('express')
const mongoose = require('mongoose')
const usersRoute = require('./routes/userRoute')
const postRoute = require('./routes/postRoute')
const loginRoute = require('./routes/loginRoute')

const cors = require('cors')

require('dotenv').config()
const PORT = 5050;
const app = express()

app.use(cors(
))
app.use(express.json())

app.use('/', usersRoute)
app.use('/', postRoute)
app.use('/', loginRoute)

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Error during DB connection'))
db.once('open', () => {
  console.log('Databse successfully connected!')
})

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`)
})
