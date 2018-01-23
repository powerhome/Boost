console.log("Content Script Loaded");

//targets not to hit with links
var invalidTargets = [];
var currDomain;
var bottomKey;
var linkKey;

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
	invalidTargets.push(document.body);
	if(currDomain == undefined) {
		currDomain = getDomain();
	}

	//sets up listener to get command press from BG Script
	chrome.runtime.onMessage.addListener(
		function(request, sender, sendResponse) {
		console.log("from bg: " + request.greeting);
		let answer = new Object();
		let response = "response: ";

		switch(request.greeting) {
			case "action clicked":	
				response = getDomain();
				break;
			case "command pressed":
				response += "command pressed recieved";
				linkifyAtMouseover();
				break;
			
			default:
				response += "unknown message";
				break;
		}
		answer["response"] = response;
		console.log(answer);
		sendResponse(answer);
	});

	setupBottomBar();
	setupPreferenceKeys();

	document.onkeypress = handleKeyPress;
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
	let target = getMouseoverElement();
	let nextArray = [target];
	let textToSend = [];

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
				textToSend.push(node.nodeValue);
				break;
		}	//switch
	}	//while

	//sends text to the background and puts results after target
	(function sendTextToBG(textArr, target) {
		var resultDiv;
		msg = {greeting: "get links", value: textArr, domain: currDomain};

		chrome.runtime.sendMessage(msg, function(response) {
			console.log("resp: " + response);
			let resultDiv = buildResultDiv();
			let links = response.links; //get from result eventually
			
		    for(let i = 0; i < links.length; i++) {
				let thisDiv = document.createElement("DIV");
				thisDiv.innerHTML = links[i];
				//inserts the matched link in the result div
				addToResult(resultDiv, thisDiv);
				
				//puts the div and the link elems into invalid targets so you cant make links from links
				invalidTargets.push(thisDiv);
				invalidTargets.push(thisDiv.childNodes[1]);
			}

			if(resultDiv.childNodes[1].firstChild !== null) { //if any links have been added
				target.parentNode.insertBefore(resultDiv, target.nextSibling); //add result div to dom after target
			}

		});
	})(textToSend, target);
	
	//builds the div to hold results and eventually put on screen (if needed)
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

	//appends "elem" to the proper place in  "resultDiv"
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
		return item;
	}
	return null;
}

function setupBottomBar() {

	let bottomBar = document.createElement("DIV");
	let spacingDiv = document.createElement("DIV");
	let body = document.querySelector("Body");

	spacingDiv.id = "spacingDiv";
	bottomBar.id = "bottomBar";

	
	body.appendChild(spacingDiv);
	body.appendChild(bottomBar);


	let frame = document.createElement("IFRAME");
	frame.id = "bottomFrame";
	resizeBottomBar(frame);


	frame.src = chrome.extension.getURL("bottomBar.html");
	bottomBar.appendChild(frame);


	window.addEventListener("resize", resizeThrottler, false);

	var resizeTimeout;
	function resizeThrottler() {
		// ignore resize events as long as an actualResizeHandler execution is in the queue
    	if ( !resizeTimeout ) {
		      	resizeTimeout = setTimeout(function() {
		        resizeTimeout = null;
		        resizeBottomBar(frame, bottomBar);
	     
	       // The actualResizeHandler will execute at a rate of 15fps
	       }, 66);
	    }
	}

}

function resizeBottomBar(frame, bar) {
	let bottomFrame = frame || window.getElementById("bottomFrame");
	let bottomBar = bar || document.getElementById("bottomBar");
	bottomFrame.width = `${bottomBar.clientWidth} + px`;

}

function setupPreferenceKeys() {

	chrome.storage.local.get(["bottomKey","linkKey"], function(result) {
		bottomKey = result.bottomKey;
		linkKey = result.linkKey;

		console.log(bottomKey);
		console.log(linkKey);



	});

}

function handleKeyPress(event) {
	console.log("key pressed event");
	console.log(event.key);
	console.log(event.ctrlKey);
	let key = event.key;
	console.log(bottomKey.key == event.key);

	if(key == bottomKey.key)
		console.log("bottom key match");
		switch(bottomKey.mod) {
			case "Ctrl": 
				if(event.ctrlKey)
				{
					console.log("Event key control key");
					toggleBottomBar();
				}
				break;

			case "Alt":
				if(event.altKey)
				{
					toggleBottomBar();
				}
				break;

			case "Meta":
			if(event.metaKey)
				{
					toggleBottomBar();
				}
				break;
			case "":
			linkifyAtMouseover();
			break;

			default:
				

		}

		if(key == linkKey.key)
		switch(linkKey.mod) {
			case "Ctrl": 
				if(event.ctrlKey)
				{
					linkifyAtMouseover();
				}
				break;

			case "Alt":
				if(event.altKey)
				{
					linkifyAtMouseover();
				}
				break;

			case "Meta":
			if(event.metaKey)
				{
					linkifyAtMouseover();
				}
				break;
			case "":
				linkifyAtMouseover();
				break;
			default:
			

		}


}




function toggleBottomBar() {
	console.log("toggling bottom");
}









