console.log("Content Script Loaded");

var domain = /https?:\/\/(?:www.)?\S*.com|file:\/\/\/\S*.html/i.exec(document.URL)[0];
//targets not to hit with links
var invalidTargets = [];

var replaceWithNum = "#placeholder#";
var boostClassName = "boostLink";

var patterns;

(function setupPatterns() {
	patterns = new Object();

	var homePatt = /H#(\d{1,8})/igm;
	var homePatternLinker = new PatternLinker(homePatt, domain + "/homes/" + replaceWithNum, "Home#: ");
	addPattern("home pattern", homePatternLinker);

	var phonePatt = /\(?(\d{3})\)?(?:\s|\-)*(\d{3})\-?(\d{4})/igm;
	var phonePatternLinker = new PatternLinker(phonePatt, domain + "/phones/" + replaceWithNum, "Phone#: ");
	addPattern("phone pattern", phonePatternLinker);

	var projPatt = /(?:^|\b)(3\d\-?\d{5})\b/igm;
	var projPatternLinker = new PatternLinker(projPatt, domain + "/projs/" + replaceWithNum, "Project#: ");
	addPattern("project pattern", projPatternLinker);



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





function onError(error) {
  console.log(`Error: ${error}`);
}

function checkTargetValid(elem)
{
	if(invalidTargets.includes(elem) ){//|| elem.className.includes(boostClassName)){
		console.log("invalid elem: " + elem);
		return false;
	}

	invalidTargets.push(elem);
	return true;


}


//TODO
function linkifyAtMouseover() {

	console.log("Linkify running");

	let target = getMouseoverElement();

	console.log(target);
	var nextArray = [];

	nextArray.push(target);

	console.log(nextArray.length);

	while(nextArray.length > 0)
	{

		let node = nextArray.pop();

		console.log("While loop start: " + node.nodeType);

		if(node.nodeType == Node.ELEMENT_NODE && checkTargetValid(node))
		{
			let children = node.childNodes;

			children.forEach( function(currentChild, currentIndex, children) {
				let type = currentChild.nodeType;
				if(type == Node.ELEMENT_NODE || type == Node.TEXT_NODE)
				{

					nextArray.push(currentChild);
				}

			}, 'thisArg');
	
		}
		else if (node.nodeType == Node.TEXT_NODE && checkTargetValid(node))
		{
			let links = linkifyTextNode(node);

			for(let i = 0; i < links.length; i++) {

				let item = links[i];
				let thisDiv = document.createElement("DIV");

				thisDiv.innerHTML = item;

				//inserts the new div after the current text nodes parent elem
				//right after the element that you mouseovered
				node.parentNode.parentNode.insertBefore(thisDiv, node.parentNode.nextSibling);

				//puts the div and the link elems into invalid targets so you cant make links from links
				invalidTargets.push(thisDiv);
				invalidTargets.push(thisDiv.childNodes[0]);

			}

		}
	}



//	linkifyTarget(target);
	
	
}

function linkifyTextNode(node) {

	console.log("linkifying node maybe");

	if(true) {//checkTargetValid(node)) {

		console.log("target is good");

		let text = node.nodeValue;

		var links = getAllMatches(text);


	
		return links;
	}
	else {
		console.log("Invalid Target");
	}
}


/**
	Takes a element and matches patterns in it
*/
function linkifyTarget(target) {
	if(checkTargetValid(target)) {


		let text = target.textContent;
		
		//var result = homePatt.exec(text);
		//var matches = getAllMatches(text);
		
		//var links = linkifyHomes(matches);

		var links = getAllMatches(text);

		console.log("Links: " + links.length + "\n Adding links to DOM");


		// adds each of the links below the element where they were found
		for(let i = 0; i < links.length; i++)
		{
			let item = links[i];

			let resultDiv = document.createElement("DIV");
			resultDiv.innerHTML = item;

			target.parentNode.insertBefore(resultDiv, target.nextSibling);
		}
	}
	else {
		console.log("Invalid Target");
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
finds matches for all the patterns and returns them in one array
*/
function getAllMatches(text) {
	console.log("Getting matches from text and making links");
	var	matches = [];
	//accumulate all the matches
	var results = [];

	console.log("matching patterns");
	for(patt in patterns) {
		let thisPatt = patterns[patt];
		//gets all the matches for the pattern in the text

		matches = getMatchesFromText(text, thisPatt.pattern);

		// for every match, replace the placeholder with the actual number
		for(let i = 0; i < matches.length; i++)
		{
			
			//replace REPLACE WITH NUM in link for patt with num from matches
			let res = thisPatt.link.replace(replaceWithNum, matches[i]);

			res = linkify(res, thisPatt.linkText + matches[i]);

			results.push(res);
		}

	}

	console.log("matches made: " + results.length);
	return results;
}

/*
	gets all the matches for pattern from text
	returns the first capture group from the matches
*/
function getMatchesFromText(text, pattern) {

	let resultArray;
	let results = [];

	//finds all the  matches in the text
	while ((resultArray = pattern.exec(text)) !== null) {
		if(resultArray !== null) {
		  var msg = "Found " + resultArray[0] + ".  ";
		  msg += "Next match starts at " + pattern.lastIndex;

		  result = "";

		  for(let i = 1; typeof resultArray[i] !== 'undefined'; i++)
		  {

			result += resultArray[i];

		  }
		  results.push(result);
	
		  //console.log(msg);
		}
		else {
			console.log("no matches");
		}

	}


	return results;

}



/*
	takes a string and wraps it in a link tag
*/
function linkify(linkAddress, linkText){

	result = "<a target=\"_blank\" class=\"" + boostClassName + "\" href =\"" + linkAddress + "\">" + linkText + "</a>";

	return result;
}






