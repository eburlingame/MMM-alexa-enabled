var NodeHelper = require("node_helper");
var Consumer = require('sqs-consumer');
var sys = require('sys')
var exec = require('child_process').exec;

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
        console.log(message);
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
          (message["type"] == "DeactivateAllModules" || message["type"] == "ActivateAllModules") || 
           message["type"] == "TurnOn" || message["type"] == "TurnOff");
  },

  socketNotificationReceived: function(notification, payload) {
    if (notification === "START_LISTENER") {
      this.startListener(payload.sqs_url);
    } 
    else if (notification == "TURN_ON") {
      this.turnMonitorOn();
    }
    else if (notification == "TURN_OFF") {
      this.turnMonitorOff();
    }
  },

  turnMonitorOn: function() {
    console.log("Turning monitor on");
    exec("/opt/vc/bin/tvservice -p", this.puts);
  },

  turnMonitorOff: function() {
    console.log("Turning monitor off");
    exec("/opt/vc/bin/tvservice -o", this.puts);
  },

  puts: function(error, stdout, stderr) { 
    console.log(error, stdout, stderr); 
  }

});
