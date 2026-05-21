import { Request, Response, NextFunction } from "express";

import { ApiError, ApiErrorBody } from "../utils/apiError.js";
import { StatusCodes } from "../utils/constants.js";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  console.error(err);

  if (!(err instanceof ApiError)) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: { message: "Internal server error" } satisfies ApiErrorBody,
    });
    return;
  }

  const errorBody: ApiErrorBody = { message: err.message };
  if (err.code) errorBody.code = err.code;
  if (err.details !== undefined) errorBody.details = err.details;

  res.status(err.statusCode).json({ error: errorBody });
}
