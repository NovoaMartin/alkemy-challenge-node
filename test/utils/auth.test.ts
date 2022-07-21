import { describe } from 'mocha';
import { mockReq, mockRes } from 'sinon-express-mock';
import chai, { expect } from 'chai';
import jwt from 'jsonwebtoken';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';
import { config } from 'dotenv';
import sinon from 'sinon';
import validateToken from '../../src/utils/auth';

config();

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('validateToken middleware test', () => {
  it('should return 401 if token is not provided', () => {
    const req = mockReq();
    const res = mockRes();
    validateToken(req, res, () => {});
    expect(res.status).to.have.been.calledWith(401);
    expect(res.json).to.have.been.calledWith({ error: 'Invalid token' });
  });
  it('should return 401 if token is invalid', () => {
    const req = mockReq({ headers: { authorization: 'Bearer invalid' } });
    const res = mockRes();
    validateToken(req, res, () => {});
    expect(res.status).to.have.been.calledWith(401);
    expect(res.json).to.have.been.calledWith({ error: 'Invalid token' });
  });
  it('should return 401 if token is expired', () => {
    const res = mockRes();
    const token = jwt.sign({ id: '1' }, process.env.JWT_SECRET!, { expiresIn: '-1s' });
    const req = mockReq({ headers: { authorization: `Bearer ${token}` } });
    req.headers.authorization = `Bearer ${token}`;
    validateToken(req, res, () => {});
    expect(res.status).to.have.been.calledWith(401);
    expect(res.json).to.have.been.calledWith({ error: 'Invalid token' });
  });
  it('sets req.userId to payload id', () => {
    const res = mockRes();
    const token = jwt.sign({ id: '1' }, process.env.JWT_SECRET!);
    const req = mockReq({ headers: { authorization: `Bearer ${token}` } });
    req.headers.authorization = `Bearer ${token}`;
    const nextFn = sinon.stub();
    validateToken(req, res, nextFn);
    expect(req.userId).to.equal('1');
    expect(nextFn).to.have.been.calledOnce;
  });
});
