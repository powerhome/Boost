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

var patternLinkerContainer;

(function setupPatternLinkers() {

    patternLinkerContainer = new Object();
    let placeholder = "#placeholder#";
    patternLinkerContainer["placeholder"] = placeholder;

    let patternLinkers = new Object();
    
    let domain = "test";//https?:\/\/(?:www.)?\S{1,30}.com\/|file:\/\/\/\S*.html/i.exec(document.URL)[0];
    patternLinkerContainer["domain"] = domain;

    var homePatternLinker = new PatternLinker(/H#(\d{1,8})/igm, domain + "homes/" + placeholder, "Home#: ");
    addPattern("home pattern", homePatternLinker);

    var phonePatternLinker = new PatternLinker(/\(?(\d{3})\)?(?: |\-)*(\d{3})\-?(\d{4})/igm, domain + "homes?page=1&homes_filter[phone_number_cond]=eq&homes_filter[phone_number]=" + placeholder, "Phone#: ");
    addPattern("phone pattern", phonePatternLinker);

    var projPatternLinker = new PatternLinker(/(?:^|\b)(3\d)\-?(\d{5})\b/igm, domain + "projects?q[project_number_eq]=" + placeholder, "Project#: ");
    addPattern("project pattern", projPatternLinker);

    var apptPatternLinker = new PatternLinker(/(?:^|\s|[^ht]#)([0-2|4-9]\d{4,7})\b/igm, domain + "homes?homes_filter[lead_id_cond]=eq&homes_filter[lead_id]=" + placeholder, "Appt #: ");
    addPattern("appointment pattern", apptPatternLinker);

    var ticketPatternLinker = new PatternLinker(/\b(?:t(?:icket)? ?#? ?)(\d+)\b/igm, domain + "support/tickets/" + placeholder, "Ticket #:");
    addPattern("ticket pattern", ticketPatternLinker);

    //store patternLinkers in PLC
    patternLinkerContainer["patternLinkers"] = patternLinkers;

    //adds patternlinkers to patternLinkers obj
    function addPattern(name, patternLinker)
    {
      patternLinkers[name] = patternLinker;
    }

    /* 
    holds a regex pattern and the proper way to link to that item if it matches
    added: linkText to use when making link
    */ 
    function PatternLinker(pattern, link, linkText)
    {
      this.pattern = pattern;
      this.link = link;
      this.linkText = linkText;
    }

  })();

console.log(patternLinkerContainer);

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
