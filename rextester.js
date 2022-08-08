import fetch from "node-fetch";

const body = {
  LanguageChoice: 24,
  Program: `print(${process.argv[process.argv.length - 1]})`,
  Input: "",
  CompilerArgs: "",
  ApiKey: process.env.REXTESTER_API_KEY,
};

const response = await fetch("https://rextester.com/rundotnet/api", {
  method: "post",
  body: JSON.stringify(body),
  headers: { "Content-Type": "application/json" },
});
const data = await response.json();

console.log(`print(${process.argv[process.argv.length - 1]})`);

if (data.Errors) {
  console.log(`Error:\n${data.Errors}`);
} else {
  console.log(`Result:\n${data.Result}`);
}

if (data.Warnings) {
  console.log(data.Warnings);
}

console.log(data.Stats);
