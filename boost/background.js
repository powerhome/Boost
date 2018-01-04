const action_msg = "action clicked";
const command_msg = "command pressed";
const sending_pattern_msg = "sending PLC";

console.log("BG Loaded");


/*
Called when there was an error.
We'll just log the error here.
*/
function onError(error) {
  console.log(`Error: ${error}`);
}

var patternLinkerContainer = false;

//sets up pattern linker using domain 
function setupPatternLinkers(newDomain) {

  patternLinkerContainer = new Object();
  let placeholder = "#placeholder#";
  patternLinkerContainer["placeholder"] = placeholder;

  let patternLinkers = new Object();
  
  let domain = newDomain;//https?:\/\/(?:www.)?\S{1,30}.com\/|file:\/\/\/\S*.html/i.exec(document.URL)[0];
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

}

/*
  adds a listener to messages
*/
browser.runtime.onMessage.addListener(request => {

    console.log("msg recieved: " + request.greeting);
    let answer = new Object();
    var response = "response: ";

    switch(request.greeting) {

        case "get PLC":  
        response += "returning patt linker con";
        answer["patternLinkerContainer"] = patternLinkerContainer;
        console.log("BG"+response);
        break;

        case "get links":
        response += "returning links";
        answer["links"] = buildLinksFromInput(request.value, request.domain);
        console.log("returning links ");
        break;


      default:
        response += "unknown message";
        console.log("unknown message: " + request.greeting);
        break;
    }

    answer["response"] = response;
    return Promise.resolve(answer);
  });

/*
Sets listeners for commands
*/
browser.commands.onCommand.addListener(function(command) {

  console.log(command);
  
  browser.tabs.query({
    currentWindow: true,
    active: true
  }).then(tabs =>
    sendMessageToTab(tabs[0], command_msg))
    .then(response => {
      console.log(response.response);
    }).catch(onError);

});


/*
Sets listener for browser action
*/
browser.browserAction.onClicked.addListener(() => {
  console.log("action clicked");

  browser.tabs.query({
    currentWindow: true,
    active: true
  }).then(tabs =>
    sendMessageToTab(tabs[0], action_msg)
    .then(resp => {
      let domain = resp.response;
      setupPatternLinkers(domain);
      console.log(patternLinkerContainer);
      sendPatternLinkersToScripts();
    })
    .catch(onError));
});


function sendPatternLinkersToScripts() {

  //sends to contentScri[t]
  browser.tabs.query({
    currentWindow: true,
    active: true
  }).then(tabs =>
    sendMessageToTab(tabs[0], sending_pattern_msg, patternLinkerContainer))
    .then(response => {
      console.log(response.response);
    }).catch(onError);
}


function sendMessageToTab(tab,msg,obj) {

  console.log(`sent: ${msg} to tab ${tab.id}`);

    message = {greeting:  msg};
    if(obj)
    {
      message["obj"] = obj;
    }

    return browser.tabs.sendMessage(
      tab.id,
      message
    );

}

function buildLinksFromInput(textArr, domain) {
  if(domain) {
    console.log("domain changed to " + domain);
    setupPatternLinkers(domain);
  }

  if(!(textArr instanceof Array)) {
      textArr = [textArr];
  }

  let result = [];

  for(let i = 0; i < textArr.length; i++) {
    let item = textArr[i];
    console.log("item: " + item);
  
    let links = linksFromText(item);
    console.log(links);
    console.log(links.length);
    if(links.length > 0){
      result.push(links.join());
    }
  }

  return result;
}

/*
  Checks all patternLinkers in patternLinkers obj against text and returns links for those matches
*/
function linksFromText(text) {

  //accumulate all the matches
  let results = [];
  //patternLinkers in PLC holds the patterns to match
  for(patt in patternLinkers = patternLinkerContainer.patternLinkers) {
    let thisPatt = patternLinkers[patt];
    let matches = getMatchesFromText(text, thisPatt.pattern);
    // for every match, replace the placeholder with the actual number
    for(let i = 0; i < matches.length; i++)
    {
      //replace placeholder value in link with num from matches
      let res = thisPatt.link.replace(patternLinkerContainer.placeholder, matches[i]);
      res = thisPatt.linkText + linkify(res,  matches[i]);
      results.push(res);
    }
  }
  console.log("matches made: " + results.length);
  return results;

  /*
    gets all the matches for pattern from text
    returns a concatenation of the capture groups for the patter
    assumes that the capture group collectively concat to the proper number
  */
  function getMatchesFromText(text, pattern) {

    let resultArray;
    let results = [];

    //finds all the  matches in the text for this pattern
    while ((resultArray = pattern.exec(text)) !== null) {
        result = "";

        //index 1,2,3... correspond to capture groups in regex
        for(let i = 1; typeof resultArray[i] !== 'undefined'; i++)
        {
          if(i == 2) { result += "-"; }
        result += resultArray[i];

        }
        results.push(result);
    }
    return results;
  }

  /*
    Takes an address and text for link and builds the tag accordingly
  */
  function linkify(linkAddress, textToLink) {
    result = "<a target=\"_blank\" href =\"" + linkAddress + "\">" + textToLink + "</a>";

    return result;
  }

}
// //TO BE USED LATER MAYBE
// function getSelectionText() {
//     var text = "";
//     var activeEl = document.activeElement;
//     var activeElTagName = activeEl ? activeEl.tagName.toLowerCase() : null;
//     if (
//       (activeElTagName == "textarea") || (activeElTagName == "input" &&
//       /^(?:text|search|password|tel|url)$/i.test(activeEl.type)) &&
//       (typeof activeEl.selectionStart == "number")
//     ) {
//         text = activeEl.value.slice(activeEl.selectionStart, activeEl.selectionEnd);
//     } else if (window.getSelection) {
//         text = window.getSelection().toString();
//     }
//     return text;
// }
