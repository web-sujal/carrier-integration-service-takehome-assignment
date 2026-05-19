import type { Response } from 'express';

/** JSON body shape for successful responses: always `{ data: ... }`. */
export type ApiSuccessBody<T = unknown> = { data: T };

export function sendData<T>(res: Response, data: T, statusCode = 200): Response {
  return res.status(statusCode).json({ data } satisfies ApiSuccessBody<T>);
}
