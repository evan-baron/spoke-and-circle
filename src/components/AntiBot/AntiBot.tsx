'use client';

import { useEffect, useId, useState } from 'react';
import mathQuestions, {
	isAntiBotAnswerCorrect,
} from '@/lib/data/mathQuestions';
import styles from './antiBot.module.scss';

interface AntiBotProps {
	onValidChange: (valid: boolean) => void;
}

export function AntiBot({ onValidChange }: AntiBotProps) {
	const [questionIndex, setQuestionIndex] = useState<number | null>(null);
	const [answer, setAnswer] = useState('');
	const [touched, setTouched] = useState(false);
	const inputId = useId();
	const errorId = `${inputId}-error`;

	useEffect(() => {
		setQuestionIndex(Math.floor(Math.random() * mathQuestions.length));
	}, []);

	const isValid =
		questionIndex !== null && isAntiBotAnswerCorrect(questionIndex, answer);

	useEffect(() => {
		onValidChange(isValid);
	}, [isValid, onValidChange]);

	const question =
		questionIndex === null ? undefined : mathQuestions[questionIndex];

	if (questionIndex === null || !question) {
		return <p className={styles.loading}>Loading question&hellip;</p>;
	}

	const showRequired = touched && answer === '';
	const showWrong = touched && answer !== '' && !isValid;
	const showError = showRequired || showWrong;

	return (
		<div className={styles.root}>
			<label htmlFor={inputId} className={styles.label}>
				What is {question.a} {question.op} {question.b}?{' '}
				<span className={styles.required} aria-hidden='true'>
					*
				</span>
			</label>
			<input
				id={inputId}
				name='antibot'
				type='text'
				inputMode='numeric'
				pattern='[0-9]*'
				maxLength={1}
				autoComplete='off'
				required
				value={answer}
				className={styles.input}
				aria-invalid={showError}
				aria-describedby={showError ? errorId : undefined}
				onChange={(event) =>
					setAnswer(event.target.value.replace(/[^0-9]/g, ''))
				}
				onBlur={() => setTouched(true)}
			/>
			<input type='hidden' name='antibotIndex' value={questionIndex} />
			{showError && (
				<span id={errorId} className={styles.error} role='alert'>
					{showRequired ? 'This field is required' : 'That answer isn’t right'}
				</span>
			)}
		</div>
	);
}
