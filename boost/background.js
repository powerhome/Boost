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
var tabsURLInfo = {};
//var bottomOpen = true;
var windows = {};

(function setup() {
  //listens for changes in tabs mostly for pages that reload w/o changes url

  chrome.tabs.onUpdated.addListener(
    function(tabID, changeInfo, tab) {

      if(changeInfo.status) {
        chrome.tabs.sendMessage(tabID, {greeting:"check bottom", bottomOpen: getWindowOpenStatus(tab.windowId)}, function(response) {
          console.log(response.response);
        });
      }
  });

  //checks storage to see if defaults need to be set(as well as some setup)
  chrome.storage.local.get(["domain","domainLocked","bottomKey","linkKey"],
    function(response){
      domainLocked = response.domainLocked;
      let domain = response.domain;

      if(domain != undefined)
        setupPatternLinkers(domain);

      let bottomKeyDefault = {"mod": "Ctrl", "key": "x"};
      let linkKeyDefault = {mod: "Ctrl", key: "z"};
      let defaultsToSet = {};
      if(response.bottomKey == undefined)
      {
        defaultsToSet["bottomKey"] = bottomKeyDefault;
      }

      if(response.linkKey == undefined)
      {
        defaultsToSet["linkKey"] = linkKeyDefault;
      }

      if(Object.keys(defaultsToSet).length > 0)
      {
        console.log("setting defaults");
        chrome.storage.local.set(defaultsToSet, 
          function() {
            console.log("Defaults set");
          });
      }
    });//Storage get and callback function
})();//setup IIFE

//sets up pattern linker using domain TODO Pull out to json maybe?
function setupPatternLinkers(newDomain) {

  if(newDomain === patternLinkerContainer.domain)
  {
    
    console.log("DOMAIN SAME");
    return;
  }
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
  adds a listener to messages, specifically any to chrome.runtime
*/
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("msg recieved: " + request.greeting);
    let answer = new Object();
    var response = "response: ";

    switch(request.greeting) {
      case "get bottom open":
        answer.bottomOpen = getWindowOpenStatus(sender.tab.windowId);
        response += "returning if open bottom";
        break;

      case "clear Recent":
        response += "clearing recent OK";
        recentMatches = [];
        break;

      case "open bottom":
        console.log(sender.tab.windowId)
        response += "Open bottom OK";
        //bottomOpen = true;
        setWindowOpenStatus(sender.tab.windowId, true);
        sendMessageToAllTabs({greeting:request.greeting});
        break;

      case "close bottom":
        response += "close bottom OK";
        setWindowOpenStatus(sender.tab.windowId, false);
        sendMessageToAllTabs({greeting:request.greeting});
        break;

      case "toggle bottom":
        response += "toggle bottom OK";
        let bottomOpen = !getWindowOpenStatus(sender.tab.windowId);
        setWindowOpenStatus(sender.tab.windowId, bottomOpen);
        sendMessageToAllTabs({greeting:request.greeting, bottomOpen: bottomOpen});
        break;

      case "get Recent":
        response += "sending recent";
        answer.value = recentMatches;
        break;

      case "unlock domain":
        response += "unlocking domain"
        domainLocked = false;
        break;

      case "get PLC":  
        response += "returning patt linker con";
        answer["patternLinkerContainer"] = patternLinkerContainer;
        console.log("BG"+response);
        break;

      case "try pageAction":
        if(tryPageAction()) {
          response += "pageAction Shown";
          chrome.pageAction.show(sender.tab.id);
          tabsWithPageActionIndexes.push(sender.tab.id);
        }
        else {
          response += "no PA: domain locked";
        }
        break;

      case "get links":
        response += "returning links";
        answer["links"] = buildLinksFromInput(request.value, request.domain);
        console.log("returning links " + answer);
        break;

      default:
        response += "unknown message";
        console.log("unknown message: " + request.greeting);
        break;
    }
    console.log("sending response: " + response);
    answer["response"] = response;
    sendResponse(answer);
  });

function sendMessageToAllTabs(msg) {

  chrome.tabs.query({currentWindow: true},
    function(tabs) {
    for(let i = 0; i < tabs.length; i++)
    {
      chrome.tabs.sendMessage(tabs[i].id, msg);
    }
  });


}

function setWindowOpenStatus(windowId, isOpen) {
  if(windows[windowId] != undefined) {
    windows[windowId].openStatus = isOpen;
  }
  else {
    windows[windowId] = {openStatus: isOpen};
  }

}

function getWindowOpenStatus(windowId) {
  let currWindow;
  if(windows[windowId] != undefined) {
    currWindow = windows[windowId];
  }
  else {
    //default to closed, let setter handler default
    setWindowOpenStatus(windowId, false)
    currWindow = windows[windowId];
  }

  return currWindow.openStatus;
}

/*
  Sets listener for page action
*/
chrome.pageAction.onClicked.addListener(() => {
  console.log("action clicked");

  chrome.tabs.query({active:true, currentWindow: true}
  ,function(tabs){
    chrome.tabs.sendMessage(tabs[0].id,{greeting: action_msg},
        function(response) {
          if(response.domain_lock_needed) {
            lockDomain(response.domain);
          }
          console.log(response.response);
      });
  });

  //when pageaction is clicked, lock the domain and hide all current page actions
  function lockDomain(domain) {
    setupPatternLinkers(domain);
    chrome.storage.local.set({domain: domain, domainLocked: true});
    domainLocked = true;

    for(let i = 0; i < tabsWithPageActionIndexes.length; i++)
    {
      chrome.pageAction.hide(tabsWithPageActionIndexes[i]);

    }
    tabsWithPageActionIndexes = [];
  }

});

//takes an array of strings and finds all the links that match the text
function buildLinksFromInput(textArr, domain) {
  if(!domainLocked && !patternLinkerContainer && domain)
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

        let thisMatchIndex = recentMatches.indexOf(links[i]);
        if(thisMatchIndex >= 0)
        {
          console.log("DUPE" );//if dupe, remove from array and put in front
          recentMatches.splice(thisMatchIndex, 1);
          recentMatches.push(links[i]);
        }
        else {
          recentMatches.push(links[i]);
        }
      }
    }
  }

  return result;
}

/*
  Checks all patternLinkers in patternLinkers obj against text and returns links for those matches
*/
function linksFromText(text, domainArg) {
  //determines if a specific domain is needed or to use the previously saved one
  let domain = domainArg || patternLinkerContainer.domain;
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
      res = thisPatt.linkText + linkify(domain, res,  matches[i]);
      results.push(res);
    }
  }
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
  function linkify(domain, path, textToLink) {
    result = "<a target=\"_blank\" href =\"" + domain + path + "\">" + textToLink + "</a>";

    return result;
  }

}

function tryPageAction() {
  return !domainLocked;
}

