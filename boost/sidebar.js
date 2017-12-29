//document.getElementById("smart_search").style


console.log("test");

window.onload = () =>  {

	let form = document.getElementById('smart_search')
	form.onsubmit = e => {

		console.log("form submitted");
		formSubmitted(e.target);

		return false;
	}



};



function formSubmitted(form)
{
	console.log("processing " + form.name);
	console.log(form.childNodes[1].value);

}