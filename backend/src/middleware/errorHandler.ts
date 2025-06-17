import { Request, Response, NextFunction } from 'express';

// Define a type for errors that may have a statusCode property
interface ErrorWithStatusCode extends Error {
  statusCode?: number;
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Check if error has statusCode property
  const typedError = err as ErrorWithStatusCode;
  
  if (typedError.statusCode) {
    return res.status(typedError.statusCode).json({
      status: 'error',
      message: typedError.message,
    });
  }

  console.error(err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
};