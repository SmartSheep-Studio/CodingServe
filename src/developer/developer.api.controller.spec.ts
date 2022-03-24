import { Test, TestingModule } from '@nestjs/testing';
import { DeveloperApiController } from './developer.api.controller';

describe('DeveloperApiController', () => {
  let controller: DeveloperApiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeveloperApiController],
    }).compile();

    controller = module.get<DeveloperApiController>(DeveloperApiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
