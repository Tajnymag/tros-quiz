const fs = require('fs');
const exec = require('child_process').exec;
const questionsFile = require('./static/otazky.json');

const OUTPUT_FILE = __dirname + '/static/otazky.json';
const args = process.argv.splice(2);

function indexOfQuestion(text, answer, questions = questionsFile) {
	return questions.findIndex(q => q.text === text);
}

function addQuestion(text, answer, questions = questionsFile) {
	const foundIndex = indexOfQuestion(text, answer, questions);

	if (foundIndex >= 0) {
		questions[foundIndex].answer = answer;
	} else {
		questions.push({
			text,
			answer
		});
	}
}

function saveQuestions(questions) {
	fs.writeFileSync(OUTPUT_FILE, JSON.stringify(questions));
}

function toBoolean(value) {
	return String(value).toLowerCase() === 'true';
}

function reformat() {
	exec('yarn run format:data');
}

if (args[0] === 'add') {
	addQuestion(args[1], toBoolean(args[2]));
	saveQuestions(questionsFile);
	reformat();
} else {
	console.error('Zadejte příkaz!');
}