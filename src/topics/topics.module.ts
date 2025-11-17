import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Topics, TopicsSchema } from './topics.schema';
import { TopicsService } from './topics.service';
import { TopicsController } from './topics.controller';
import { Quiz, QuizSchema } from '../quiz/quiz.schema';
import { ApprovalService } from '../common/services/approval.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Topics.name, schema: TopicsSchema, collection: 'Topics' },
      { name: Quiz.name, schema: QuizSchema },
    ]),
  ],
  controllers: [TopicsController],
  providers: [TopicsService, ApprovalService],
  exports: [TopicsService, ApprovalService],
})
export class TopicsModule {}