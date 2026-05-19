/** Nested error payload returned as `{ error: ... }`; optional fields for validation / codes. */
export type ApiErrorBody = {
  message: string;
  code?: string;
  details?: unknown;
};

/** JSON body shape written by `error.middleware.ts`. */
export type ApiErrorResponse = { error: ApiErrorBody };

export class ApiError extends Error {
  readonly statusCode: number;
  readonly code?: string;
  readonly details?: unknown;

  /** @param statusCode Prefer {@link ./constants.StatusCodes `StatusCodes`} over raw numbers. */
  constructor(
    statusCode: number,
    message: string,
    options?: { code?: string; details?: unknown }
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = options?.code;
    this.details = options?.details;
  }
}
