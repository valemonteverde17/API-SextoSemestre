import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TopicsModule } from './topics/topics.module';
import { MongooseModule } from '@nestjs/mongoose';
import { QuizModule } from './quiz/quiz.module';
import { QuizSetModule } from './quiz-set/quiz-set.module';
import { ResultModule } from './result/result.module';
import { HangmanModule } from './hangman/hangman.module';
import { ConfigModule } from '@nestjs/config';
import { MemoramaModule } from './memorama/memorama.module';
import { ScoresModule } from './scores/scores.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    TopicsModule,
    UsersModule,
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.MONGO_URI,
      }),
    }),
    QuizModule,
    QuizSetModule,
    ResultModule,
    HangmanModule,
    MemoramaModule,
    ScoresModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
