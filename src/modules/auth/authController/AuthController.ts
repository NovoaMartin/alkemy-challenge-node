import { Request, Response } from 'express';

export default class AuthController {
  constructor() {}

  /**
   * @openapi
   * /:
   *   get:
   *     description: Welcome to swagger-jsdoc!
   *     responses:
   *       200:
   *         description: Returns a mysterious string.
   */
  private static async login(req: Request, res: Response) : Promise<void> {
    res.send('login');
  }
}
