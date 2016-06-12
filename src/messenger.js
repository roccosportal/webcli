webcli.messenger = {};
webcli.lastUsedTab = null;

webcli.messenger.onCommand = function(command) {
  if(command == 'toggle'){
    // pass the toggle event to the ui-loader that is injected in the current webpage
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      webcli.lastUsedTab = tabs[0];
      chrome.tabs.sendMessage(webcli.lastUsedTab.id, 'webcli.toggle');
    });
  }
};
webcli.messenger.onPortConnect =  function (port) {
  if (port.sender.url == chrome.runtime.getURL("interface/ui.html")) {
    webcli.ui.createInstance(port, webcli.lastUsedTab);
  }
};

chrome.commands.onCommand.addListener(webcli.messenger.onCommand);
// handle connections received from the user interface
chrome.runtime.onConnect.addListener(webcli.messenger.onPortConnect);
