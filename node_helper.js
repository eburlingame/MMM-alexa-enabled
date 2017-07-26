var NodeHelper = require("node_helper");
var Consumer = require('sqs-consumer');

module.exports = NodeHelper.create({
  start: function () {
    console.log("MMM-alexa-enabled helper started...");
  },

  startListener: function(sqsUrl) {
    var self = this;
    console.log('Creating SQS consumer for MMM-alexa-enabled');
    const app = Consumer.create({
      queueUrl: sqsUrl,
      handleMessage: function(message, done) {
        console.log("Recieved message");
        message = JSON.parse(message['Body']);
        console.log(message);
        if (self.validateMessage(message)) {
            self.sendSocketNotification("MESSAGE", message);
        }
        done();
      }
    });

    app.on('error', (err) => {
      console.error(err.message);
    });
 
    app.start();
  },

  validateMessage: function(message) {
    return "type" in message &&
        (((message["type"] == "ActivateModule" || message["type"] == "DeactivateModule") && "module_name" in message) || 
          (message["type"] == "DeactivateAllModules" || message["type"] == "ActivateAllModules"));
  },

  socketNotificationReceived: function(notification, payload) {
    if (notification === "START_LISTENER") {
      this.startListener(payload.sqs_url);
    }
  }
});