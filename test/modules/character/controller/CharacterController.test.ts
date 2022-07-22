import { describe } from 'mocha';
import sinon, { SinonSandbox, SinonStubbedInstance } from 'sinon';
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';
import { config } from 'dotenv';
import { mockReq, mockRes } from 'sinon-express-mock';
import multer from 'multer';
import CharacterService from '../../../../src/modules/character/service/CharacterService';
import CharacterController from '../../../../src/modules/character/controller/CharacterController';
import Character from '../../../../src/modules/character/entity/Character';
import CharacterNotFoundException from '../../../../src/modules/character/exception/CharacterNotFoundException';
import CharacterListDTO from '../../../../src/modules/character/entity/CharacterListDTO';
import InvalidFilmGivenException from '../../../../src/modules/character/exception/InvalidFilmGivenException';

config();

chai.use(sinonChai);
chai.use(chaiAsPromised);

describe('CharacterController tests', () => {
  let characterController: CharacterController;
  let characterService: SinonStubbedInstance<CharacterService>;
  let sandbox: SinonSandbox;
  beforeEach(async () => {
    sandbox = sinon.createSandbox();
    characterService = sandbox.createStubInstance(CharacterService);
    characterController = new CharacterController(characterService, multer());
  });
  afterEach(() => {
    sandbox.restore();
  });

  describe('getById', () => {
    it('calls service with correct parameters', async () => {
      const req = mockReq({ params: { id: '1' } });
      const res = mockRes();
      characterService.getById.resolves(new Character('1', 'name', 'image', 'story'));
      await characterController.getById(req, res);
      expect(characterService.getById).to.have.been.calledWith('1');
    });
    it('responds with found character', async () => {
      const req = mockReq({ params: { id: '1' } });
      const res = mockRes();
      characterService.getById.resolves(new Character('1', 'name', 'image', 'story'));
      await characterController.getById(req, res);
      expect(res.json).to.have.been.calledWith(new Character('1', 'name', 'image', 'story'));
      expect(res.status).to.have.been.calledWith(200);
    });
    it('responds with error if no character is found', async () => {
      const req = mockReq({ params: { id: '1' } });
      const res = mockRes();
      characterService.getById.callsFake(async () => { throw new CharacterNotFoundException(); });
      await characterController.getById(req, res);
      expect(res.json).to.have.been.calledWith({ error: 'Character not found' });
      expect(res.status).to.have.been.calledWith(404);
    });
  });
  describe('search', () => {
    it('calls service with correct parameters', async () => {
      const req = mockReq({ query: { name: 'name' } });
      const res = mockRes();
      characterService.getAll.resolves([]);
      await characterController.search(req, res);
      expect(characterService.getAll).to.have.been.calledOnceWithExactly({
        name: 'name',
        age: undefined,
        weight: undefined,
        filmName: undefined,
      });
    });
    it('responds with found characters', async () => {
      const req = mockReq({ query: { name: 'name' } });
      const res = mockRes();
      const expectedReturn = [new CharacterListDTO('1', 'name', 'image'), new CharacterListDTO('2', 'name', 'image')];
      characterService.getAll.resolves(expectedReturn);
      await characterController.search(req, res);
      expect(res.json).to.have.been.calledWith({ data: expectedReturn });
      expect(res.status).to.have.been.calledWith(200);
    });
  });
  describe('create', () => {
    describe('filters invalid fields', () => {
      it('filters missing name', async () => {
        const req = mockReq({ body: { image: 'image', story: 'story' } });
        const res = mockRes();
        await characterController.create(req, res);
        expect(res.json).to.have.been.calledWith({ error: 'Invalid parameters' });
        expect(res.status).to.have.been.calledWith(400);
      });
      it('filters missing story', async () => {
        const req = mockReq({ body: { name: 'name' } });
        const res = mockRes();
        await characterController.create(req, res);
        expect(res.json).to.have.been.calledWith({ error: 'Invalid parameters' });
        expect(res.status).to.have.been.calledWith(400);
      });
    });
    it('calls service with correct parameters', async () => {
      const req = mockReq({ body: { name: 'name', story: 'story', filmIds: ['1', '2'] } });
      const res = mockRes();
      characterService.save.resolves(new Character('1', 'name', 'image', 'story'));
      await characterController.create(req, res);
      expect(characterService.save).to.have.been.calledOnceWithExactly({
        name: 'name',
        story: 'story',
        age: undefined,
        weight: undefined,
        image: 'default.png',
      }, ['1', '2']);
    });
    it('responds with created character', async () => {
      const req = mockReq({ body: { name: 'name', story: 'story' } });
      const res = mockRes();
      characterService.save.resolves(new Character('1', 'name', 'image', 'story'));
      await characterController.create(req, res);
      expect(res.json).to.have.been.calledWith(new Character('1', 'name', 'image', 'story'));
      expect(res.status).to.have.been.calledWith(201);
    });
    it('responds with error when given invalid film id', async () => {
      const req = mockReq({ body: { name: 'name', story: 'story', filmIds: ['1', '2', '3'] } });
      const res = mockRes();
      characterService.save.callsFake(async () => { throw new InvalidFilmGivenException(); });
      await characterController.create(req, res);
      expect(res.json).to.have.been.calledWith({ error: 'Invalid film id' });
      expect(res.status).to.have.been.calledWith(400);
    });
  });
  describe('update', () => {
    it('calls service with correct parameters', async () => {
      const req = mockReq({ params: { id: '1' }, body: { name: 'newName', filmIds: ['1', '2'] } });
      const res = mockRes();
      const characterData = new Character('1', 'name', 'default.png', 'story', undefined, undefined, undefined, undefined);
      characterService.getById.resolves(characterData);
      await characterController.update(req, res);
      expect(characterService.getById).to.have.been.calledOnceWithExactly('1');
      expect(characterService.save).to.have.been.calledOnceWithExactly({
        id: '1',
        name: 'newName',
        story: 'story',
        age: undefined,
        weight: undefined,
        image: 'default.png',
      }, ['1', '2']);
    });
    it('responds with updated character', async () => {
      const req = mockReq({ params: { id: '1' }, body: { name: 'newName', filmIds: ['1', '2'] } });
      const res = mockRes();
      const characterData = new Character('1', 'name', 'image', 'story');
      characterService.getById.resolves(characterData);
      characterService.save.resolves(new Character('1', 'newName', 'image', 'story'));
      await characterController.update(req, res);
      expect(res.json).to.have.been.calledWith(new Character('1', 'newName', 'image', 'story'));
      expect(res.status).to.have.been.calledWith(200);
    });
    it('responds with error if no character is found', async () => {
      const req = mockReq({ params: { id: '1' }, body: { name: 'newName', filmIds: ['1', '2'] } });
      const res = mockRes();
      characterService.getById.callsFake(async () => { throw new CharacterNotFoundException(); });
      await characterController.update(req, res);
      expect(res.json).to.have.been.calledWith({ error: 'Character not found' });
      expect(res.status).to.have.been.calledWith(404);
    });
    it('responds with error if invalid film id is given', async () => {
      const req = mockReq({ params: { id: '1' }, body: { name: 'newName', filmIds: ['1', '2', '3'] } });
      const res = mockRes();
      const characterData = new Character('1', 'name', 'image', 'story');
      characterService.getById.resolves(characterData);
      characterService.save.callsFake(async () => { throw new InvalidFilmGivenException(); });
      await characterController.update(req, res);
      expect(res.json).to.have.been.calledWith({ error: 'Invalid film id' });
      expect(res.status).to.have.been.calledWith(400);
    });
  });
  describe('delete', () => {
    it('calls service with correct parameters', async () => {
      const req = mockReq({ params: { id: '1' } });
      const res = mockRes();
      characterService.delete.resolves(undefined);
      await characterController.delete(req, res);
      expect(characterService.delete).to.have.been.calledOnceWithExactly('1');
    });
    it('responds with 204 after successful deletion', async () => {
      const req = mockReq({ params: { id: '1' } });
      const res = mockRes();
      characterService.delete.resolves(1);
      await characterController.delete(req, res);
      expect(res.status).to.have.been.calledWith(204);
    });
    it('responds with error if no character is found', async () => {
      const req = mockReq({ params: { id: '1' } });
      const res = mockRes();
      characterService.delete.callsFake(async () => { throw new CharacterNotFoundException(); });
      await characterController.delete(req, res);
      expect(res.json).to.have.been.calledWith({ error: 'Character not found' });
      expect(res.status).to.have.been.calledWith(404);
    });
  });
});
