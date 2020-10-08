/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
process.env["MONGO_CONNECTION_STRING"] = `mongodb://172.17.0.1:27017/sharelatex`;
const metrics = require('metrics-sharelatex')
metrics.initialize('notifications')
const Settings = require('settings-sharelatex')
const logger = require('logger-sharelatex')
logger.initialize('notifications-sharelatex')
const express = require('express')
const app = express()
const controller = require('./app/js/NotificationsController')
const mongojs = require('mongojs')
const db = mongojs(Settings.mongo.url, ['notifications'])
const Path = require('path')

metrics.memory.monitor(logger)

const HealthCheckController = require('./app/js/HealthCheckController')

app.configure(function() {
  app.use(express.methodOverride())
  app.use(express.bodyParser())
  app.use(metrics.http.monitor(logger))
  return app.use(express.errorHandler())
})

metrics.injectMetricsRoute(app)

app.post('/user/:user_id', controller.addNotification)
app.get('/user/:user_id', controller.getUserNotifications)
app.del(
  '/user/:user_id/notification/:notification_id',
  controller.removeNotificationId
)
app.del('/user/:user_id', controller.removeNotificationKey)
app.del('/key/:key', controller.removeNotificationByKeyOnly)

app.get('/status', (req, res) => res.send('notifications sharelatex up'))

app.get('/health_check', (req, res) =>
  HealthCheckController.check(function(err) {
    if (err != null) {
      logger.err({ err }, 'error performing health check')
      return res.send(500)
    } else {
      return res.send(200)
    }
  })
)

app.get('*', (req, res) => res.send(404))

const host =
  __guard__(
    Settings.internal != null ? Settings.internal.notifications : undefined,
    x => x.host
  ) || 'localhost'
const port =
  __guard__(
    Settings.internal != null ? Settings.internal.notifications : undefined,
    x1 => x1.port
  ) || 3042
app.listen(port, host, () =>
  logger.info(`notifications starting up, listening on ${host}:${port}`)
)

function __guard__(value, transform) {
  return typeof value !== 'undefined' && value !== null
    ? transform(value)
    : undefined
}

exports.main = main
function main(params = {}){
  const url = params.__ow_path;
  const method = params.__ow_method == 'delete' ? 'del' : params.__ow_method
  const headers = params.__ow_headers
  
  const { promisify } = require('util')
  const request = require("request")
  const reqPromise = promisify(request[method]);
  return (async () => {
    let result;
    let opt={}
    opt['headers'] = headers;
    opt['url'] = `http://${host}:${port}${url}`;
    let str = params.__ow_body || '';
    if(str !== "" && Buffer.from(str, 'base64').toString('base64') === str){
      // base64
      params.__ow_body = Buffer.from(str, 'base64').toString('ascii');
    }
    opt['body'] = params.__ow_body;
    if(params.__ow_query !== ""){
      const qs = '?' + params.__ow_query;
      opt['url'] = opt['url'] + qs;
    }
    result = await reqPromise(opt);
    var response = JSON.parse(JSON.stringify(result));
    delete response.request
    return response
  })();
}