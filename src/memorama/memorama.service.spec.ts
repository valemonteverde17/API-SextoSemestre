import { Test, TestingModule } from '@nestjs/testing';
import { MemoramaService } from './memorama.service';

describe('MemoramaService', () => {
  let service: MemoramaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MemoramaService],
    }).compile();

    service = module.get<MemoramaService>(MemoramaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
