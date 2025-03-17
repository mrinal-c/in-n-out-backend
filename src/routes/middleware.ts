import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
  uid?: string;
}

export function verifyUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer')) {
      throw new Error('No token found');
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { user: { _id: string } };
    req.uid = decoded.user._id;
    next();
  } catch (err) {
    return res.status(401).json({
      message: 'Authentication Failed',
      error: err instanceof Error ? err.message : 'Unknown error'
    });
  }
}