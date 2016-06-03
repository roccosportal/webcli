webcli.action = {
  do : function(s, ui, callback){
    var command = webcli.commandparser.parse(s);
    webcli.action.doEvent.call(command.command, {ui : ui, args: command.args}, callback);
  }
};
webcli.action.doEvent = webcli.eventhandler.createEventHandler(null);
