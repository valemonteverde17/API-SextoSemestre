import { Test, TestingModule } from '@nestjs/testing';
import { MemoramaController } from './memorama.controller';

describe('MemoramaController', () => {
  let controller: MemoramaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MemoramaController],
    }).compile();

    controller = module.get<MemoramaController>(MemoramaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
