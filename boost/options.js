var newBottomKey;
var newLinkKey;

function saveOptions(e) {
  console.log("saving options");
  e.preventDefault();

  if(newBottomKey != undefined)
  {
    chrome.storage.local.set({
      bottomKey: newBottomKey
    });
  }
  if(newLinkKey != undefined)
  {
    chrome.storage.local.set({
      linkKey: newLinkKey
    });
  }
}

function resetOptions(e) {
  console.log("resetting options");
  e.preventDefault();
  chrome.storage.local.set({
    bottomKey: {"mod": "Ctrl", "key": "x"},
    linkKey: {mod: "Ctrl", key: "z"},
    domain: undefined,
    domainLocked: false
  }, function() {
    restoreOptions();
  });
}

function restoreOptions() {
  let bottomInput = document.getElementById("bottomInput");
  let linkInput = document.getElementById("linkInput");

  bottomInput.onkeypress = e => {
    newBottomKey = processInputOnKeyPress(e,bottomInput);
    e.preventDefault();
  };

  linkInput.onkeypress = e => {
    newLinkKey = processInputOnKeyPress(e, linkInput);
    e.preventDefault();
  }

  function processInputOnKeyPress(e, inputField) {
    let result = "";
    let resultObj = {};

    if(e.ctrlKey) {
      result += "Ctrl + ";
      resultObj["mod"] = "Ctrl";
    } else if (e.altKey) {
      result += "Alt + ";
      resultObj["mod"] = "Alt";
    } else if (e.metaKey) {
      result += "Meta + ";
      resultObj["mod"] = "Meta";
    } else {
      resultObj["mod"] = "";
    }

    result = result + e.key;
    resultObj["key"] = e.key;
    inputField.value = result;
    return resultObj;
  }

  function setCurrentChoice(result) {
    let bottomKey = result.bottomKey;
    let linkKey = result.linkKey;
    
    bottomInput.value = `${bottomKey.mod} + ${bottomKey.key}`; 

    linkInput.value = `${linkKey.mod} + ${linkKey.key}`;
  }

  function onError(error) {
    console.log(`Error: ${error}`);
  }

  chrome.storage.local.get(["bottomKey","linkKey"], setCurrentChoice);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
document.querySelector("form").addEventListener("reset", resetOptions);