console.log("Content Script Loaded");

var domain = /https?:\/\/(?:www.)?\S*.com|file:\/\/\/\S*.html/i.exec(document.URL)[0];
//targets not to hit with links
var invalidTargets = [];
var replaceWithNum = "#placeholder#";
var patterns;

(function setup() {

//dont let body be a target
invalidTargets.push(document.body);

//sets up the patterns used to match for links
//stored in patterns var
(function setupPatterns() {
	patterns = new Object();

	var homePatt = /H#(\d{1,8})/igm;
	var homePatternLinker = new PatternLinker(homePatt, domain + "/homes/" + replaceWithNum, "Home#: ");
	addPattern("home pattern", homePatternLinker);

	var phonePatt = /\(?(\d{3})\)?(?: |\-)*(\d{3})\-?(\d{4})/igm;
	var phonePatternLinker = new PatternLinker(phonePatt, domain + "/homes?page=1&homes_filter[phone_number_cond]=eq&homes_filter[phone_number]=" + replaceWithNum, "Phone#: ");
	addPattern("phone pattern", phonePatternLinker);

	var projPatt = /(?:^|\b)(3\d\-?\d{5})\b/igm;
	var projPatternLinker = new PatternLinker(projPatt, domain + "/projects?&q[project_number_eq]=" + replaceWithNum, "Project#: ");
	addPattern("project pattern", projPatternLinker);

	var apptPatt = /(?:^|\s|[^ht]#)([0-2|4-9])(\d{4,7})\b/igm;
	var apptPatternLinker = new PatternLinker(apptPatt, domain + "/homes?homes_filter[lead_id_cond]=eq&homes_filter[lead_id]=" + replaceWithNum, "Appt #: ");
	addPattern("appointment pattern", apptPatternLinker);

	var ticketPatt = /\b(?:t(?:icket)? ?#? ?)(\d+)\b/igm;
	var ticketPatternLinker = new PatternLinker(ticketPatt, domain + "/support/tickets/" + replaceWithNum, "Ticket #:");
	addPattern("ticket pattern", ticketPatternLinker);

	//adds patternlinkers to patterns obj
	function addPattern(name, patternLinker)
	{
		patterns[name] = patternLinker;
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

//sets up listener to get command press from BG Script
browser.runtime.onMessage.addListener(request => {
	console.log("from bg: " + request.greeting);
	
	var response = "response: ";

	if(request.greeting == "action clicked")	
	{
		response += "action click recieved";
		console.log("action click conf");
	}
	if(request.greeting == "command pressed")
	{
		response += "command pressed recieved";
		//addTextAtMouse();
		console.log("command press conf");
		linkifyAtMouseover();
	}


	return Promise.resolve({answer: response});
});


})();


function onError(error) {
  console.log(`Error: ${error}`);
}

//checks to see that a node is valid
//if it is, adds to list so it wont be again
function validateNode(elem)
{
	if(invalidTargets.includes(elem) ){
		console.log("invalid elem: " + elem);
		return false;
	}

	invalidTargets.push(elem);
	return true;
}


/**
	Gets the most specific html element at the mouse
	pulls all the children elements of that element
	Adds links after elem if they contain text that match a pattern set in setup
	Sets all nodes to invalid targets once they are visited once to avoid dups
*/
function linkifyAtMouseover() {

	console.log("Linkify running");

	let target = getMouseoverElement();
	let nextArray = [target];
	let resultDiv = buildResultDiv();

	//loops through nodes -elem get children, text check for matches
	while(nextArray.length > 0)
	{

		let node = nextArray.pop();
		if(!validateNode(node)) node = false; //if node is not valid, dont eval the rest
			switch(node.nodeType) {

				case Node.ELEMENT_NODE: {
					let children = node.childNodes;
					//adds the children nodes of current node that need to be checked
					children.forEach( function(currentChild, currentIndex, children) {
						//elem = 1, text = 3, 2 depricated. checks that node is good to use
						if(currentChild.nodeType <= 3)
						{
							nextArray.push(currentChild);
						}
					});
					break;
				}
			
				case Node.TEXT_NODE: {
					let links = linksFromText(node.nodeValue);
					
					for(let i = 0; i < links.length; i++) {
						let thisDiv = document.createElement("DIV");
						thisDiv.innerHTML = links[i];

						//inserts the matched link in the result div
						addToResult(resultDiv, thisDiv);
						
						//puts the div and the link elems into invalid targets so you cant make links from links
						invalidTargets.push(thisDiv);
						invalidTargets.push(thisDiv.childNodes[1]);
					}
					break;
				}
			}	//switch
	}	//while
	if(resultDiv.childNodes[1].firstChild !== null){ //if any links have been added
		target.parentNode.insertBefore(resultDiv, target.nextSibling);
	}

	function buildResultDiv() {
		let resultDiv = document.createElement("DIV");
		resultDiv.className = "BLresult";
		invalidTargets.push(resultDiv);

		let title = document.createElement("DIV");
		title.className = "BLtitle";
		title.innerHTML = "Boost Links:";
		resultDiv.appendChild(title);
		invalidTargets.push(title);

		let itemsDiv = document.createElement("DIV");
		itemsDiv.className = "BLitems";
		resultDiv.appendChild(itemsDiv);
		invalidTargets.push(itemsDiv);

		return resultDiv
	}

	function addToResult(resultDiv, elem)
	{
		resultDiv.childNodes[1].appendChild(elem);
	}
}

/*
	returns the most specific element at the mouse
*/
function getMouseoverElement() {
	var items = document.querySelectorAll( ":hover" );
		
	if(items.length > 0) {
		item = items[items.length - 1];
		console.log("item at mouseover: " + item.tagName);

		return item;
	}
	return null;
}

/*
	Checks all patterns in patterns obj against text and returns links for those matches
*/
function linksFromText(text) {
	console.log("Getting matches from text and making links");
	
	//accumulate all the matches
	var results = [];

	//patterns holds the patterns to match AND the link to fill with the match
	for(patt in patterns) {
		let thisPatt = patterns[patt];

		let matches = getMatchesFromText(text, thisPatt.pattern);

		// for every match, replace the placeholder with the actual number
		for(let i = 0; i < matches.length; i++)
		{
			
			//replace REPLACE WITH NUM in link for patt with num from matches
			let res = thisPatt.link.replace(replaceWithNum, matches[i]);

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

		//finds all the  matches in the text
		while ((resultArray = pattern.exec(text)) !== null) {
			  result = "";

			  //index 1,2,3... correspond to capture groups
			  for(let i = 1; typeof resultArray[i] !== 'undefined'; i++)
			  {
				result += resultArray[i];

			  }
			  results.push(result);
		}
		return results;
	}

	/*
		Takes an address and text for link and builds the tag accordingly
	*/
	function linkify(linkAddress, linkText){

		result = "<a target=\"_blank\" href =\"" + linkAddress + "\">" + linkText + "</a>";

		return result;
	}
}









