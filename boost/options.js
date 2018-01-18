function saveOptions(e) {
  console.log("saving options");
  e.preventDefault();
  browser.storage.local.set({
    sidebarKey: document.getElementById("sidebar").value,
    linkKey: document.getElementById("link").value
  });
}

function restoreOptions() {
  let sidebarInput = document.getElementById("sidebar");
  let linkInput = document.getElementById("link");

  sidebarInput.onkeydown = e => {
    processInputOnKeyDown(e,sidebarInput);
  };

  linkInput.onkeydown = e => {
    processInputOnKeyDown(e, linkInput);
  }

  function processInputOnKeyDown(e, inputField) {
    let result = ""

    if(e.ctrlKey) {
      result += "ctrl + ";
    } else if (e.altKey) {
      result += "alt + "
    } else if (e.metaKey) {
      result += "meta + "
    }

    result += e.key;
    inputField.value = result;
  }

  function setCurrentChoice(result) {
    sidebarInput.value = result.sidebarKey || "MacCmd + Z";
    linkInput.value = result.linkKey || "MacCtrl + B";
  }

  function onError(error) {
    console.log(`Error: ${error}`);
  }

  var getting = browser.storage.local.get(["sidebarKey","linkKey"]);
  getting.then(setCurrentChoice, onError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);