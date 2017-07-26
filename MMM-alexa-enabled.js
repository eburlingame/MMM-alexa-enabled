Module.register("MMM-alexa-enabled", {

	defaults: {
	    sqs_url: "[Required]",
	    fadeTime: 1000, // In ms
	},

	start: function () {
		console.log("Starting MMM-alexa-enabled");
		console.log(this.config.fadeTime);
		this.sendSocketNotification("START_LISTENER", this.config);	
	},

	handleMessage: function(message) {
		var self = this;
        if (message['type'] == "ActivateModule") {
         	MM.getModules().withClass(message['module_name']).exceptModule(this).enumerate(function(module) {
                module.show(self.config.fadeTime);
            });
        }
        else if (message['type'] == "DeactivateModule") {
        	console.log("hiding");
        	MM.getModules().withClass(message['module_name']).exceptModule(this).enumerate(function(module) {
        		console.log("Hiding " + module.name);
                module.hide(self.config.fadeTime);
            });
        }
        else if (message['type'] == "ActivateAllModules") {
            MM.getModules().exceptModule(this).enumerate(function(module) {
                module.show(self.config.fadeTime);
            });
        }
        else if (message['type'] == "DeactivateAllModules") {
        	console.log("hiding all");
            MM.getModules().exceptModule(this).enumerate(function(module) {
                module.hide(self.config.fadeTime);
            });
        }
	},

	socketNotificationReceived: function(notification, payload) {
		if (notification == "MESSAGE") {
			this.handleMessage(payload);
		}
	},

	getDom: function() {
		return document.createElement("div");;
	},

});