import { Request, Response } from 'express';
import CharacterService from '../service/CharacterService';

export default class CharacterController {
  constructor(private characterService: CharacterService) {}

  async getById(req: Request, res: Response) {

  }

  async search(req: Request, res: Response) {

  }
}
