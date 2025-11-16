import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ScoresService } from './scores.service';
import { CreateScoreDto } from './dto/create-score.dto';
import { UpdateScoreDto } from './dto/update-score.dto';

@Controller('scores')
export class ScoresController {
  constructor(private readonly scoresService: ScoresService) {}

  @Post()
  create(@Body() createScoreDto: CreateScoreDto) {
    return this.scoresService.create(createScoreDto);
  }

  @Get()
  findAll() {
    return this.scoresService.findAll();
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.scoresService.findByUser(userId);
  }

  @Get('quiz-set/:quizSetId')
  findByQuizSet(@Param('quizSetId') quizSetId: string) {
    return this.scoresService.findByQuizSet(quizSetId);
  }

  @Get('topic/:topicId')
  findByTopic(@Param('topicId') topicId: string) {
    return this.scoresService.findByTopic(topicId);
  }

  @Get('ranking/global')
  getGlobalRanking() {
    return this.scoresService.getGlobalRanking();
  }

  @Get('ranking/quiz-set/:quizSetId')
  getQuizSetRanking(@Param('quizSetId') quizSetId: string) {
    return this.scoresService.getQuizSetRanking(quizSetId);
  }

  @Get('stats/:userId')
  getUserStats(@Param('userId') userId: string) {
    return this.scoresService.getUserStats(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.scoresService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateScoreDto: UpdateScoreDto) {
    return this.scoresService.update(id, updateScoreDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.scoresService.remove(id);
  }
}
