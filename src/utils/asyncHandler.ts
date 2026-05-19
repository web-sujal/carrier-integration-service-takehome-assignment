import { Request, Response, NextFunction } from 'express';

export type RequestHandler = (req: Request, res: Response) => void | Promise<void>;

export function asyncHandler(requestHandler: RequestHandler) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await requestHandler(req, res);
    } catch (err) {
      next(err);
    }
  };
}
