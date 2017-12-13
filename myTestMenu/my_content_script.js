console.log("hello this is a new test!");


// function onGot(tabInfo) {
//   console.log(tabInfo);
// }

// function onError(error) {
//   console.log(`Error: ${error}`);
// }


// var gettingCurrent = browser.tabs.getCurrent();
// gettingCurrent.then(onGot, onError);

let title = document.getElementById("ctitle");


function testFunction() {


	console.log("test function executed");


	//if() 
//<


	if( title.innerHTML.includes("This was a triumph!"))
	{
		title.innerHTML = title.innerHTML + "!";
	}
	else
	{
		title.innerHTML = "<a href=\"http://www.google.com\">This was a triumph!</a>";
	}


};

browser.runtime.onMessage.addListener(request => {

	doSomething();

	testFunction();

  	console.log("Message from the background script:");
	console.log(request.greeting);
  return Promise.resolve({answer: "Hi from content script"});
});


function doSomething() {

	let items = document.querySelectorAll( ":hover" );

	console.log(items[items.length - 1]);
	console.log("doing something");


	
}