'use strict';
const evaluate = require("./features").evaluate;
let inputData = '';

process.stdin.on('data', chunk => inputData += chunk);
process.stdin.on('end', (chunk) => {
	const data = JSON.parse(inputData);
	evaluate({ url : data.url, browser: data.browser.short })
	.then(results => console.log(JSON.stringify(results)))
	.catch(error => console.log(JSON.stringify( [{elementCollection: [], syntaxErrors: [error]}] )));
});