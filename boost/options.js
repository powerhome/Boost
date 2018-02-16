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

function useNewPattern(e) {
  console.log("saving new Patterns");
  let selectedFile = document.getElementById("newPatternInput").files[0];
  var fr = new FileReader();

  fr.onload = function(e) {
    console.log(fr.result);
    console.log(fr);
    chrome.storage.local.set({
      patternLinkers: fr.result
    });
    chrome.runtime.sendMessage({greeting:"sending new patternLinker", patternLinkerRaw: fr.result}, function(response) {
      console.log(response.response);
      if(!response.newPatternSet) {
        console.log("pattern change aborted");
      }
      else {
        console.log("pattern changed");
      }
    });
  }

  fr.readAsText(selectedFile)


}

function resetPatterns() {
  console.log("resetting patterns");
  chrome.storage.local.set({
    patternLinkers: undefined
  });
  chrome.runtime.sendMessage({greeting:"reset patterns"});
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.getElementById("resetDomainButton").addEventListener("click", resetDomain);
document.querySelector("form").addEventListener("submit", saveOptions);
document.querySelector("form").addEventListener("reset", resetOptions);
document.getElementById("useNewPatternButton").addEventListener("click", useNewPattern);
document.getElementById("resetPLCButton").addEventListener("click", resetPatterns);