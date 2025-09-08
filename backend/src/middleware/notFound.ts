import { Request, Response, NextFunction } from 'express';

const notFound = (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    message: `Not Found - ${req.originalUrl}`,
  });
};

export default notFound;
