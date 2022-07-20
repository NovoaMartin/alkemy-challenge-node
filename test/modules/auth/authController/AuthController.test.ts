import { describe } from 'mocha';
import sinon, { SinonSandbox, SinonStubbedInstance } from 'sinon';
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';
import { config } from 'dotenv';
import { mockReq, mockRes } from 'sinon-express-mock';
import AuthService from '../../../../src/modules/auth/authService/AuthService';
import AuthController from '../../../../src/modules/auth/authController/AuthController';
import User from '../../../../src/modules/auth/authEntity/User';
import UserNotFoundException from '../../../../src/modules/auth/exception/UserNotFoundException';

config();

chai.use(sinonChai);
chai.use(chaiAsPromised);

describe('AuthController tests', () => {
  let authController: AuthController;
  let authService: SinonStubbedInstance<AuthService>;
  let sandbox: SinonSandbox;
  beforeEach(async () => {
    sandbox = sinon.createSandbox();
    authService = sandbox.createStubInstance(AuthService);
    authController = new AuthController(authService);
  });
  afterEach(() => {
    sandbox.restore();
  });

  describe('register test', () => {
    describe('filters out invalid fields', async () => {
      it('filters missing username', async () => {
        const req = mockReq({ body: { username: '', password: 'password', email: 'asd@asd.asd' } });
        const res = mockRes();
        await (authController.register(req, res));
        expect(res.status).to.have.been.calledOnceWith(400);
        expect(res.json).to.have.been.calledOnceWith({ error: 'Missing username' });
      });
      it('filters missing password', async () => {
        const req = mockReq({ body: { username: 'username', password: '', email: 'asd@asd.asd' } });
        const res = mockRes();
        await (authController.register(req, res));
        expect(res.status).to.have.been.calledOnceWith(400);
        expect(res.json).to.have.been.calledOnceWith({ error: 'Missing password' });
      });
      it('filters missing email', async () => {
        const req = mockReq({ body: { username: 'username', password: 'password', email: '' } });
        const res = mockRes();
        await (authController.register(req, res));
        expect(res.status).to.have.been.calledOnceWith(400);
        expect(res.json).to.have.been.calledOnceWith({ error: 'Missing email' });
      });
      it('filters invalid email', async () => {
        const req = mockReq({ body: { username: 'username', password: 'password', email: 'asd' } });
        const res = mockRes();
        await (authController.register(req, res));
        expect(res.status).to.have.been.calledOnceWith(400);
        expect(res.json).to.have.been.calledOnceWith({ error: 'Invalid email' });
      });
      it('filters short password', async () => {
        const req = mockReq({ body: { username: 'username', password: 'pass', email: 'asd@asd.asd' } });
        const res = mockRes();
        await (authController.register(req, res));
        expect(res.status).to.have.been.calledOnceWith(400);
        expect(res.json).to.have.been.calledOnceWith({ error: 'Password too short' });
      });
      it('filters long password', async () => {
        const req = mockReq({ body: { username: 'username', password: 'password'.repeat(100), email: 'asd@asd.asd' } });
        const res = mockRes();
        await (authController.register(req, res));
        expect(res.status).to.have.been.calledOnceWith(400);
        expect(res.json).to.have.been.calledOnceWith({ error: 'Password too long' });
      });
      it('filters short username', async () => {
        const req = mockReq({ body: { username: 'us', password: 'password', email: 'asd@asd.asd' } });
        const res = mockRes();
        await (authController.register(req, res));
        expect(res.status).to.have.been.calledOnceWith(400);
        expect(res.json).to.have.been.calledOnceWith({ error: 'Username too short' });
      });
    });
    it('calls authService correctly', async () => {
      const req = mockReq({ body: { username: 'username', password: 'password', email: 'asd@asd.asd' } });
      const res = mockRes();
      const userData = new User('1', 'username', 'password', 'asd@asd.asd', new Date(), new Date());

      authService.save.resolves(userData);
      authService.getByUsername.callsFake(async () => { throw new UserNotFoundException(); });

      await (authController.register(req, res));

      expect(authService.getByUsername).to.have.been.calledOnceWith('username');
      expect(authService.save).to.have.been.calledOnceWith({
        username: 'username',
        password: 'password',
        email: 'asd@asd.asd',
      });
      expect(authService.sendWelcomeEmail).to.have.been.calledOnceWith(userData);
    });
    it('responds with error if username exists', async () => {
      const req = mockReq({ body: { username: 'username', password: 'password', email: 'asd@asd.asd' } });
      const res = mockRes();

      authService.getByUsername.resolves(new User('1,', 'username', 'password', 'test@test.test', new Date(), new Date()));

      await authController.register(req, res);

      expect(res.status).to.have.been.calledOnceWithExactly(400);
      expect(res.json).to.have.been.calledOnceWithExactly({
        error: 'Username already exists',
      });
    });
    it('responds with the generated id if successful', async () => {
      const req = mockReq({ body: { username: 'username', password: 'password', email: 'asd@asd.asd' } });
      const res = mockRes();

      const userData = new User('1', 'username', 'password', 'asd@asd.asd', new Date(), new Date());
      authService.save.resolves(userData);
      authService.getByUsername.callsFake(() => { throw new UserNotFoundException(); });

      await authController.register(req, res);

      expect(res.status).to.have.been.calledOnceWithExactly(201);
      expect(res.json).to.have.been.calledOnceWithExactly({ data: { id: '1' } });
    });
  });
});
