import fetch from 'node-fetch';

const body = {
    LanguageChoice: 24,
    Program: "1+1",
    Input: "",
    CompilerArgs: "",
};

const response = await fetch('https://rextester.com/rundotnet/api', {
	method: 'post',
	body: JSON.stringify(body),
	headers: {'Content-Type': 'application/json'}
});
const data = await response.json();

console.log(data);