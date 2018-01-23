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
  // let bbKey = document.getElementById("bottomInput").value;
  // let lKey = document.getElementById("linkInput").value;

  // chrome.storage.local.set({
  //   bottomKey: bbKey,
  //   linkKey: lKey
  // });
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
    console.log(resultObj);
    inputField.value = result;
    return resultObj;
  }

  function setCurrentChoice(result) {
    let bottomKey = result.bottomKey;
    let linkKey = result.linkKey;
    bottomInput.value = `${bottomKey.mod} + ${bottomKey.key}` || "MacCmd + Z";
    linkInput.value = `${linkKey.mod} + ${linkKey.key}` || "MacCtrl + B";
  }

  function onError(error) {
    console.log(`Error: ${error}`);
  }

  chrome.storage.local.get(["bottomKey","linkKey"], setCurrentChoice);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);