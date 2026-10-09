export type FormStepId = 'generic' | 'profile' | 'structure' | 'additional';

export interface FormStep {
	id: FormStepId;
	label: string;
}

export interface StepValidation {
	errors: string[];
	focused: boolean;
}

type NativeControl = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

export function getFormSteps(groupType: string): FormStep[] {
	return [
		{ id: 'generic', label: 'Generic info' },
		{ id: 'profile', label: 'Group profile' },
		{
			id: 'structure',
			label: groupType === 'Group Ride' ? 'Ride details' : 'Group structure',
		},
		{ id: 'additional', label: 'Tags and media' },
	];
}

function describeControl(control: NativeControl) {
	const label = control.labels?.[0]?.textContent?.replace(/\*/g, '').trim();
	return label ?
			`${label}: ${control.validationMessage}`
		:	control.validationMessage;
}

function validateNative(panel: HTMLElement): StepValidation {
	const controls = Array.from(
		panel.querySelectorAll<NativeControl>('input, select, textarea'),
	).filter((control) => !control.checkValidity());

	const [first] = controls;
	if (!first) return { errors: [], focused: false };

	first.reportValidity();
	return { errors: controls.map(describeControl), focused: true };
}

function validateRequiredChoices(
	form: HTMLFormElement,
	choices: { name: string; message: string }[],
): StepValidation {
	const data = new FormData(form);
	const missing = choices.filter(({ name }) => data.getAll(name).length === 0);

	const [first] = missing;
	if (!first) return { errors: [], focused: false };

	const target = form.querySelector<HTMLElement>(`[name='${first.name}']`);
	const focusable = target && target.offsetParent !== null;
	if (focusable) target.focus();

	return {
		errors: missing.map(({ message }) => message),
		focused: !!focusable,
	};
}

export function validateStep(
	stepId: FormStepId,
	form: HTMLFormElement,
	panel: HTMLElement,
): StepValidation {
	const native = validateNative(panel);
	if (native.errors.length > 0) return native;

	if (stepId === 'profile') {
		return validateRequiredChoices(form, [
			{ name: 'bikeType', message: 'Choose at least one cycling discipline' },
			{ name: 'skillLevel', message: 'Choose at least one skill level' },
		]);
	}

	return native;
}
