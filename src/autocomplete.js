webcli.autocomplete = {};
webcli.autocomplete.commands = ['help'];
webcli.autocomplete.createSuggestion = function(commands){
    var suggestions = [];
    for (var i = 0; i < commands.length; i++) {
      suggestions.push({title : commands[i], replaceWith : commands[i]});
    }
    return suggestions;
};

webcli.autocomplete.getSuggestions = function(s, ui, callback){
    var command = webcli.commandparser.parse(s);
    var commands = webcli.autocomplete.commands;
    var response = function(suggestions){
        suggestions = (typeof suggestions !== 'undefined') ? suggestions : [];
        return callback({suggestions: suggestions, command : command});
    };

    if(command.parts.length === 0 || command.command===''){
      return response(webcli.autocomplete.createSuggestion(commands));
    }
    else if (command.args.length === 0) {
      return response(webcli.autocomplete.compare(command.command, commands));
    }
    else if (command.args.length > 0) {
      return webcli.autocomplete.event.call (command.command, {ui: ui, args: command.args}, response);
    }
};

webcli.autocomplete.compare = function(arg, suggestions){
    var valid_suggestions = [];
    for (var i = 0; i < suggestions.length; i++) {
      if(suggestions[i].startsWith(arg)){
        valid_suggestions.push({title : suggestions[i], replaceWith : suggestions[i]});
      }
    }
    return valid_suggestions;
};

webcli.autocomplete.event  = webcli.eventhandler.createEventHandler();
