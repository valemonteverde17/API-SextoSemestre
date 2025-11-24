import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MemoramaController } from './memorama.controller';
import { MemoramaService } from './memorama.service';
import { Memorama, MemoramaSchema } from './memorama.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Memorama.name, schema: MemoramaSchema },
    ]),
  ],
  controllers: [MemoramaController],
  providers: [MemoramaService],
  exports: [MemoramaService],
})
export class MemoramaModule {}
