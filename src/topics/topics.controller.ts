import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe, Query } from '@nestjs/common';
import { TopicsService } from './topics.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { ApiTags, ApiResponse, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Topics') 
@ApiBearerAuth() 
@Controller('topics')
@UsePipes(new ValidationPipe({ transform: true })) 
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new topic' })
  @ApiResponse({ status: 201, description: 'Topic successfully created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createTopicDto: CreateTopicDto) {
    return this.topicsService.create(createTopicDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all topics' })
  @ApiResponse({ status: 200, description: 'List of topics' })
  findAll(@Query() query: any) {
    return this.topicsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get topic by ID' })
  @ApiResponse({ status: 200, description: 'Topic found' })
  @ApiResponse({ status: 404, description: 'Topic not found' })
  findOne(@Param('id') id: string) {
    return this.topicsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update topic information' })
  @ApiResponse({ status: 200, description: 'Topic updated' })
  @ApiResponse({ status: 404, description: 'Topic not found' })
  update(@Param('id') id: string, @Body() updateTopicDto: UpdateTopicDto) {
    return this.topicsService.update(id, updateTopicDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a topic' })
  @ApiResponse({ status: 200, description: 'Topic deleted' })
  @ApiResponse({ status: 404, description: 'Topic not found' })
  remove(@Param('id') id: string) {
    return this.topicsService.remove(id);
  }

  // endpoint
  @Get('name/:topic_name')
  @ApiOperation({ summary: 'Get topic by name' })
  findByName(@Param('topic_name') topic_name: string) {
    return this.topicsService.findByName(topic_name);
  }
}