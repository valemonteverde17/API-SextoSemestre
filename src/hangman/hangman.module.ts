import { Module } from '@nestjs/common';
import { HangmanService } from './hangman.service';
import { HangmanController } from './hangman.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Hangman, HangmanSchema } from './hangman.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Hangman.name, schema: HangmanSchema }])
  ],
  controllers: [HangmanController],
  providers: [HangmanService]
})
export class HangmanModule {}