import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { MailService } from '@sendgrid/mail';
import User from '../authEntity/User';
import AuthRepository from '../authRepository/AuthRepository';
import UserNotFoundException from '../exception/UserNotFoundException';
import IncorrectPasswordException from '../exception/IncorrectPasswordException';

export default class AuthService {
  constructor(
    private authRepository: AuthRepository,
    private encryptionService: typeof bcrypt,
    private mailService: MailService,
  ) {}

  async getByUsername(username: string): Promise<User> {
    return this.authRepository.getByUsername(username);
  }

  async save(userData: Partial<User> & { password: string }): Promise<User> {
    // eslint-disable-next-line no-param-reassign
    userData.password = await this.hashPassword(userData.password);
    return this.authRepository.save(userData);
  }

  async signIn(username: string, password: string): Promise<string> {
    const user = await this.getByUsername(username);
    if (!user) {
      throw new UserNotFoundException();
    }
    if (!await this.encryptionService.compare(password, user.password)) {
      throw new IncorrectPasswordException();
    }
    return jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: '6h' });
  }

  private async hashPassword(password: string): Promise<string> {
    return this.encryptionService.hash(password, 10);
  }

  async sendWelcomeEmail(user: User) {
    const msg = {
      to: user.email,
      from: process.env.SENDER_EMAIL!,
      subject: `Welcome ${user.username} to disney world api`,
      html: `
        <strong>Welcome ${user.username}</strong>\n 
        <p>You have succesfully registered to the disney world api</p>\n
        <p>This is a challenge for alkemy node.js acceleration</p>
        \n\n<p>You signed up at: ${user.createdAt}</p>
        `,
    };
    return this.sendEmail(msg);
  }

  private async sendEmail(msg: { to: string, from: string, subject: string, html: string }) {
    return this.mailService.send(msg);
  }
}
