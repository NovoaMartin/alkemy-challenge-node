import { afterEach, describe } from 'mocha';
import sinon, { SinonSandbox, SinonStubbedInstance } from 'sinon';
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import chaiAsPromised from 'chai-as-promised';
import FilmService from '../../../../src/modules/film/service/FilmService';
import FilmRepository from '../../../../src/modules/film/repository/FilmRepository';
import FilmListDTO from '../../../../src/modules/film/entity/FilmListDTO';
import Film from '../../../../src/modules/film/entity/Film';
import FilmNotFoundException from '../../../../src/modules/film/exception/FilmNotFoundException';
import InvalidCharacterGivenException from '../../../../src/modules/film/exception/InvalidCharacterGivenException';

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('FilmService tests', () => {
  let filmService: FilmService;
  let filmRepository: SinonStubbedInstance<FilmRepository>;
  let sandbox: SinonSandbox;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    filmRepository = sandbox.createStubInstance(FilmRepository);
    filmService = new FilmService(filmRepository);
  });
  afterEach(() => {
    sandbox.restore();
  });
  describe('getAll', () => {
    it('calls filmRepository with the correct parameters', async () => {
      await filmService.getAll({});
      expect(filmRepository.search).to.have.been.calledOnceWithExactly({
        title: undefined, genre: undefined, order: undefined,
      });
    });
    it('returns the correct data', async () => {
      const expectedReturn = [new FilmListDTO('1', 'name', 'image', new Date())];
      filmRepository.search.resolves(expectedReturn);
      const result = await filmService.getAll({});
      expect(result).to.be.deep.eq(expectedReturn);
    });
  });
  describe('getById', () => {
    it('calls filmRepository with the correct parameters', async () => {
      await filmService.getById('1');
      expect(filmRepository.getById).to.have.been.calledOnceWithExactly('1');
    });
    it('returns the correct data', async () => {
      const expectedReturn = new Film(
        '1',
        'name',
        'image',
        new Date(),
        1,
        null,
        new Date(),
        new Date(),
        { self: { href: '/movies/1' }, characters: [{ name: 'shrek', href: 'asd' }] },
      );
      filmRepository.getById.resolves(expectedReturn);
      const result = await filmService.getById('1');
      expect(result).to.be.deep.eq(expectedReturn);
    });
    it('throws exception if no films is found', async () => {
      filmRepository.getById.callsFake(() => { throw new FilmNotFoundException(); });
      expect(filmService.getById('1')).to.be.rejectedWith(FilmNotFoundException);
    });
  });
  describe('save', () => {
    it('calls filmRepository with the correct parameters', async () => {
      await filmService.save({}, []);
      expect(filmRepository.save).to.have.been.calledOnceWithExactly({}, []);
    });
    it('returns the correct data', async () => {
      const expectedReturn = new Film('1', 'name', 'image', new Date(), 1, null, new Date(), new Date(), {
        self: { href: '/movies/1' },
        characters: [{ name: 'shrek', href: 'asd' }],
      });
      filmRepository.save.resolves(expectedReturn);
      const result = await filmService.save({}, []);
      expect(result).to.be.deep.eq(expectedReturn);
    });
    it('throws exception if given wrong characterId', async () => {
      filmRepository.save.callsFake(() => { throw new InvalidCharacterGivenException(); });
      expect(filmService.save({}, ['1'])).to.be.rejectedWith(InvalidCharacterGivenException);
    });
  });
  describe('delete', () => {
    it('calls filmRepository with the correct parameters', async () => {
      await filmService.delete('1');
      expect(filmRepository.delete).to.have.been.calledOnceWithExactly('1');
    });
    it('returns the correct data', async () => {
      await filmService.delete('1');
      expect(filmRepository.delete).to.have.been.calledOnceWithExactly('1');
    });
  });
});
