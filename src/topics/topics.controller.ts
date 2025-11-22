import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe, Query, UseGuards, Request } from '@nestjs/common';
import { TopicsService } from './topics.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { ApiTags, ApiResponse, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Topics') 
@ApiBearerAuth() 
@Controller('topics')
@UsePipes(new ValidationPipe({ transform: true })) 
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('docente', 'admin')
  @Post()
  @ApiOperation({ summary: 'Create a new topic' })
  @ApiResponse({ status: 201, description: 'Topic successfully created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createTopicDto: CreateTopicDto, @Request() req) {
    return this.topicsService.create(createTopicDto, req.user.userId, req.user.role);
  }

  @Get()
  @ApiOperation({ summary: 'Get all topics' })
  @ApiResponse({ status: 200, description: 'List of topics' })
  findAll(@Query() query: any) {
    return this.topicsService.findAll(query);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Get('trash')
  @ApiOperation({ summary: 'Get deleted topics (Admin only)' })
  findTrash() {
    return this.topicsService.findTrash();
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Get('pending')
  @ApiOperation({ summary: 'Get pending topics (Admin only)' })
  findPending() {
    return this.topicsService.findPending();
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore deleted topic (Admin only)' })
  restore(@Param('id') id: string) {
    return this.topicsService.restore(id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve pending topic (Admin only)' })
  approve(@Param('id') id: string) {
    return this.topicsService.approve(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get topic by ID' })
  @ApiResponse({ status: 200, description: 'Topic found' })
  @ApiResponse({ status: 404, description: 'Topic not found' })
  findOne(@Param('id') id: string) {
    return this.topicsService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('docente', 'admin')
  @Patch(':id')
  @ApiOperation({ summary: 'Update topic information' })
  @ApiResponse({ status: 200, description: 'Topic updated' })
  @ApiResponse({ status: 404, description: 'Topic not found' })
  update(@Param('id') id: string, @Body() updateTopicDto: UpdateTopicDto, @Request() req) {
    return this.topicsService.update(id, updateTopicDto, req.user);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('docente', 'admin')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a topic (Soft delete)' })
  @ApiResponse({ status: 200, description: 'Topic deleted' })
  @ApiResponse({ status: 404, description: 'Topic not found' })
  remove(@Param('id') id: string, @Request() req) {
    return this.topicsService.remove(id, req.user);
  }

  @Get('name/:topic_name')
  @ApiOperation({ summary: 'Get topic by name' })
  findByName(@Param('topic_name') topic_name: string) {
    return this.topicsService.findByName(topic_name);
  }
}