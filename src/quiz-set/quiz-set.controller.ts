import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { QuizSetService } from './quiz-set.service';
import { CreateQuizSetDto } from './dto/create-quiz-set.dto';
import { UpdateQuizSetDto } from './dto/update-quiz-set.dto';

@Controller('quiz-sets')
export class QuizSetController {
  constructor(private readonly quizSetService: QuizSetService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createQuizSetDto: CreateQuizSetDto) {
    return this.quizSetService.create(createQuizSetDto);
  }

  @Get()
  findAll() {
    return this.quizSetService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quizSetService.findOne(id);
  }

  @Get('topic/:topicId')
  findByTopic(@Param('topicId') topicId: string) {
    return this.quizSetService.findByTopic(topicId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateQuizSetDto: UpdateQuizSetDto) {
    return this.quizSetService.update(id, updateQuizSetDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.quizSetService.remove(id);
  }
}
