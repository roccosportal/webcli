var ui = {};

ui.port = null;
ui.$input = null;
ui.$sugg = null;
ui.$suggs = null;
ui.autocomplete =  null;

ui.init = function(){
  ui.port = chrome.runtime.connect();
  ui.port.onMessage.addListener(function(msg){
    if(msg.name == 'webcli.autocomplete.getSuggestions.response'){
      ui.getSuggestionsResponse(msg.response, msg.request);
    }
    else if(msg.name == 'webcli.action.do.response'){
      ui.doActionResponse(msg.response, msg.request);
    }
  });
  ui.$input = document.querySelector("#webcli-ui input");
  ui.$input.addEventListener('keydown', function(e){
    var value = ui.$input.value;
    var keyCode = e.keyCode || e.which;
    if (keyCode == 9) {
      ui.useSuggestion();
      e.preventDefault();
    }
    else if(keyCode == 13) {
      e.preventDefault();
      ui.doAction(value);
    }
  });
  ui.$input.addEventListener('keyup', function(e){
    var value = ui.$input.value;
    var keyCode = e.keyCode || e.which;
    ui.getSuggestions(value);
  });
  ui.$sugg = document.querySelector("#webcli-ui #sugg");
  ui.$sugg.addEventListener('click', function(){
    document.getElementById("input").focus();
  });
  ui.$suggs = document.querySelector("#webcli-ui #suggs");
  document.getElementById("input").focus();
};


ui.useSuggestion = function(){
  if(ui.autocomplete === null){
    return;
  }
  var replaceWith = ui.autocomplete.suggestions[0].replaceWith.replace(/ /g, '\\ ');
  var parts = ui.autocomplete.command.parts;
  ui.$sugg.innerHTML = '';
  if(parts.length <= 1){
    ui.$input.value = replaceWith;
  }
  else {
    ui.$input.value = ui.autocomplete.command.sStart + ' ' + replaceWith;
  }
  ui.$suggs.innerHTML = '';
};


ui.sendMessage = function(name,options){
  ui.port.postMessage({name : name, options: options});
};


ui.getSuggestions = function(s){
  ui.sendMessage('webcli.autocomplete.getSuggestions', {s : s});
};


ui.doAction = function(s){
  ui.sendMessage('webcli.action.do', {s : s});
};


ui.doActionResponse = function(response, request){
  if(response.success){
    ui.$input.value = '';
    ui.$sugg.innerHTML = '';
    ui.$suggs.innerHTML = '';
  }
};


ui.getSuggestionsResponse = function(response, request){
    var suggestions = response.suggestions;
    var parts = response.command.parts;
    var command = response.command.command;
    var sStart = response.command.sStart;

    ui.autocomplete = response;
    if (suggestions.length === 0){
      ui.$sugg.innerHTML = '';
      ui.$suggs.innerHTML = '';
    }
    else if(suggestions.length == 1){
      var replaceWith = suggestions[0].replaceWith.replace(/ /g, '\\ ');
      if(parts.length <= 1){
        ui.$sugg.innerHTML = replaceWith;
      }
      else {
        ui.$sugg.innerHTML = sStart + ' ' + replaceWith;
      }
      ui.$suggs.innerHTML = suggestions[0].title;
    }
    else {
        ui.$sugg.innerHTML = '';
        var tmpSuggestions = [];
        for (var i = 0; i < suggestions.length; i++) {
          tmpSuggestions.push(suggestions[i].title);
        }
        ui.$suggs.innerHTML = tmpSuggestions.join(' | ');
    }
};

ui.init();
