import { describe } from 'mocha';
import { Sequelize } from 'sequelize-typescript';
import sinon, { SinonSandbox } from 'sinon';
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';
import { v4 } from 'uuid';
import CharacterRepository from '../../../../src/modules/character/repository/CharacterRepository';
import CharacterModel from '../../../../src/models/CharacterModel';
import FilmModel from '../../../../src/models/FilmModel';
import FilmCharacterModel from '../../../../src/models/FilmCharacterModel';
import GenreModel from '../../../../src/models/GenreModel';
import CharacterNotFoundException from '../../../../src/modules/character/exception/CharacterNotFoundException';
import Character from '../../../../src/modules/character/entity/Character';
import InvalidFilmGivenException from '../../../../src/modules/character/exception/InvalidFilmGivenException';

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('AuthRepository', () => {
  let characterRepository: CharacterRepository;
  let sandbox: SinonSandbox;

  beforeEach(async () => {
    sandbox = sinon.createSandbox();
    const sequelizeInstance = new Sequelize('sqlite::memory:');
    sequelizeInstance.addModels([CharacterModel, FilmModel, FilmCharacterModel, GenreModel]);
    await sequelizeInstance.sync({ force: true });
    characterRepository = new CharacterRepository(CharacterModel, FilmModel);
  });
  afterEach(() => {
    sandbox.restore();
  });

  describe('getById tests', () => {
    it('calls model correctly', async () => {
      sandbox.stub(CharacterModel, 'findByPk').resolves(CharacterModel.build({}));
      await characterRepository.getById('1');
      expect(CharacterModel.findByPk).to.have.been.calledOnceWithExactly('1');
    });
    it('throws exception if character is not found', async () => {
      sandbox.stub(CharacterModel, 'findByPk').resolves(null);
      const result = characterRepository.getById('1');
      expect(result).to.be.rejectedWith(CharacterNotFoundException);
    });
    it('returns the character', async () => {
      const character = {
        id: '1', name: 'Character 1', image: '', story: '', age: 0, weight: 0,
      };
      await CharacterModel.create(character);
      const result = await characterRepository.getById('1');
      expect(result).to.be.an('object').that.has.property('id').that.equals(character.id);
    });
  });
  describe('save tests', () => {
    it('saves a new character without associations', async () => {
      const character = {
        id: null, name: 'Character 1', image: '', story: '', age: 0, weight: 0,
      };
      const result = await characterRepository.save(character);
      expect(result).to.be.an('object').that.has.property('id').that.is.a('string');
      expect((await CharacterModel.findAll())[0]).to.have.property('id').that.equals(result.id);
    });
    it('updates an existing character without associations', async () => {
      const character = {
        id: '1', name: 'Character 1', image: '', story: '', age: 0, weight: 0,
      };
      await CharacterModel.create(character);
      character.age = 42;
      const result = await characterRepository.save(character);
      expect(result).to.be.an('object').that.has.property('id').that.equals(character.id);
      expect(result).to.be.an('object').that.has.property('age').that.equals(character.age);
      const updatedCharacter = await CharacterModel.findByPk(character.id);
      expect(updatedCharacter).to.have.property('age').that.equals(character.age);
    });
    it('updates an existing character with associations', async () => {
      const characterData: Partial<Character> = {
        id: v4(), name: 'shrek', image: 'shrek.jpg', story: 'shrekStory',
      };
      const filmModel = await FilmModel.create({
        id: v4(), title: 'shrek 1', image: 'test', releaseDate: new Date('1/1/2005'), rating: 4,
      }, { isNewRecord: true });

      const filmModel2 = await FilmModel.create({
        id: v4(), title: 'shrek 1', image: 'test', releaseDate: new Date('1/1/2005'), rating: 4,
      }, { isNewRecord: true });

      await CharacterModel.create(characterData, { isNewRecord: true });

      await characterRepository.save({ ...characterData, story: 'updatedField' }, [filmModel.id]);

      const result = await CharacterModel.findByPk(characterData.id!);
      const associatedFilms = await result!.getFilms();

      expect(result).to.be.an('object').that.has.property('id').that.equals(characterData.id);
      expect(result).to.be.an('object').that.has.property('story').that.equals('updatedField');
      expect(associatedFilms).to.be.an('array').that.has.lengthOf(1);
      expect(associatedFilms[0]).to.have.property('id').that.equals(filmModel.id);

      await characterRepository.save({ ...characterData }, [filmModel2.id]);

      const result2 = await CharacterModel.findByPk(characterData.id!);
      const associatedFilms2 = await result2!.getFilms();

      expect(result2).to.be.an('object').that.has.property('id').that.equals(characterData.id);
      expect(result2).to.be.an('object').that.has.property('story').that.equals('shrekStory');
      expect(associatedFilms2).to.be.an('array').that.has.lengthOf(1);
      expect(associatedFilms2[0]).to.have.property('id').that.equals(filmModel2.id);
    });
    it('saves a new character with associations', async () => {
      const filmModel = await FilmModel.create({
        id: v4(), title: 'shrek 1', image: 'test', releaseDate: new Date('1/1/2005'), rating: 4,
      }, { isNewRecord: true });

      await characterRepository.save(new Character(null, 'shrek', 'shrek.jpg', 'shrekStory'), [filmModel.id]);

      const result = await CharacterModel.findAll();
      expect(result).to.be.an('array').that.has.lengthOf(1);
      const associatedFilms = await result[0].getFilms();
      expect(associatedFilms).to.be.an('array').that.has.lengthOf(1);
      expect(associatedFilms[0]).to.have.property('id').that.equals(filmModel.id);
    });
    it('throws exception if invalid filmId is given', async () => {
      expect(characterRepository.save(new Character(null, 'shrek', 'shrek.jpg', 'shrekStory'), ['invalidId'])).to.be.rejectedWith(InvalidFilmGivenException);
    });
  });
  describe('delete tests', () => {
    it('deletes a character', async () => {
      const characterData = {
        id: v4(), name: 'shrek', image: 'shrek.jpg', story: 'shrekStory',
      };
      await CharacterModel.create(characterData);
      await characterRepository.delete(characterData.id);
      const result = await CharacterModel.findByPk(characterData.id);
      expect(result).to.be.null;
    });
    it('throws exception if no character was deleted', async () => {
      const result = characterRepository.delete('invalidId');
      expect(result).to.be.rejectedWith(CharacterNotFoundException);
    });
  });
  describe('search tests', () => {
    const char1: Partial<Character> = new Character(v4(), 'name', 'a', 'story', 1, 1);
    const char2: Partial<Character> = new Character(v4(), 'shrek', 'a', 'story', 1, 4);
    const char3: Partial<Character> = new Character(v4(), 'fiona', 'a', 'story', 2, 4);
    let charModel1: CharacterModel;
    beforeEach(async () => {
      charModel1 = await CharacterModel.create(char1, { isNewRecord: true });
      await CharacterModel.create(char2, { isNewRecord: true });
      await CharacterModel.create(char3, { isNewRecord: true });
    });
    it('searches by age', async () => {
      const result = await characterRepository.search({ age: 1 });
      expect(result).to.be.an('array').that.has.lengthOf(2);
      expect(result[0]).to.have.property('id').that.equals(char1.id);
      expect(result[1]).to.have.property('id').that.equals(char2.id);
    });
    it('searches by weight', async () => {
      const result = await characterRepository.search({ weight: 4 });
      expect(result).to.be.an('array').that.has.lengthOf(2);
      expect(result[0]).to.have.property('id').that.equals(char2.id);
      expect(result[1]).to.have.property('id').that.equals(char3.id);
    });
    it('searches by name', async () => {
      const result = await characterRepository.search({ name: 'on' });
      expect(result).to.be.an('array').that.has.lengthOf(1);
      expect(result[0]).to.have.property('id').that.equals(char3.id);
    });
    it('searches by associated film', async () => {
      const filmModel1 = await FilmModel.create({
        id: v4(), title: 'example', image: 'testImage.jpg', releaseDate: new Date(), rating: 5,
      }, { isNewRecord: true });
      await charModel1.addFilm(filmModel1);

      const result = await characterRepository.search({ filmName: 'xampl' });
      expect(result).to.be.an('array').that.has.lengthOf(1);
      expect(result[0]).to.have.property('id').that.equals(char1.id);
    });
    it('returns empty array if no character is found', async () => {
      const result = await characterRepository.search({ name: 'invalidName' });
      expect(result).to.deep.eq([]);
    });
    it('returns all characters if no search criteria is given', async () => {
      const result = await characterRepository.search({});
      expect(result).to.be.an('array').that.has.lengthOf(3);
    });
  });
});
