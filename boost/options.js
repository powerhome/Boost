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

  chrome.runtime.sendMessage({greeting: "unlock domain"});

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

function resetDomain(e) {
  chrome.runtime.sendMessage({greeting: "unlock domain"}, function(response) {
    console.log(response.response);
  });

  chrome.storage.local.set({
    domain: undefined,
    domainLocked: false
  });

}

function jsonParser() {

  let test = JSON.parse(this.responseText);
  console.log(test);
  console.log(test["home pattern"]);

  for(thisPattern in test) {
    test[thisPattern].pattern = new RegExp(test[thisPattern].pattern, 'igm');
   
  }

  console.log(test);
  console.log(test["home pattern"]);

  chrome.runtime.sendMessage({greeting:"sending new patternLinker", patternLinker: test});

}

function jsonTest(e) {
  var jsonReq = new XMLHttpRequest();
  jsonReq.overrideMimeType("application/json");
  jsonReq.addEventListener("load",jsonParser);
  jsonReq.open("GET", "patternLinker.json");
  jsonReq.send();

}

function useNewPattern(e) {
  let selectedFile = document.getElementById("newPatternInput");
  console.log(selectedFile.files[0]);
  //let newPattern = JSON.parse(selectedFile.files[0]);

  var jsonReq = new XMLHttpRequest();
  jsonReq.overrideMimeType("application/json");
  jsonReq.addEventListener("load",jsonParser);
  jsonReq.open("GET", selectedFile.files[0].name);
  jsonReq.send();

}

function resetPatterns() {
  console.log("resetting patterns");
  chrome.runtime.sendMessage({greeting:"reset patterns"});
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.getElementById("resetDomainButton").addEventListener("click", resetDomain);
document.querySelector("form").addEventListener("submit", saveOptions);
document.querySelector("form").addEventListener("reset", resetOptions);
document.getElementById("useNewPatternButton").addEventListener("click", useNewPattern);
document.getElementById("resetPLCButton").addEventListener("click", resetPatterns);