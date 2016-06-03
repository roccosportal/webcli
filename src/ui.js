webcli.ui = {};
webcli.ui.createInstance = function(port, tab){
    var instance = {};
    instance.port = port;
    instance.tab = tab;
    instance.messageEvent = webcli.eventhandler.createEventHandler(null);
    instance.postMessage = function(msg){
      instance.port.postMessage(msg);
    };
    instance.onMessage = function(msg) {
      switch (msg.name) {
        case 'webcli.autocomplete.getSuggestions':
          webcli.autocomplete.getSuggestions(msg.options.s, instance, function(response){
              instance.postMessage({name: 'webcli.autocomplete.getSuggestions.response', response: response, request : msg});
          });
          break;
        case 'webcli.action.do':
          webcli.action.do(msg.options.s, instance, function(response){
             instance.postMessage({name: 'webcli.action.do.response', response : response, request : msg});
          });
          break;
      }
      msg.options.ui = instance;
      instance.messageEvent.call(msg.name, msg.options, function(){
          // TODO: send this back to the ui instance
      });
    };
    instance.port.onMessage.addListener(instance.onMessage);
    return instance;
};
