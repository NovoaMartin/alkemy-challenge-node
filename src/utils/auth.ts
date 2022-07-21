import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export default function validateToken(req: Request, res: Response, next: NextFunction) {
  try {
    let token = req.headers.authorization || '';
    if (token.startsWith('Bearer ')) {
      token = token.slice(7, token.length);
    }
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    req.userId = payload.id;
    return next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
