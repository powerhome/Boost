console.log("hello this is a new test");


// function onGot(tabInfo) {
//   console.log(tabInfo);
// }

// function onError(error) {
//   console.log(`Error: ${error}`);
// }


// var gettingCurrent = browser.tabs.getCurrent();
// gettingCurrent.then(onGot, onError);


function testFunction(message) {


	console.log("test function executed");


	console.log(document.getElementById("ctitle").innerHTML);
};

browser.runtime.onMessage.addListener(request => {
  console.log("Message from the background script:");
 // console.log(request.greeting);
  return Promise.resolve({response: "Hi from content script"});
});
// function handler(message) {
// 	console.log("test");
// }