export class ApiError extends Error {
	status: number;
	responseData: unknown;

	constructor(message: string, status: number, responseData: unknown) {
		super(message);
		this.name = 'ApiError';
		this.status = status;
		this.responseData = responseData;
	}
}
