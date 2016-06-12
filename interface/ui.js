var ui = {};

ui.port = null;
ui.$input = null;
ui.$sugg = null;
ui.$suggs = null;
ui.$outputlist = null;
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
    else if(keyCode == 37 && ui.$input.selectionStart == ui.$input.value.length && ui.autocomplete.selectedIndex !== 0){
      e.preventDefault();
    }
    else if(keyCode == 39 && ui.$input.selectionStart == ui.$input.value.length ){
      e.preventDefault();
    }
    else {
      ui.resizeInput();
    }

  });
  ui.$input.addEventListener('keyup', function(e){
    var value = ui.$input.value;
    var keyCode = e.keyCode || e.which;

    if(keyCode == 37 && ui.$input.selectionStart == ui.$input.value.length && ui.autocomplete.selectedIndex !== 0){
      e.preventDefault();
      ui.moveSuggestions(false);
    }
    else if(keyCode == 39 && ui.$input.selectionStart == ui.$input.value.length){
      e.preventDefault();
      ui.moveSuggestions(true);
    }
    else {
      ui.getSuggestions(value);
    }
  });
  ui.$sugg = document.querySelector("#webcli-ui #sugg");
  document.querySelector("#webcli-ui").addEventListener('click', function(){
    document.getElementById("input").focus();
  });
  ui.$suggs = document.querySelector("#webcli-ui #suggs");
  ui.$outputlist = document.querySelector("#output-list");
  document.getElementById("input").focus();
};


ui.useSuggestion = function(){
  if(ui.autocomplete === null || ui.autocomplete.suggestions.length === 0){
    return;
  }
  var replaceWith = ui.autocomplete.suggestions[ui.autocomplete.selectedIndex].replaceWith.replace(/ /g, '\\ ');
  var parts = ui.autocomplete.command.parts;
  ui.$sugg.innerHTML = '';
  if(parts.length <= 1){
    ui.$input.value = replaceWith;
  }
  else {
    ui.$input.value = ui.autocomplete.command.sStart + ' ' + replaceWith;
  }
  ui.$suggs.innerHTML = '';

  ui.resizeInput();
};

ui.moveSuggestions = function(forward){
  if(ui.autocomplete === null || ui.autocomplete.suggestions.length === 0){
    return;
  }

  if(forward){
    ui.autocomplete.selectedIndex += 1;
    if(ui.autocomplete.suggestions.length == ui.autocomplete.selectedIndex){
      ui.autocomplete.selectedIndex = 0;
    }
  }
  else {
    ui.autocomplete.selectedIndex -= 1;
    if(ui.autocomplete.selectedIndex < 0){
      ui.autocomplete.selectedIndex = ui.autocomplete.suggestions.length -1;
    }
  }

  ui.buildSuggestions();

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

  if(typeof response.message !== 'undefined'){
    ui.appendOutput(response.success, response.message, response.info);
  }
};


ui.getSuggestionsResponse = function(response, request){
    var suggestions = response.suggestions;
    var parts = response.command.parts;
    var command = response.command.command;
    var sStart = response.command.sStart;

    ui.autocomplete = response;
    ui.autocomplete.selectedIndex = 0;
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
      ui.buildSuggestions();
    }
    else {
        ui.$sugg.innerHTML = '';
        ui.buildSuggestions();
    }
};

ui.buildSuggestions = function(){
  var selectedIndex = ui.autocomplete.selectedIndex;
  var suggestionsHtml = '';
  var maxWidth = screen.width - ui.$input.width - 20;
  var neededWidth = 0;
  var suggestions = ui.autocomplete.suggestions;

  for(var j = 0; j < suggestions.length; j++) {
      neededWidth += suggestions[j].title.length * 8 + 10;
  }

  var start = 0;
  var end = suggestions.length - 1;
  if(neededWidth > maxWidth){
    var newWidth = 0;
    var suffix = true;
    var stopSuffix = false;
    var stopPrefix = false;
    start = selectedIndex;
    end = selectedIndex;
    newWidth = suggestions[selectedIndex].title.length * 8 + 10;
    while (newWidth < maxWidth && !(stopSuffix && stopPrefix)) {
      if(suffix){
        suffix = false;
        if(end !== suggestions.length - 1){
          end += 1;
          newWidth += suggestions[end].title.length * 8 + 10;
        }
        else {
          stopSuffix = true;
        }
      }
      else {
        suffix = true;
        if(start !== 0){
          start -= 1;
          newWidth += suggestions[start].title.length * 8 + 10;
        }
        else {
          stopPrefix = true;
        }
      }

    }
    // remove last
    if (!suffix){
      end -= 1;
    }
    else {
      start += 1;
    }
  }

  if(start !== 0){
    suggestionsHtml += '<div>...</div>';
  }

  for (var i = start; i <= end; i++) {
    suggestionsHtml += '<div';
    if(i==selectedIndex){
      suggestionsHtml += ' class=\'highlighted\'';
    }
    suggestionsHtml += '>' + suggestions[i].title + '</div>';

  }

  if(end + 1 !== suggestions.length){
    suggestionsHtml += '<div>...</div>';
  }

  ui.$suggs.innerHTML = suggestionsHtml;
};

ui.resizeInput = function(){
  var chars = ui.$input.value.length;
  ui.$input.style = 'width:' + (chars * 8 + 10) + 'px';
};

ui.appendOutput = function(success, message, info){
  var li = document.createElement('li');
  var state = success ? 'success' : 'failure';
  li.className = state;
  li.innerHTML = '<span class="message">' + message + '</span>' + ui.infoToOutput(info);
  ui.$outputlist.insertAdjacentElement('afterbegin', li);
};

ui.infoToOutput = function(info){
  var s = '<span class="lowlight">{</span>';
  var type = null;
  var first = true;
  for(var propertyName in info) {
    type = typeof info[propertyName];
    if(type !== 'boolean' && type !== 'string' && type !== 'number'){
      continue;
    }

    if(first){
      first = false;
    }
    else {
      s += '<span class="lowlight">,</span>';
    }

    s += '<span class="middlelight">' + propertyName + '</span>';
    s += '<span class="lowlight">:</span>';
    s += '<span class="highlight">';
    if(type === 'string'){
        s += '"' + info[propertyName] + '"';
    }
    else if(type === 'boolean'){
      if(info[propertyName]){
        s += 'true';
      }
      else {
        s += 'false';
      }
    }
    else {
      s += info[propertyName];
    }
    s += '</span>';
  }
  s += '<span class="lowlight">}</span>';
  return s;
};

ui.init();
