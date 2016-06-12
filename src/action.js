webcli.action = {
  do : function(s, ui, callback){
    var command = webcli.commandparser.parse(s);
    var response = function(success, message, info){
       callback({ command : command, success : success, message : message, info : info});
    };
    var unhandled = function(){
       // no one handled this event
       response(false, 'Command not found', {command : command.command});
    };
    webcli.action.doEvent.call(command.command, {ui : ui, args: command.args}, response, unhandled);
  }
};
webcli.action.doEvent = webcli.eventhandler.createEventHandler(null);
