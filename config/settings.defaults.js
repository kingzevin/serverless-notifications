let Settings
module.exports = Settings = {
  internal: {
    notifications: {
      port: 3042,
      host: process.env.LISTEN_ADDRESS || 'localhost'
    }
  },

  mongo: {
    url: // config here should be automatically passed in
      `mongodb://172.27.0.1:27017/sharelatex`
  }
}
