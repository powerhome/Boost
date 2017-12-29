console.log("Content Script Loade 1d");

//targets not to hit with links
var invalidTargets = [];
var patternLinkerContainer;


/*
	Sets up the listeners and fetches the PLC from bg
*/
(function () {
	console.log("setup");
	invalidTargets.push(document.body);

	//sets up listener to get command press from BG Script
	browser.runtime.onMessage.addListener(request => {
		console.log("from bg: " + request.greeting);
		let response = "response: ";

		switch(request.greeting) {
			case "action clicked":	
				response += "action click recieved";
				console.log("action click conf");
				break;
			case "command pressed":
				response += "command pressed recieved";
				//addTextAtMouse();
				console.log("command press conf");
				linkifyAtMouseover();
				break;
			default:
				response += "unknown message";
				console.log("unknown message recieved");
				break;
		}
		return Promise.resolve({answer: response});
	});

	//gets the pattern linker to use from the BG script
	browser.runtime.sendMessage({greeting: "get PLC", value: 5}
		).then(response => {
      console.log(response.response);
      patternLinkerContainer = response.patternLinkerContainer;
      console.log(patternLinkerContainer);

    }).catch(onError);

	console.log("Setup complete");

})();


//checks to see that a node is valid
//if it is, adds to list so it wont be again
function validateNode(elem) {
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

	//loops through nodes -elem add children to list, text check for matches
	while(nextArray.length > 0)
	{
		let node = nextArray.pop();
		if(!validateNode(node)) node = false; //if node is not valid, dont eval it at all
			switch(node.nodeType) {
				case Node.ELEMENT_NODE:
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
				case Node.TEXT_NODE: 
					console.log("test");
					let links = linksFromText(node.nodeValue);
					console.log("test");
					
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
			}	//switch
	}	//while

	if(resultDiv.childNodes[1].firstChild !== null){ //if any links have been added
		target.parentNode.insertBefore(resultDiv, target.nextSibling); //add result div to dom after target
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

	function addToResult(resultDiv, elem) {
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
	function linkify(linkAddress, linkText) {
		result = "<a target=\"_blank\" href =\"" + linkAddress + "\">" + linkText + "</a>";

		return result;
	}
}









