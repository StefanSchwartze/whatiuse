import { evaluate } from "./features";

let inputData = '';

process.stdin.on('data', chunk => inputData += chunk);
process.stdin.on('end', (chunk) => {

	const data = JSON.parse(inputData);

	//evaluate({ url : url, browser: browser.short })
	
	//const resss = resultArray.sort((a,b) => b.cost - a.cost).map(el => getResult(el));
	//console.log(resultArray.sort((a,b) => b.cost - a.cost));

	console.log(JSON.stringify(['hi', 'hihi']));
});