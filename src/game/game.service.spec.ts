import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { Game } from './game.entity';
import { GameService } from './game.service';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
const createMockRepository = <T = any>(): MockRepository<T> => ({
  findOne: jest.fn(),
});

describe('GameService', () => {
  let service: GameService;
  let gameRepository: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameService,
        { provide: Connection, useValue: {} },
        { provide: getRepositoryToken(Game), useValue: createMockRepository() },
      ],
    }).compile();

    service = module.get<GameService>(GameService);
    gameRepository = module.get<MockRepository>(getRepositoryToken(Game));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getGame', () => {
    describe('when game with ID exists', () => {
      it('should return game object', async () => {
        const gameId = 1;
        const expectedGame = {};

        gameRepository.findOne.mockReturnValue(expectedGame);
        const game = await service.getGame(gameId);
        expect(game).toEqual(expectedGame);
      });
    });

    describe('when game with ID does not exist', () => {
      it('should throw the NotFoundException', async () => {
        const gameId = 1;
        gameRepository.findOne.mockReturnValue(undefined);

        try {
          await service.getGame(gameId);
        } catch (error) {
          expect(error).toBeInstanceOf(NotFoundException);
          expect(error.message).toEqual(`Game with id #${gameId} not found.`);
        }
      });
    });
  });
});
