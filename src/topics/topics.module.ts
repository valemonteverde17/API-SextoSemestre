import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Topics, TopicsSchema } from './topics.schema';
import { TopicsService } from './topics.service';
import { TopicsController } from './topics.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Topics.name, schema: TopicsSchema, collection: 'Topics' },
    ]),
  ],
  controllers: [TopicsController],
  providers: [TopicsService],
})
export class TopicsModule {}
