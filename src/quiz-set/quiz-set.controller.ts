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
  UseGuards,
} from '@nestjs/common';
import { QuizSetService } from './quiz-set.service';
import { CreateQuizSetDto } from './dto/create-quiz-set.dto';
import { UpdateQuizSetDto } from './dto/update-quiz-set.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('quiz-sets')
@Controller('quiz-sets')
export class QuizSetController {
  constructor(private readonly quizSetService: QuizSetService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('docente', 'admin')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create quiz set (Docente/Admin only)' })
  create(@Body() createQuizSetDto: CreateQuizSetDto, @GetUser() user: any) {
    return this.quizSetService.create(createQuizSetDto, user._id, user.role);
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

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('docente', 'admin')
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update quiz set (Docente/Admin only)' })
  update(
    @Param('id') id: string,
    @Body() updateQuizSetDto: UpdateQuizSetDto,
    @GetUser() user: any,
  ) {
    return this.quizSetService.update(id, updateQuizSetDto, user);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('docente', 'admin')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soft delete quiz set (Docente/Admin only)' })
  remove(@Param('id') id: string, @GetUser() user: any) {
    return this.quizSetService.remove(id, user);
  }
}
