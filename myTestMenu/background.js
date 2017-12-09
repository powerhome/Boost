

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
  if (command == "test_command")
  {
    console.log("Should show selected text:");
    console.log(getSelectionText());
  }
});

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

function sendMessageToTabs(tabs) {


  for (let tab of tabs) {
    console.log(tabs[0].id);
    browser.tabs.sendMessage(
      tab.id,
      {greeting: "Hi from background script" + tab.id}
    ).then(response => {
      console.log("Message from the content script:");
      console.log(response.response);
    }).catch(onError);
  }
}

browser.browserAction.onClicked.addListener(() => {
  browser.tabs.query({
    //currentWindow: true,
    active: true
  }).then(sendMessageToTabs).catch(onError);
});
