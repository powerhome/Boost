console.log("hello this is a new test!");

var homePatt = /H#\d{1,8}/;


//console.log(homePattern.test("H#100"));




function onError(error) {
  console.log(`Error: ${error}`);
}


let title = document.getElementById("ctitle");


function testFunction() {
	console.log("test function executed");

	if(title != null) {
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

function doSomething() {

	let items = document.querySelectorAll( ":hover" );
	if(items.length > 0) {
		console.log(items[items.length - 1]);
	}

	console.log("doing something");
}

browser.runtime.onMessage.addListener(request => {

	// doSomething();
	// testFunction();

  	console.log("Message from the background script:");
	console.log(request.greeting);
  return Promise.resolve({answer: "Hi from content script"});
});


