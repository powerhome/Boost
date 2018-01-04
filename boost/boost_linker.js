console.log("Content Script Loaded");

//targets not to hit with links
var invalidTargets = [];
var currDomain;

/*
Called when there was an error.
We'll just log the error here.
*/
function onError(error) {
  console.log(error);
}

/*
	Sets up the listeners and fetches the PLC from bg
*/
(function () {
	console.log("setup");
	invalidTargets.push(document.body);

	if(currDomain == undefined) {
		currDomain = getDomain();

	}
	console.log(currDomain);

	//sets up listener to get command press from BG Script
	browser.runtime.onMessage.addListener(request => {
		console.log("from bg: " + request.greeting);
		let answer = new Object();
		let response = "response: ";

		switch(request.greeting) {
			case "action clicked":	
				response = getDomain();
				console.log("action click conf - returning domain");
				break;
			case "command pressed":
				response += "command pressed recieved";
				console.log("command press conf");
				linkifyAtMouseover();
				break;
			case "sending PLC":
				console.log(request.obj);
				patternLinkerContainer = request.obj;
				response += "got PLC";
				break;
			default:
				response += "unknown message";
				console.log("unknown message recieved");
				break;
		}
		answer["response"] = response;
		console.log(response);
		return Promise.resolve(answer);
	});

	console.log("Setup complete");

})();

//gets the current domain from the url of the page
function getDomain() {
	let domain = /https?:\/\/(?:www.)?\S{1,30}.com\/|file:\/\/\/\S*.html/i.exec(document.URL)[0];
	return domain;
}


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
	
	let linksToSend = [];

	//loops through nodes -elem add children to list, text check for matches
	while(nextArray.length > 0) {
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
				//add the current node to the array of nodes to check
				linksToSend.push(node.nodeValue);
				break;
		}	//switch
	}	//while

	sendLinksToBG(linksToSend, target);

	function sendLinksToBG(textArr, target) {
		var resultDiv;
		msg = {greeting: "get links", value: textArr, domain: currDomain};

		browser.runtime.sendMessage(msg)
		.then(response => {
			let resultDiv = buildResultDiv();
			let links = response.links; //get from result eventually
			
		    for(let i = 0; i < links.length; i++) {
				let thisDiv = document.createElement("DIV");
				thisDiv.innerHTML = links[i];
				console.log(links[i]);
				//inserts the matched link in the result div
				addToResult(resultDiv, thisDiv);
				
				//puts the div and the link elems into invalid targets so you cant make links from links
				invalidTargets.push(thisDiv);
				invalidTargets.push(thisDiv.childNodes[1]);
			}

			if(resultDiv.childNodes[1].firstChild !== null) { //if any links have been added
				target.parentNode.insertBefore(resultDiv, target.nextSibling); //add result div to dom after target
			}

		}).catch(onError);
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
