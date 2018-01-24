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
var recentMatches = [];
var domainLocked = false;
var tabsWithPageActionIndexes = [];

//sets up pattern linker using domain 
function setupPatternLinkers(newDomain) {

  if(newDomain === patternLinkerContainer.domain || domainLocked)
  {
    if(domainLocked) {
      console.log("DOMAIN LOCKED");
      return
    }
    console.log("DOMAIN SAME");
    return;
  }
  recentMatches = [];

  patternLinkerContainer = new Object();
  let placeholder = "#placeholder#";
  patternLinkerContainer["placeholder"] = placeholder;

  let patternLinkers = new Object();
  
  let domain = newDomain;//https?:\/\/(?:www.)?\S{1,30}.com\/|file:\/\/\/\S*.html/i.exec(document.URL)[0];
  patternLinkerContainer["domain"] = domain;

  var homePatternLinker = new PatternLinker(/H#(\d{1,8})/igm, ("homes/" + placeholder), "Home#: ");
  addPattern("home pattern", homePatternLinker);

  var phonePatternLinker = new PatternLinker(/\(?(\d{3})\)?(?: |\-)*(\d{3})\-?(\d{4})/igm, "homes?page=1&homes_filter[phone_number_cond]=eq&homes_filter[phone_number]=" + placeholder, "Phone#: ");
  addPattern("phone pattern", phonePatternLinker);

  var projPatternLinker = new PatternLinker(/(?:^|\b)(3\d)\-?(\d{5})\b/igm, "projects?q[project_number_eq]=" + placeholder, "Project#: ");
  addPattern("project pattern", projPatternLinker);

  var apptPatternLinker = new PatternLinker(/(?:^#?|\s|[^ht]#)([0-2|4-9]\d{4,7})\b/igm, "homes?homes_filter[lead_id_cond]=eq&homes_filter[lead_id]=" + placeholder, "Appt #: ");
  addPattern("appointment pattern", apptPatternLinker);

  var ticketPatternLinker = new PatternLinker(/\b(?:t(?:icket)? ?#? ?)(\d+)\b/igm, "support/tickets/" + placeholder, "Ticket #:");
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
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    console.log("msg recieved: " + request.greeting);
    let answer = new Object();
    var response = "response: ";

    switch(request.greeting) {

        case "clear Recent":
        recentMatches = [];
        break;

        case "get Recent":
        answer.value = recentMatches;
        break;

        case "get PLC":  
        response += "returning patt linker con";
        answer["patternLinkerContainer"] = patternLinkerContainer;
        console.log("BG"+response);
        break;

        case "try pageAction":
        response += "returning page action status";
        if(tryPageAction())
        {
          chrome.pageAction.show(sender.tab.id);
          tabsWithPageActionIndexes.push(sender.tab.id);
          console.log(tabsWithPageActionIndexes);
        }
        else
        {
          chrome.pageAction.hide(sender.tab.id);
        }
        break;

        case "get links":
        response += "returning links";
        answer["links"] = buildLinksFromInput(request.value, request.domain);
        console.log("returning links " + answer);
        console.log(answer);
        break;


      default:
        response += "unknown message";
        console.log("unknown message: " + request.greeting);
        break;
    }

    answer["response"] = response;
    sendResponse(answer);
  });



/*
Sets listeners for commands
*/
chrome.commands.onCommand.addListener(function(command) {

  console.log(command);
  
chrome.tabs.query({active:true,windowType:"normal", currentWindow: true}
  ,function(tabs){
    chrome.tabs.sendMessage(
      tabs[0].id,
      {greeting: command_msg}
    );
  });
});


/*
Sets listener for browser action
*/
chrome.pageAction.onClicked.addListener(() => {
  console.log("action clicked");

  chrome.tabs.query({active:true, currentWindow: true}
  ,function(tabs){
    chrome.tabs.sendMessage(tabs[0].id,{greeting: action_msg},
        function(response) {
          if(response.domain_lock_needed) {
            lockDomain(response.domain);
           //  setupPatternLinkers(response.domain);
            //chrome.pageAction.hide(tabs[0].id);
          }

          console.log(response.response);
      });
  });

  function lockDomain(domain) {

    setupPatternLinkers(domain);
    chrome.storage.local.set({domain: domain, locked: true});
    console.log("TESTTAETASDF");
    domainLocked = true;

    console.log(tabsWithPageActionIndexes);
    for(let i = 0; i < tabsWithPageActionIndexes.length; i++)
    {
      chrome.pageAction.hide(tabsWithPageActionIndexes[i]);

    }
    tabsWithPageActionIndexes = [];
  }

});



function buildLinksFromInput(textArr, domain) {

  if(!patternLinkerContainer && domain)
  {
    setupPatternLinkers(domain);
  }

  if(!(textArr instanceof Array)) {
      textArr = [textArr];
  }

  let result = [];

  for(let i = 0; i < textArr.length; i++) {
    let item = textArr[i];
    let links = linksFromText(item, domain);

    if(links.length > 0){
      for(let i = 0; i < links.length; i++) {
        //links to return
        result.push(links[i]);
        //links saved in history
        recentMatches.push(links[i]);
      }
    }
  }

  return result;
}

/*
  Checks all patternLinkers in patternLinkers obj against text and returns links for those matches
*/
function linksFromText(text, domainArg) {
  console.log(text);
  //determines if a specific domain is needed or to use the previously saved one
  let domain = domainArg || patternLinkerContainer.domain;
  console.log(domain);
  //accumulate all the matches
  let results = [];

  console.log(patternLinkerContainer);
  //patternLinkers in PLC holds the patterns to match
  for(patt in patternLinkers = patternLinkerContainer.patternLinkers) {
    let thisPatt = patternLinkers[patt];
    let matches = getMatchesFromText(text, thisPatt.pattern);
    // for every match, replace the placeholder with the actual number
    for(let i = 0; i < matches.length; i++)
    {
      //replace placeholder value in link with num from matches
      let res = thisPatt.link.replace(patternLinkerContainer.placeholder, matches[i]);
      res = thisPatt.linkText + linkify(domain, res,  matches[i]);
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
    console.log(text);
    console.log(pattern);
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
  function linkify(domain, path, textToLink) {
    result = "<a target=\"_blank\" href =\"" + domain + path + "\">" + textToLink + "</a>";

    return result;
  }

}

function tryPageAction() {

  return !domainLocked;
}

