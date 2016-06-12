var uiloader = {
      initalised : false,
      iframe : null,
      visbile: false,
      init : function (){
        uiloader.iframe = document.createElement("iframe");
        uiloader.iframe.setAttribute("src", chrome.runtime.getURL("interface/ui.html"));
        uiloader.iframe.setAttribute("style", "position: fixed; top: 0; left: 0; z-index: 10000; width: 100%; height: 90px; border: none;");
        document.body.appendChild(uiloader.iframe);
        uiloader.visible = true;
        uiloader.initalised = true;
      },
      toggle : function (){
        if (uiloader.visible) {
          uiloader.visible = false;
          uiloader.iframe.style.display = "none";
        }
        else {
          uiloader.visible = true;
          uiloader.iframe.style.display = "block";
        }
      },
      eventListener : function (msg){
        console.log('uiloader recieved: ' + msg);
        if (msg == "webcli.toggle") {
            if(!uiloader.initalised){
              uiloader.init();
            }
            else {
              uiloader.toggle();
            }
          }
      }
};


// handle messages from the add-on background page (only in top level iframes)
if (window.parent == window) {
  chrome.runtime.onMessage.addListener(uiloader.eventListener);
}
