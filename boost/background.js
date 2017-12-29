const action_msg = "action clicked";
const command_msg = "command pressed";

console.log("BG Loaded");


/*
Called when there was an error.
We'll just log the error here.
*/
function onError(error) {
  console.log(`Error: ${error}`);
}

/*
  adds a listener to messages
*/
browser.runtime.onMessage.addListener(request => {

    console.log("msg recieved: " + request.greeting);
    var response = "response: ";

    switch(request.greeting) {
      case "hello from sidebar":  
        response += "hi from bg";
        console.log("val received: " + request.value);
        break;
      case "command pressed":
        response += "command pressed recieved";
        //addTextAtMouse();
        console.log("command press conf");
        break;
      default:
        response += "unknown message";
        console.log("unknown message: " + request.greeting);
        break;
    }
    return Promise.resolve({answer: response});
  });

/*
Sets listeners for commands
*/
browser.commands.onCommand.addListener(function(command) {

  console.log(command);
  
  browser.tabs.query({
    currentWindow: true,
    active: true
  }).then(tabs => sendMessageToTab(tabs[0], command_msg)).catch(onError);
});



/*
Sets listener for browser action
*/
browser.browserAction.onClicked.addListener(() => {

  console.log("action clicked");

  browser.tabs.query({
    currentWindow: true,
    active: true
  }).then(tabs => sendMessageToTab(tabs[0], action_msg)).catch(onError);
});




function sendMessageToTab(tab,msg) {

  console.log(`sent: ${msg} to tab ${tab.id}`);

    browser.tabs.sendMessage(
      tab.id,
      {greeting:  msg}
    ).then(response => {
      console.log(response.answer);
    }).catch(onError);

}


//TO BE USED LATER MAYBE
function getSelectionText() {
    var text = "";
    var activeEl = document.activeElement;
    var activeElTagName = activeEl ? activeEl.tagName.toLowerCase() : null;
    if (
      (activeElTagName == "textarea") || (activeElTagName == "input" &&
      /^(?:text|search|password|tel|url)$/i.test(activeEl.type)) &&
      (typeof activeEl.selectionStart == "number")
    ) {
        text = activeEl.value.slice(activeEl.selectionStart, activeEl.selectionEnd);
    } else if (window.getSelection) {
        text = window.getSelection().toString();
    }
    return text;
}
