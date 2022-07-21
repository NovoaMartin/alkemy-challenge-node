import { describe } from 'mocha';
import { Sequelize } from 'sequelize-typescript';
import sinon, { SinonSandbox } from 'sinon';
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import AuthRepository from '../../../../src/modules/auth/authRepository/AuthRepository';
import UserModel from '../../../../src/models/UserModel';
import UserNotFoundException from '../../../../src/modules/auth/exception/UserNotFoundException';
import User from '../../../../src/modules/auth/authEntity/User';

chai.use(chaiAsPromised);

describe('AuthRepository', () => {
  let authRepository: AuthRepository;
  let sandbox: SinonSandbox;

  beforeEach(async () => {
    sandbox = sinon.createSandbox();
    const sequelizeInstance = new Sequelize('sqlite::memory:');
    sequelizeInstance.addModels([UserModel]);
    await sequelizeInstance.sync({ force: true });
    authRepository = new AuthRepository(UserModel);
  });
  afterEach(() => {
    sandbox.restore();
  });

  describe('getByUsername', () => {
    it('throws exception if no user is found', async () => {
      sandbox.stub(UserModel, 'findOne').resolves(null);
      expect(authRepository.getByUsername('username')).to.be.rejectedWith(UserNotFoundException);
    });
    it('returns user if user is found', async () => {
      const userData: Partial<User> = new User('id', 'username', 'password', 'asd@asd.asd', new Date(), new Date());
      const userModel = UserModel.build(userData, { isNewRecord: true });
      sandbox.stub(UserModel, 'findOne').resolves(userModel);
      const user = await authRepository.getByUsername('username');
      expect(user).to.deep.equal(userData);
    });
  });

  describe('save', () => {
    it('creates new user if user is new', async () => {
      await authRepository.save(new User('', 'username', 'password', 'asd', new Date(), new Date()));
      const user = await UserModel.findOne({ where: { username: 'username' } });
      expect(user).to.have.property('id').to.not.be.null;
    });
    it('updates user if user is not new', async () => {
      const userData: Partial<User> = new User('id', 'username', 'password', 'a', new Date(), new Date());
      const userModel = UserModel.build(userData, { isNewRecord: true });
      await userModel.save();
      await authRepository.save(new User('id', 'username', 'password', 'nuevo', new Date(), new Date()));
      const user = await UserModel.findOne({ where: { username: 'username' } });
      expect(user).to.not.be.null;
      expect(user).to.have.property('email').to.be.equal('nuevo');
    });
  });
});
