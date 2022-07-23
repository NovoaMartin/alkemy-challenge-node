import { describe } from 'mocha';
import { Sequelize } from 'sequelize-typescript';
import sinon, { SinonSandbox } from 'sinon';
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';
import { v4 } from 'uuid';
import CharacterModel from '../../../../src/models/CharacterModel';
import FilmModel from '../../../../src/models/FilmModel';
import FilmCharacterModel from '../../../../src/models/FilmCharacterModel';
import GenreModel from '../../../../src/models/GenreModel';
import FilmRepository from '../../../../src/modules/film/repository/FilmRepository';
import FilmNotFoundException from '../../../../src/modules/film/exception/FilmNotFoundException';
import Film from '../../../../src/modules/film/entity/Film';
import InvalidCharacterGivenException from '../../../../src/modules/film/exception/InvalidCharacterGivenException';

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('FilmRepository tests', () => {
  let filmRepository: FilmRepository;
  let sandbox: SinonSandbox;

  beforeEach(async () => {
    sandbox = sinon.createSandbox();
    const sequelizeInstance = new Sequelize('sqlite::memory:');
    sequelizeInstance.addModels([CharacterModel, FilmModel, FilmCharacterModel, GenreModel]);
    await sequelizeInstance.sync({ force: true });
    filmRepository = new FilmRepository(FilmModel, CharacterModel);
  });
  afterEach(() => {
    sandbox.restore();
  });

  describe('getById tests', () => {
    it('calls model correctly', async () => {
      sandbox.stub(FilmModel, 'findByPk').resolves(FilmModel.build({}));
      await filmRepository.getById('1');
      expect(FilmModel.findByPk).to.have.been.calledOnceWithExactly('1');
    });
    it('throws exception if film is not found', async () => {
      sandbox.stub(FilmModel, 'findByPk').resolves(null);
      const result = filmRepository.getById('1');
      expect(result).to.be.rejectedWith(FilmNotFoundException);
    });
    it('returns the film', async () => {
      const film = {
        id: '1', title: 'Film 1', releaseDate: '', image: 'default', rating: 5,
      };
      await FilmModel.create(film);
      const result = await filmRepository.getById('1');
      expect(result).to.be.an('object').that.has.property('id').that.equals(film.id);
    });
  });

  describe('save tests', () => {
    it('saves a new film without associations', async () => {
      const film = {
        id: null, title: 'Film 1', releaseDate: new Date(), image: 'default', rating: 5,
      };
      const result = await filmRepository.save(film);
      expect(result).to.be.an('object').that.has.property('id').that.is.a('string');
      expect((await FilmModel.findAll())[0]).to.be.an('object').that.has.property('id').that.equals(result.id);
    });
    it('updates an existing film without associations', async () => {
      const film = {
        id: '1', title: 'Film 1', releaseDate: new Date(), image: 'default', rating: 5,
      };
      await FilmModel.create(film);
      film.rating = 1;
      const result = await filmRepository.save(film);
      expect(result).to.be.an('object').that.has.property('id').that.equals(film.id);
      expect(result).to.be.an('object').that.has.property('rating').that.equals(film.rating);
      expect((await FilmModel.findByPk(film.id))).to.be.an('object').that.has.property('rating').that.equals(film.rating);
    });
    it('saves a new film with associations', async () => {
      const charModel = await CharacterModel.create({
        id: v4(), name: 'Character 1', image: 'default', story: '',
      }, { isNewRecord: true });

      await filmRepository.save(new Film(
        null,
        'Film 1',
        'default',
        new Date(),
        5,
        null,
        new Date(),
        new Date(),
      ), [charModel.id]);

      const result = await FilmModel.findAll();
      expect(result).to.be.an('array').that.has.lengthOf(1);
      expect(result[0]).to.be.an('object').that.has.property('id').that.equals(result[0].id);
      const associatedChars = await result[0].getCharacters();
      expect(associatedChars).to.be.an('array').that.has.lengthOf(1);
      expect(associatedChars[0]).to.be.an('object').that.has.property('id').that.equals(charModel.id);
    });
    it('updates an existing film with associations', async () => {
      const filmData: Partial<Film> = {
        id: v4(), title: 'Film 1', releaseDate: new Date(), image: 'default', rating: 5,
      };
      const charModel = await CharacterModel.create({
        id: v4(), name: 'Character 1', image: 'default', story: '',
      }, { isNewRecord: true });
      const charModel2 = await CharacterModel.create({
        id: v4(), name: 'Character 2', image: 'default', story: '',
      }, { isNewRecord: true });

      await FilmModel.create(filmData, { isNewRecord: true });

      await filmRepository.save({ ...filmData, title: 'newTitle' }, [charModel.id]);

      const result = await FilmModel.findByPk(filmData.id!);
      const associatedCharacters = await result!.getCharacters();

      expect(result).to.be.an('object').that.has.property('id').that.equals(filmData.id);
      expect(result).to.be.an('object').that.has.property('title').that.equals('newTitle');
      expect(associatedCharacters).to.be.an('array').that.has.lengthOf(1);
      expect(associatedCharacters[0]).to.be.an('object').that.has.property('id').that.equals(charModel.id);

      await filmRepository.save({ ...filmData }, [charModel2.id]);

      const result2 = await FilmModel.findByPk(filmData.id!);
      const associatedCharacters2 = await result2!.getCharacters();

      expect(result2).to.be.an('object').that.has.property('id').that.equals(filmData.id);
      expect(result2).to.be.an('object').that.has.property('title').that.equals(filmData.title);
      expect(associatedCharacters2).to.be.an('array').that.has.lengthOf(1);
      expect(associatedCharacters2[0]).to.be.an('object').that.has.property('id').that.equals(charModel2.id);
    });
    it('throws error if given invalid character id', async () => {
      const result = filmRepository.save(new Film(null, 'Film 1', 'default', new Date(), 5, '1', new Date(), new Date()), ['1']);
      expect(result).to.be.rejectedWith(InvalidCharacterGivenException);
    });
  });

  describe('search tests', () => {
    const film1: Partial<Film> = new Film(v4(), 'test', 'default', new Date(), 5, '1', new Date(), new Date());
    const film2: Partial<Film> = new Film(v4(), 'film', 'default', new Date(), 5, '2', new Date(), new Date());
    const film3: Partial<Film> = new Film(v4(), 'title', 'default', new Date(), 5, '2', new Date(), new Date());

    beforeEach(async () => {
      await GenreModel.create({ id: '1', name: 'genre1' });
      await GenreModel.create({ id: '2', name: 'genre2' });
      await FilmModel.create(film1);
      await FilmModel.create(film2);
      await FilmModel.create(film3);
    });

    it('searches by title', async () => {
      const result = await filmRepository.search({ title: 'es' });
      expect(result).to.be.an('array').that.has.lengthOf(1);
      expect(result[0]).to.be.an('object').that.has.property('id').that.equals(film1.id);
    });
    it('searches by genre', async () => {
      const result = await filmRepository.search({ genre: '2' });
      expect(result).to.be.an('array').that.has.lengthOf(2);
      expect(result[0]).to.be.an('object').that.has.property('id').that.equals(film2.id);
      expect(result[1]).to.be.an('object').that.has.property('id').that.equals(film3.id);
    });
    it('returns empty array if no results', async () => {
      const result = await filmRepository.search({ title: 'noResults' });
      expect(result).to.be.an('array').that.has.lengthOf(0);
    });
    it('returns all results if no search params', async () => {
      const result = await filmRepository.search({});
      expect(result).to.be.an('array').that.has.lengthOf(3);
    });
    it('orders by title', async () => {
      const resultAsc = await filmRepository.search({ order: 'ASC' });
      const resultDesc = await filmRepository.search({ order: 'DESC' });
      expect(resultAsc).to.be.an('array').that.has.lengthOf(3);
      expect(resultAsc[0]).to.be.an('object').that.has.property('id').that.equals(film2.id);
      expect(resultAsc[1]).to.be.an('object').that.has.property('id').that.equals(film1.id);
      expect(resultAsc[2]).to.be.an('object').that.has.property('id').that.equals(film3.id);

      expect(resultDesc).to.be.an('array').that.has.lengthOf(3);
      expect(resultDesc[0]).to.be.an('object').that.has.property('id').that.equals(film3.id);
      expect(resultDesc[1]).to.be.an('object').that.has.property('id').that.equals(film1.id);
      expect(resultDesc[2]).to.be.an('object').that.has.property('id').that.equals(film2.id);

      const resultAsc2 = await filmRepository.search({});
      expect(resultAsc2).to.be.an('array').that.has.lengthOf(3);
      expect(resultAsc2[0]).to.be.an('object').that.has.property('id').that.equals(film2.id);
      expect(resultAsc2[1]).to.be.an('object').that.has.property('id').that.equals(film1.id);
      expect(resultAsc2[2]).to.be.an('object').that.has.property('id').that.equals(film3.id);
    });
  });
});
