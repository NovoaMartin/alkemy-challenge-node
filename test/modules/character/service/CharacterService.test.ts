import { afterEach, describe } from 'mocha';
import sinon, { SinonSandbox, SinonStubbedInstance } from 'sinon';
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import chaiAsPromised from 'chai-as-promised';
import Character from '../../../../src/modules/character/entity/Character';
import CharacterRepository from '../../../../src/modules/character/repository/CharacterRepository';
import CharacterService from '../../../../src/modules/character/service/CharacterService';
import CharacterNotFoundException from '../../../../src/modules/character/exception/CharacterNotFoundException';
import InvalidFilmGivenException from '../../../../src/modules/character/exception/InvalidFilmGivenException';
import CharacterListDTO from '../../../../src/modules/character/entity/CharacterListDTO';

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('CharacterService tests', () => {
  let characterService: CharacterService;
  let characterRepository: SinonStubbedInstance<CharacterRepository>;
  let sandbox: SinonSandbox;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    characterRepository = sandbox.createStubInstance(CharacterRepository);
    characterService = new CharacterService(characterRepository);
  });
  afterEach(() => {
    sandbox.restore();
  });
  describe('getAll', () => {
    it('calls characterRepository with the correct parameters', async () => {
      await characterService.getAll({});
      expect(characterRepository.search).to.have.been.calledOnceWithExactly({
        name: undefined, age: undefined, weight: undefined, filmName: undefined,
      });
    });
    it('returns the correct data', async () => {
      const expectedReturn = [new CharacterListDTO('1', 'name', 'image')];
      characterRepository.search.resolves(expectedReturn);
      const result = await characterService.getAll({});
      expect(result).to.be.deep.eq(expectedReturn);
    });
  });
  describe('getById', () => {
    it('calls characterRepository with the correct parameters', async () => {
      await characterService.getById('1');
      expect(characterRepository.getById).to.have.been.calledOnceWithExactly('1');
    });
    it('returns the correct data', async () => {
      const expectedReturn = new Character(
        '1',
        'name',
        'image',
        'story',
        1,
        1,
        new Date(),
        new Date(),
        { self: { href: '/characters/1' }, films: [{ title: 'shrek', href: 'asd' }] },
      );
      characterRepository.getById.resolves(expectedReturn);
      const result = await characterService.getById('1');
      expect(result).to.be.deep.eq(expectedReturn);
    });
    it('throws exception if no user is found', async () => {
      characterRepository.getById.callsFake(() => { throw new CharacterNotFoundException(); });
      expect(characterService.getById('1')).to.be.rejectedWith(CharacterNotFoundException);
    });
  });
  describe('save', () => {
    it('calls characterRepository with the correct parameters', async () => {
      await characterService.save({}, []);
      expect(characterRepository.save).to.have.been.calledOnceWithExactly({}, []);
    });
    it('returns the correct data', async () => {
      const expectedReturn = new Character('1', 'name', 'image', 'story', 1, 1, new Date(), new Date(), {
        self: { href: '/characters/1' },
        films: [{ title: 'shrek', href: 'asd' }],
      });
      characterRepository.save.resolves(expectedReturn);
      const result = await characterService.save({}, []);
      expect(result).to.be.deep.eq(expectedReturn);
    });
    it('throws exception if given wrong filmId', async () => {
      characterRepository.save.callsFake(() => { throw new InvalidFilmGivenException(); });
      expect(characterService.save({}, ['1'])).to.be.rejectedWith(InvalidFilmGivenException);
    });
  });
  describe('delete', () => {
    it('calls characterRepository with the correct parameters', async () => {
      await characterService.delete('1');
      expect(characterRepository.delete).to.have.been.calledOnceWithExactly('1');
    });
    it('returns the correct data', async () => {
      await characterService.delete('1');
      expect(characterRepository.delete).to.have.been.calledOnceWithExactly('1');
    });
  });
});
