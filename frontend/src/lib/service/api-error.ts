export class ApiError extends Error {
  statusCode: number;
  response: unknown;

  constructor(statusCode: number, message: string, response?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.response = response;
  }
}
