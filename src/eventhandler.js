webcli.eventhandler = {};
webcli.eventhandler.createEventHandler = function(){
  var instance = {};
  instance.listeners = [];
  instance.on = function(event, callback){
    instance.listeners.push({'event' : event, 'callback' : callback});
  };
  instance.call = function (event, options, callback, unhandledCallback){
    for (var i = 0; i < instance.listeners.length; i++) {
      if(instance.listeners[i].event == event){
         return instance.listeners[i].callback(options, callback);
      }
    }
    if(typeof unhandledCallback !== 'undefined'){
      return unhandledCallback();
    }
    else {
      return callback();
    }
  };
  instance.remove = function(event, callback){
    for (var i = 0; i < instance.listeners.length; i++) {
      if(instance.listeners[i].event == event && instance.listeners[i].callback == callback){
         return instance.listeners.splice(i, 1);
      }
    }
  };
  return instance;
};
