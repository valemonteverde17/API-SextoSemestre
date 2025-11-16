import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuizSetController } from './quiz-set.controller';
import { QuizSetService } from './quiz-set.service';
import { QuizSet, QuizSetSchema } from './quiz-set.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: QuizSet.name, schema: QuizSetSchema }]),
  ],
  controllers: [QuizSetController],
  providers: [QuizSetService],
  exports: [QuizSetService],
})
export class QuizSetModule {}
