import { describe } from 'mocha';
import sinon, { SinonSandbox, SinonStubbedInstance } from 'sinon';
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';
import { config } from 'dotenv';
import { mockReq, mockRes } from 'sinon-express-mock';
import multer from 'multer';
import FilmController from '../../../../src/modules/film/controller/FilmController';
import FilmService from '../../../../src/modules/film/service/FilmService';
import Film from '../../../../src/modules/film/entity/Film';
import FilmNotFoundException from '../../../../src/modules/film/exception/FilmNotFoundException';
import FilmListDTO from '../../../../src/modules/film/entity/FilmListDTO';
import InvalidCharacterGivenException from '../../../../src/modules/film/exception/InvalidCharacterGivenException';

config();

chai.use(sinonChai);
chai.use(chaiAsPromised);

describe('FilmController tests', () => {
  let filmController: FilmController;
  let filmService: SinonStubbedInstance<FilmService>;
  let sandbox: SinonSandbox;
  beforeEach(async () => {
    sandbox = sinon.createSandbox();
    filmService = sandbox.createStubInstance(FilmService);
    filmController = new FilmController(filmService, multer());
  });
  afterEach(() => {
    sandbox.restore();
  });

  describe('getById', () => {
    it('calls service with correct parameters', async () => {
      const req = mockReq({ params: { id: '1' } });
      const res = mockRes();
      filmService.getById.resolves(new Film('1', 'name', 'image', new Date(), 5, null, new Date(), new Date()));
      await filmController.getById(req, res);
      expect(filmService.getById).to.have.been.calledWith('1');
    });
    it('responds with found film', async () => {
      const req = mockReq({ params: { id: '1' } });
      const res = mockRes();
      filmService.getById.resolves(new Film('1', 'name', 'image', new Date('1-1-2000'), 5, null, new Date('1-1-2000'), new Date('1-1-2000')));
      await filmController.getById(req, res);
      expect(res.json).to.have.been.calledWith(new Film('1', 'name', 'image', new Date('1-1-2000'), 5, null, new Date('1-1-2000'), new Date('1-1-2000')));
      expect(res.status).to.have.been.calledWith(200);
    });
    it('responds with error if no film is found', async () => {
      const req = mockReq({ params: { id: '1' } });
      const res = mockRes();
      filmService.getById.callsFake(async () => { throw new FilmNotFoundException(); });
      await filmController.getById(req, res);
      expect(res.json).to.have.been.calledWith({
        error: 'Film not found',
      });
    });
  });
  describe('search', () => {
    it('calls service with correct parameters', async () => {
      const req = mockReq({ query: { title: 'name', genre: 'genre', order: 'asc' } });
      const res = mockRes();
      filmService.getAll.resolves([new FilmListDTO('1', 'name', 'image', new Date('1-1-2000'))]);
      await filmController.search(req, res);
      expect(filmService.getAll).to.have.been.calledWith({
        title: 'name',
        genre: 'genre',
        order: 'asc',
      });
    });
    it('responds with found films', async () => {
      const req = mockReq({ query: { title: 'name', genre: 'genre', order: 'asc' } });
      const res = mockRes();
      filmService.getAll.resolves([new FilmListDTO('1', 'name', 'image', new Date('1-1-2000'))]);
      await filmController.search(req, res);
      expect(res.json).to.have.been.calledWith({
        data: [new FilmListDTO('1', 'name', 'image', new Date('1-1-2000'))],
      });
      expect(res.status).to.have.been.calledWith(200);
    });
  });
  describe('create', () => {
    describe('filters invalid fields', () => {
      it('filters missing title', async () => {
        const req = mockReq({ body: { genre: 'genre', releaseDate: '2000-01-01' } });
        const res = mockRes();
        await filmController.create(req, res);
        expect(res.json).to.have.been.calledWith({ error: 'Invalid parameters' });
        expect(res.status).to.have.been.calledWith(400);
      });
      it('filters missing releaseDate', async () => {
        const req = mockReq({ body: { title: 'title', genre: 'genre' } });
        const res = mockRes();
        await filmController.create(req, res);
        expect(res.json).to.have.been.calledWith({ error: 'Invalid parameters' });
        expect(res.status).to.have.been.calledWith(400);
      });
      it('filters missing rating', async () => {
        const req = mockReq({ body: { title: 'title', genre: 'genre', releaseDate: '2000-01-01' } });
        const res = mockRes();
        await filmController.create(req, res);
        expect(res.json).to.have.been.calledWith({ error: 'Invalid parameters' });
        expect(res.status).to.have.been.calledWith(400);
      });
      it('filters rating out of range', async () => {
        const req = mockReq({
          body: {
            title: 'title', genre: 'genre', releaseDate: '2000-01-01', rating: 6,
          },
        });
        let res = mockRes();
        await filmController.create(req, res);
        expect(res.json).to.have.been.calledWith({ error: 'Invalid parameters' });
        expect(res.status).to.have.been.calledWith(400);
        req.body.rating = -1;
        res = mockRes();
        await filmController.create(req, res);
        expect(res.json).to.have.been.calledWith({ error: 'Invalid parameters' });
        expect(res.status).to.have.been.calledWith(400);
      });
    });
    it('calls service with correct parameters', async () => {
      const req = mockReq({
        body: {
          title: 'title', genre: 'genre', releaseDate: '2000-01-01', rating: 5,
        },
      });
      const res = mockRes();
      filmService.save.resolves(new Film('1', 'title', 'image', new Date('1-1-2000'), 5, null, new Date('1-1-2000'), new Date('1-1-2000')));
      await filmController.create(req, res);
      expect(filmService.save).to.have.been.calledWith({
        title: 'title',
        releaseDate: '2000-01-01',
        rating: 5,
        genreId: undefined,
        image: 'default.png',
      }, []);
    });
    it('responds with created film', async () => {
      const req = mockReq({
        body: {
          title: 'title', genre: 'genre', releaseDate: '2000-01-01', rating: 5,
        },
      });
      const res = mockRes();
      filmService.save.resolves(new Film('1', 'title', 'image', new Date('1-1-2000'), 5, null, new Date('1-1-2000'), new Date('1-1-2000')));
      await filmController.create(req, res);
      expect(res.json).to.have.been.calledWith(new Film('1', 'title', 'image', new Date('1-1-2000'), 5, null, new Date('1-1-2000'), new Date('1-1-2000')));
      expect(res.status).to.have.been.calledWith(201);
    });
    it('responds with error if given invalid character id', async () => {
      const req = mockReq({
        body: {
          title: 'title', genre: 'genre', releaseDate: '2000-01-01', rating: 5,
        },
      });
      const res = mockRes();
      filmService.save.callsFake(() => { throw new InvalidCharacterGivenException(); });
      await filmController.create(req, res);
      expect(res.json).to.have.been.calledWith({ error: 'Invalid character id' });
      expect(res.status).to.have.been.calledWith(400);
    });
  });
  describe('update', () => {
    it('calls service with correct parameters', async () => {
      const req = mockReq({ params: { id: '1' }, body: { title: 'newTitle', characterIds: ['1', '2'] } });
      const res = mockRes();
      const filmData = new Film('1', 'title', 'image', new Date('1-1-2000'), 5, null, new Date(), new Date());
      filmService.getById.resolves(filmData);
      await filmController.update(req, res);
      expect(filmService.getById).to.have.been.calledOnceWithExactly('1');
      expect(filmService.save).to.have.been.calledOnceWithExactly({
        id: '1',
        title: 'newTitle',
        releaseDate: new Date('1-1-2000'),
        rating: 5,
        genreId: null,
        image: 'image',
      }, ['1', '2']);
    });
    it('filters missing id', async () => {
      const req = mockReq({
        body: {
          title: 'title', genre: 'genre', releaseDate: '2000-01-01', rating: 5,
        },
      });
      const res = mockRes();
      await filmController.update(req, res);
      expect(res.json).to.have.been.calledWith({ error: 'Invalid parameters' });
      expect(res.status).to.have.been.calledWith(400);
    });
    it('responds with error if film doesnt exist', async () => {
      const req = mockReq({
        body: {
          title: 'title', genre: 'genre', releaseDate: '2000-01-01', rating: 5,
        },
        params: { id: '1' },
      });
      const res = mockRes();
      filmService.getById.callsFake(() => { throw new FilmNotFoundException(); });
      await filmController.update(req, res);
      expect(res.json).to.have.been.calledWith({ error: 'Film not found' });
      expect(res.status).to.have.been.calledWith(404);
    });
    it('responds with the updated film', async () => {
      const req = mockReq({
        body: {
          title: 'title', genre: 'genre', releaseDate: '2000-01-01', rating: 5,
        },
        params: { id: '1' },
      });
      const res = mockRes();
      const filmData = new Film('1', 'title', 'image', new Date('1-1-2000'), 5, null, new Date(), new Date());
      filmService.getById.resolves(filmData);
      filmService.save.resolves(filmData);
      await filmController.update(req, res);
      expect(res.json).to.have.been.calledWith(filmData);
      expect(res.status).to.have.been.calledWith(200);
    });
    it('responds with error if given invalid character id', async () => {
      const req = mockReq({
        body: {
          title: 'title', genre: 'genre', releaseDate: '2000-01-01', rating: 5,
        },
        params: { id: '1' },
      });
      const res = mockRes();
      filmService.getById.resolves(new Film('1', 'title', 'image', new Date('1-1-2000'), 5, null, new Date(), new Date()));
      filmService.save.callsFake(() => { throw new InvalidCharacterGivenException(); });
      await filmController.update(req, res);
      expect(res.json).to.have.been.calledWith({ error: 'Invalid character id' });
      expect(res.status).to.have.been.calledWith(400);
    });
  });
  describe('delete', () => {
    it('calls service with correct parameters', async () => {
      const req = mockReq({ params: { id: '1' } });
      const res = mockRes();
      await filmController.delete(req, res);
      expect(filmService.delete).to.have.been.calledOnceWithExactly('1');
    });
    it('responds with error if film doesnt exist', async () => {
      const req = mockReq({ params: { id: '1' } });
      const res = mockRes();
      await filmController.delete(req, res);
      expect(res.json).to.have.been.calledWith({ error: 'Film not found' });
      expect(res.status).to.have.been.calledWith(404);
    });
    it('responds with 204 if film was deleted', async () => {
      const req = mockReq({ params: { id: '1' } });
      const res = mockRes();
      filmService.delete.resolves(1);
      await filmController.delete(req, res);
      expect(res.status).to.have.been.calledWith(204);
    });
  });
});
