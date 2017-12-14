console.log("hello this is a new test!");


// TODO document.URL 	Returns the complete URL of the document 


var homePatt = /H#\d{1,8}/;
var testPatt = /Content/i;

console.log(homePatt.exec("H#100H#3182371234323423"));


browser.runtime.onMessage.addListener(request => {
	console.log("listener code running:");
	
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

	console.log("from bg: " + request.greeting);
	return Promise.resolve({answer: response});
});





function onError(error) {
  console.log(`Error: ${error}`);
}

function getMouseoverElement() {
	var items = document.querySelectorAll( ":hover" );
		
	if(items.length > 0) {

		console.log("item at mouseover: ");
		console.log(items[items.length - 1]);
		return items[items.length - 1];
	}

	return null;

}


function changeTitle() {
	var title = document.getElementById("ctitle");

	if(title !== null) {
		if( title.innerHTML.includes("This was a triumph!"))
		{
			title.innerHTML = title.innerHTML + "!";
		}
		else
		{
			title.innerHTML = "<a href=\"http://www.google.com\">This was a triumph!</a>";
		}
	}
	else {
		console.log("title ctitle not found");
	}
}




function testFunction() {
	console.log("test function executed");
	changeTitle();
	
}

//TODO
function linkifyAtMouseover() {

	console.log("Linkify running");

	let target = getMouseoverElement();


	let text = target.textContent;

	console.log(text);
	if( testPatt.test(text))
	{
		console.log("text matches at mouse over");
	}
	else
	{
		console.log("no match at mouse over");
	}
	
}


/*
adds predefined span with "TEST" text before mouseover element
*/
function addTextAtMouse() {
	console.log("add text at mouse running");

	var resultLink = document.createElement("SPAN");
	resultLink.appendChild(document.createTextNode("TEST"));
	console.log(resultLink);

	let target = getMouseoverElement();

	target.insertBefore(resultLink, target.firstChild);
	console.log($("#ctitle").text());
	
	
}


