import { afterEach, describe } from 'mocha';
import sinon, { SinonSandbox, SinonStubbedInstance } from 'sinon';
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';
import GenreService from '../../../../src/modules/genre/service/GenreService';
import GenreRepository from '../../../../src/modules/genre/repository/GenreRepository';
import Genre from '../../../../src/modules/genre/entity/Genre';
import GenreNotFoundException from '../../../../src/modules/genre/exception/GenreNotFoundException';

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('GenreService', () => {
  let genreService: GenreService;
  let genreRepository: SinonStubbedInstance<GenreRepository>;
  let sandbox: SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    genreRepository = sandbox.createStubInstance(GenreRepository);
    genreService = new GenreService(genreRepository);
  });
  afterEach(() => { sandbox.restore(); });

  describe('getAll', () => {
    it('calls repository correctly', async () => {
      await genreService.getAll();
      expect(genreRepository.findAll).to.have.been.calledOnce;
    });
    it('returns the correct data', async () => {
      const expectedReturn = [new Genre('1', 'name', 'image')];
      genreRepository.findAll.resolves(expectedReturn);
      const result = await genreService.getAll();
      expect(result).to.be.deep.eq(expectedReturn);
    });
  });
  describe('getById', () => {
    it('calls repository correctly', async () => {
      await genreService.getById('1');
      expect(genreRepository.getById).to.have.been.calledOnceWithExactly('1');
    });
    it('returns the correct data', async () => {
      const expectedReturn = new Genre('1', 'name', 'image');
      genreRepository.getById.resolves(expectedReturn);
      const result = await genreService.getById('1');
      expect(result).to.be.deep.eq(expectedReturn);
    });
    it('throws an exception if the genre is not found', async () => {
      genreRepository.getById.callsFake(() => { throw new GenreNotFoundException(); });
      await expect(genreService.getById('1')).to.be.rejectedWith(GenreNotFoundException);
    });
  });
  describe('save', () => {
    it('calls repository correctly', async () => {
      const genre = new Genre('1', 'name', 'image');
      await genreService.save(genre);
      expect(genreRepository.save).to.have.been.calledOnceWithExactly(genre);
    });
    it('returns the correct data', async () => {
      const genre = new Genre('1', 'name', 'image');
      genreRepository.save.resolves(genre);
      const result = await genreService.save(genre);
      expect(result).to.be.deep.eq(genre);
    });
  });
  describe('delete', () => {
    it('calls repository correctly', async () => {
      await genreService.delete('1');
      expect(genreRepository.delete).to.have.been.calledOnceWithExactly('1');
    });
    it('returns the correct data', async () => {
      genreRepository.delete.resolves(1);
      const result = await genreService.delete('1');
      expect(result).to.be.eq(1);
    });
    it('throws an exception if the genre is not found', async () => {
      genreRepository.delete.callsFake(() => { throw new GenreNotFoundException(); });
      await expect(genreService.delete('1')).to.be.rejectedWith(GenreNotFoundException);
    });
  });
});
