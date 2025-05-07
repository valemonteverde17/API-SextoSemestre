import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ResultService } from './result.service';
import { CreateResultDto } from './dto/create-result.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Resultados')
@Controller('results')
export class ResultController {
  constructor(private readonly resultService: ResultService) {}

  @Post()
  create(@Body() createResultDto: CreateResultDto) {
    return this.resultService.create(createResultDto);
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.resultService.findByUser(userId);
  }

  @Get('score/:userId/:topicId')
  getScore(@Param('userId') userId: string, @Param('topicId') topicId: string) {
    return this.resultService.getScoreByTopic(userId, topicId);
  }
  
  @Get('ranking/global')
  getRanking() {
    return this.resultService.getGlobalRanking();
}

}
