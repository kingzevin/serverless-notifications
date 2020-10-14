'use strict'
// environment variables specified by the user
process.env["MONGO_CONNECTION_STRING"] = `mongodb://172.17.0.1:27017/sharelatex`; // notifications.config.env
// the user should specify the express listener
const expressListener = require('./app.js') // notifications.express.file

const owServerlessExpress = require('./owServerlessExpress.js')

exports.main = function(params){ // notifications.handler.function
  return owServerlessExpress(expressListener, params)
}