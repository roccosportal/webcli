webcli.action = {
  do : function(s, ui, callback){
    var command = webcli.commandparser.parse(s);
    var response = function(success, message, info){
       callback({ command : command, success : success, message : message, info : info});
    };
    webcli.action.doEvent.call(command.command, {ui : ui, args: command.args}, response);
  }
};
webcli.action.doEvent = webcli.eventhandler.createEventHandler(null);
