import { Request, Response } from 'express';
import AuthService from '../authService/AuthService';

export default class AuthController {
  constructor(private authService: AuthService) {}

  async register(req: Request, res: Response) {
    const { username, password, email } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Missing username' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password too short' });
    }
    if (password.length > 255) {
      return res.status(400).json({ error: 'Password too long' });
    }
    if (username.length < 3) {
      return res.status(400).json({ error: 'Username too short' });
    }

    let existingUser;
    try {
      existingUser = await this.authService.getByUsername(username);
    } catch (err) {
      existingUser = null;
    }

    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const user = await this.authService.save({ username, password, email });
    await this.authService.sendWelcomeEmail(user);
    return res.status(201).json({ data: { id: user.id } });
  }
}
