import { afterEach, describe } from 'mocha';
import sinon, { SinonSandbox } from 'sinon';
import { Sequelize } from 'sequelize-typescript';
import { expect } from 'chai';
import sinonChai from 'sinon-chai';
import chaiAsPromised from 'chai-as-promised';
import { v4 } from 'uuid';
import GenreRepository from '../../../../src/modules/genre/repository/GenreRepository';
import GenreModel from '../../../../src/models/GenreModel';
import GenreNotFoundException from '../../../../src/modules/genre/exception/GenreNotFoundException';
import Genre from '../../../../src/modules/genre/entity/Genre';

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('GenreRepository', () => {
  let genreRepository: GenreRepository;
  let sandbox: SinonSandbox;

  beforeEach(async () => {
    sandbox = sinon.createSandbox();
    genreRepository = new GenreRepository(GenreModel);
    const sequelizeInstance = new Sequelize('sqlite::memory:');
    sequelizeInstance.addModels([GenreModel]);
    await sequelizeInstance.sync({ force: true });
  });
  afterEach(() => { sandbox.restore(); });

  describe('getById', () => {
    it('calls model correctly', async () => {
      sandbox.stub(GenreModel, 'findByPk').resolves(GenreModel.build({}));
      await genreRepository.getById('1');
      expect(GenreModel.findByPk).to.have.been.calledOnceWithExactly('1');
    });
    it('throws exception if genre is not found', async () => {
      sandbox.stub(GenreModel, 'findByPk').resolves(null);
      const result = genreRepository.getById('1');
      expect(result).to.be.rejectedWith(GenreNotFoundException);
    });
    it('returns the genre', async () => {
      const genreData: Partial<Genre> = new Genre('1', 'Genre 1', 'image');
      await GenreModel.create(genreData);
      const result = await genreRepository.getById('1');
      expect(result).to.be.an('object').that.has.property('id').that.equals('1');
      expect(result).to.be.instanceof(Genre);
    });
  });
  describe('save', () => {
    it('saves a new genre', async () => {
      const genreData: Partial<Genre> = new Genre(v4(), 'Genre 1', 'image');
      await genreRepository.save(genreData);
      const result = await GenreModel.findByPk('1');
      expect(result).to.be.an('object').that.has.property('id').that.equals(genreData.id);
    });
    it('updates an existing genre', async () => {
      const genreData: Partial<Genre> = new Genre('1', 'Genre 1', 'image');
      await GenreModel.create(genreData);

      await genreRepository.save({ ...genreData, name: 'Genre 2' });
      const result = await GenreModel.findByPk('1');
      expect(result).to.be.an('object').that.has.property('name').that.equals('Genre 2');
    });
    it('returns the genre', async () => {
      const genreData: Partial<Genre> = new Genre('1', 'Genre 1', 'image');
      const result = await genreRepository.save(genreData);
      expect(result).to.be.an('object').that.has.property('id').that.equals(genreData.id);
      expect(result).to.be.instanceof(Genre);
    });
  });
  describe('delete', () => {
    it('deletes the genre', async () => {
      const genreData: Partial<Genre> = new Genre('1', 'Genre 1', 'image');
      await GenreModel.create(genreData);
      await genreRepository.delete('1');
      const result = await GenreModel.findByPk('1');
      expect(result).to.be.null;
    });
    it('throws exception if genre is not found', async () => {
      const result = genreRepository.delete('1');
      expect(result).to.be.rejectedWith(GenreNotFoundException);
    });
  });
});
