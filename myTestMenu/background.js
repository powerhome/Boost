const action_msg = "action pressed";
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
Sets listeners for commands
*/
browser.commands.onCommand.addListener(function(command) {
  
  console.log("command pressed")
  
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
  }).then(tabs => sendMessageToTab(tabs[0], "test")).catch(onError);
});




function sendMessageToTab(tab,msg) {

  console.log(tab.id);

    browser.tabs.sendMessage(
      tab.id,
      {greeting: msg + " " + tab.id}
    ).then(response => {
      console.log("Message from the content script:");
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
