import { describe } from 'mocha';
import sinon, { SinonSandbox, SinonStubbedInstance } from 'sinon';
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';
import { config } from 'dotenv';
import { mockReq, mockRes } from 'sinon-express-mock';
import multer from 'multer';
import GenreService from '../../../../src/modules/genre/service/GenreService';
import GenreController from '../../../../src/modules/genre/controller/GenreController';
import GenreNotFoundException from '../../../../src/modules/genre/exception/GenreNotFoundException';
import Genre from '../../../../src/modules/genre/entity/Genre';

config();

chai.use(sinonChai);
chai.use(chaiAsPromised);

describe('GenreController', () => {
  let sandbox: SinonSandbox;
  let genreService: SinonStubbedInstance<GenreService>;
  let genreController: GenreController;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    genreService = sandbox.createStubInstance(GenreService);
    genreController = new GenreController(genreService, multer());
  });
  afterEach(() => {
    sandbox.restore();
  });

  describe('getById', () => {
    it('Calls service with correct parameters', async () => {
      const req = mockReq({
        params: {
          id: '1',
        },
      });
      const res = mockRes();

      await genreController.getById(req, res);
      expect(genreService.getById).to.have.been.calledOnceWithExactly('1');
    });
    it('Responds with error if no genre is found', async () => {
      const req = mockReq({
        params: {
          id: '1',
        },
      });
      const res = mockRes();
      genreService.getById.rejects(new GenreNotFoundException('Genre not found'));
      await genreController.getById(req, res);
      expect(res.status).to.have.been.calledWith(404);
      expect(res.json).to.have.been.calledWith({ error: 'Genre not found' });
    });
    it('Responds with the found genre', async () => {
      const req = mockReq({
        params: {
          id: '1',
        },
      });
      const res = mockRes();
      const genre = new Genre('1', 'genre', 'image');
      genreService.getById.resolves(genre);
      await genreController.getById(req, res);
      expect(res.status).to.have.been.calledWith(200);
      expect(res.json).to.have.been.calledWith({ data: genre });
    });
  });
  describe('getAll', () => {
    it('Calls service with correct parameters', async () => {
      const req = mockReq();
      const res = mockRes();
      await genreController.getAll(req, res);
      expect(genreService.getAll).to.have.been.calledOnceWithExactly();
    });
    it('Responds with empty array if no genres are found', async () => {
      const req = mockReq();
      const res = mockRes();
      genreService.getAll.resolves([]);
      await genreController.getAll(req, res);
      expect(res.status).to.have.been.calledWith(200);
      expect(res.json).to.have.been.calledWith({ data: [] });
    });
    it('Responds with all found genres', async () => {
      const req = mockReq();
      const res = mockRes();
      const genres = [new Genre('1', 'genre', 'image'), new Genre('2', 'genre', 'image')];
      genreService.getAll.resolves(genres);
      await genreController.getAll(req, res);
      expect(res.status).to.have.been.calledWith(200);
      expect(res.json).to.have.been.calledWith({ data: genres });
    });
  });
  describe('create', () => {
    it('filters missing name', async () => {
      const res = mockRes();
      await genreController.create(mockReq(), res);
      expect(res.status).to.have.been.calledWith(400);
      expect(res.json).to.have.been.calledWith({ error: 'Missing name' });
    });
    it('Calls service with correct parameters', async () => {
      const req = mockReq({
        body: {
          name: 'genre',
          image: 'image',
        },
      });
      const res = mockRes();
      await genreController.create(req, res);
      expect(genreService.save).to.have.been.calledOnceWithExactly({
        name: 'genre',
        image: process.env.DEFAULT_IMAGE_URL!,
      });
    });
    it('Responds with the created genre', async () => {
      const req = mockReq({
        body: {
          name: 'genre',
          image: 'image',
        },
      });
      const res = mockRes();
      const genre = new Genre('1', 'genre', 'image');
      genreService.save.resolves(genre);
      await genreController.create(req, res);
      expect(res.status).to.have.been.calledWith(201);
      expect(res.json).to.have.been.calledWith({ data: genre });
    });
  });
  describe('update', () => {
    it('Calls service with correct parameters', async () => {
      const req = mockReq({ params: { id: '1' }, body: { name: 'newName' } });
      const res = mockRes();
      genreService.getById.resolves(new Genre('1', 'oldName', 'image'));
      await genreController.update(req, res);
      expect(genreService.save).to.have.been.calledOnceWithExactly({
        id: '1',
        name: 'newName',
        image: process.env.DEFAULT_IMAGE_URL!,
      });
    });
    it('Responds with error if no genre is found', async () => {
      const req = mockReq({ params: { id: '1' }, body: { name: 'newName' } });
      const res = mockRes();
      genreService.getById.callsFake(() => { throw new GenreNotFoundException('Genre not found'); });
      await genreController.update(req, res);
      expect(res.status).to.have.been.calledWith(404);
      expect(res.json).to.have.been.calledWith({ error: 'Genre not found' });
    });
    it('Responds with the updated genre', async () => {
      const req = mockReq({ params: { id: '1' }, body: { name: 'newName' } });
      const res = mockRes();
      genreService.getById.resolves(new Genre('1', 'oldName', 'image'));
      genreService.save.resolves(new Genre('1', 'newName', 'image'));
      await genreController.update(req, res);
      expect(res.status).to.have.been.calledWith(200);
      expect(res.json).to.have.been.calledWith({ data: new Genre('1', 'newName', 'image') });
    });
  });
  describe('delete', () => {
    it('Calls service with correct parameters', async () => {
      const req = mockReq({ params: { id: '1' } });
      const res = mockRes();
      await genreController.delete(req, res);
      expect(genreService.delete).to.have.been.calledOnceWithExactly('1');
    });
    it('Responds with error if no genre is found', async () => {
      const req = mockReq({ params: { id: '1' } });
      const res = mockRes();
      genreService.delete.callsFake(() => { throw new GenreNotFoundException('Genre not found'); });
      await genreController.delete(req, res);
      expect(res.status).to.have.been.calledWith(404);
      expect(res.json).to.have.been.calledWith({ error: 'Genre not found' });
    });
    it('Responds with 204 if genre was deleted', async () => {
      const req = mockReq({ params: { id: '1' } });
      const res = mockRes();
      genreService.delete.resolves(1);
      await genreController.delete(req, res);
      expect(res.status).to.have.been.calledWith(204);
    });
  });
});
