# folder stucture
  * /commands  - contains command specific code and documentation
  * /docs - contains general documentation
  * /interface - contains code for the interface that is injected in the browser
  * /src - contains code for the background worker

# basic event flow

## loading the command line
The `/src/uiloader.js` is injected in every website through the `manifest.json` content_scripts. All other scripts in `/src` are running as background script when the WebExtension is loaded. `/src/messenger.js` handles the *first* communication between the frontend and the backend. On CTRL+SHIFT+L it sends the `webcli.toggle` event to the `/src/uiloader.js` of the current active tab. This will initialise the user interface (ui) by injecting an iframe in the current website with `/interface/ui.html` as source and `/interface/ui.js` as code. On intialising `/inferface/ui.js` tries to connect on a background port, `/src/messenger.js` catches this and creates an instance of `/src/ui.js` that handles from now on the communication between ui and background scripts.

## getting suggestions
On keyup the ui will send a `webcli.autocomplete.getSuggestions` event. `/src/autocomplete.js` handles this first and either gives back a simple list of available commands or passes this event on to a command. To get this working the command have to register a event callback like this:
```js
webcli.autocomplete.commands.push('mycommand');
webcli.autocomplete.event.on('mycommand',webcli.commands.mycommand.onAutocomplete);
```

## do something
On enter-key the ui will send a `webcli.action.do` event with the command string. `/src/action.js` will parse the command string and try to pass it on to a command. To get this working the command have to register a event callback like this:
```js
webcli.action.doEvent.on('mycommand', webcli.commands.mycommand.onDo);
```
