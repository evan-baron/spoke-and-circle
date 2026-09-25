interface RejectionEmail {
	to: string;
	teamName: string;
	reason?: string;
}

export async function sendRejectionEmail({ teamName, reason }: RejectionEmail) {
	console.log(
		`[wireframe] Would send a rejection email for "${teamName}"`,
		reason ? 'with a reason' : 'without a reason',
	);
}
