export interface MathQuestion {
	a: number;
	b: number;
	op: '+' | '-';
	answer: number;
}

const mathQuestions: MathQuestion[] = [
	{ a: 3, b: 2, op: '+', answer: 5 },
	{ a: 7, b: 1, op: '+', answer: 8 },
	{ a: 6, b: 3, op: '-', answer: 3 },
	{ a: 5, b: 4, op: '+', answer: 9 },
	{ a: 8, b: 2, op: '-', answer: 6 },
	{ a: 4, b: 1, op: '+', answer: 5 },
	{ a: 9, b: 5, op: '-', answer: 4 },
	{ a: 2, b: 2, op: '+', answer: 4 },
	{ a: 7, b: 3, op: '-', answer: 4 },
	{ a: 6, b: 2, op: '+', answer: 8 },
];

export function isAntiBotAnswerCorrect(index: number, answer: string) {
	const question = mathQuestions[index];
	return question !== undefined && answer === question.answer.toString();
}

export default mathQuestions;
