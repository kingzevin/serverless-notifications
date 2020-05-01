/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const runmiddlewareFlag = false;
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
if(runmiddlewareFlag){
  const runMiddleware = require('run-middleware');
  runMiddleware(app);
}
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

if (runmiddlewareFlag == false) {
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
}

function pure(params = {}) {
  const url = params.__ow_path;
  const method = params.__ow_method;

  function invoke(url, bodyJSON) {
    return new Promise((resolve, reject) => {
      app.runMiddleware(url, bodyJSON, (code, data) => {
        if(code == 200)
          resolve({body:data });
        else 
          reject({body: {code, data}})
      })
    });
  }

  const { promisify } = require('util')
  const request = require("request")
  const reqPromise = promisify(request[method]);
  return (async () => {
    let result;
    if (runmiddlewareFlag == true) {
      // via runmiddleware, there's a bug
      //   TypeError: Cannot read property 'content-type' of undefined
      //      at ServerResponse.getHeader (_http_outgoing.js:490:24)
      //      at ServerResponse.res.get (/root/serverless-notifications/node_modules/express/lib/response.js:536:15)
      // mongo is ok
      result = await invoke(url, { method, body: params });
    } else {
      result = await reqPromise({
        // url: `http://${host}:${port}/${url}`,
        url: `http://localhost:3042${url}`,
        json: params
      })
    }
    return {body: result.body}
  })();
}

exports.main = pure

if (!module.parent) {
  (async ()=>{
    const a = await test();
    console.log(a);
  })();
}

function test(params = {}) {
  const url = params.url || '/user/5e9723ee71ffbe00909ed452';
  const method = params.__ow_method || 'get';

  function invoke(url, bodyJSON) {
    return new Promise((resolve, reject) => {
      app.runMiddleware(url, bodyJSON, (code, data) => {
        if(code == 200)
          resolve({body:data });
        else 
          reject({body: {code, data}})
      })
    });
  }

  const { promisify } = require('util')
  const request = require("request")
  const reqPromise = promisify(request[method]);
  return (async () => {
    let result;
    if (runmiddlewareFlag == true) {
      // via runmiddleware, there's a bug
      //   TypeError: Cannot read property 'content-type' of undefined
      //      at ServerResponse.getHeader (_http_outgoing.js:490:24)
      //      at ServerResponse.res.get (/root/serverless-notifications/node_modules/express/lib/response.js:536:15)
      // mongo is ok
      result = await invoke(url, { method, body: params });
    } else {
      result = await reqPromise({
        // url: `http://${host}:${port}/${url}`,
        url: `http://localhost:3042${url}`,
        json: params
      })
    }
    return {body: result.body}
  })();
}