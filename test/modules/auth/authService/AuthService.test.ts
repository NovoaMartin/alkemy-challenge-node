import { describe } from 'mocha';
import sinon, { SinonSandbox, SinonStubbedInstance } from 'sinon';
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';
import bcrypt from 'bcrypt';
import AuthRepository from '../../../../src/modules/auth/authRepository/AuthRepository';
import AuthService from '../../../../src/modules/auth/authService/AuthService';
import UserNotFoundException from '../../../../src/modules/auth/exception/UserNotFoundException';
import User from '../../../../src/modules/auth/authEntity/User';

chai.use(sinonChai);
chai.use(chaiAsPromised);

describe('AuthService tests', () => {
  let authService: AuthService;
  let authRepository: SinonStubbedInstance<AuthRepository>;
  let sandbox: SinonSandbox;

  beforeEach(async () => {
    sandbox = sinon.createSandbox();
    authRepository = sandbox.createStubInstance(AuthRepository);
    authService = new AuthService(authRepository);
  });
  afterEach(() => {
    sandbox.restore();
  });

  describe('getByUsername test', () => {
    it('throws exception if no user is found', async () => {
      authRepository.getByUsername.callsFake(() => { throw new UserNotFoundException(); });
      expect(authService.getByUsername('username')).to.be.rejectedWith(UserNotFoundException);
    });
    it('calls repository getByUsername method correctly', async () => {
      await authService.getByUsername('username');
      expect(authRepository.getByUsername).to.have.been.calledOnceWith('username');
    });
    it('returns user if user is found', async () => {
      const userData: User = new User('id', 'username', 'password', 'asd', new Date(), new Date());
      authRepository.getByUsername.resolves(userData);
      const user = await authService.getByUsername('username');
      expect(user).to.deep.equal(userData);
    });
  });

  describe('save test', () => {
    it('calls repository save method correctly', () => {
      const userData: User = new User('id', 'username', 'password', 'asd', new Date(), new Date());
      authService.save(userData);
      expect(authRepository.save).to.have.been.calledOnceWith(userData);
      expect(bcrypt.compareSync('password', userData.password)).to.be.true;
    });
    it('returns user if user is saved', async () => {
      const userData: User = new User('id', 'username', 'password', 'asd', new Date(), new Date());
      authRepository.save.resolves(userData);
      const result = await authService.save(userData);
      expect(result).to.deep.equal(userData);
    });
  });
});
