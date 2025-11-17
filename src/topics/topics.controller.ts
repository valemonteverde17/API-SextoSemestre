import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { TopicsService } from './topics.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { ApiTags, ApiResponse, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { OwnershipGuard } from '../common/guards/ownership.guard';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import { ApprovalService } from '../common/services/approval.service';

@ApiTags('Topics') 
@ApiBearerAuth() 
@Controller('topics')
@UseGuards(AuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ transform: true })) 
export class TopicsController {
  constructor(
    private readonly topicsService: TopicsService,
    private readonly approvalService: ApprovalService
  ) {}

  @Roles('docente', 'admin')
  @Post()
  @ApiOperation({ summary: 'Create a new topic' })
  @ApiResponse({ status: 201, description: 'Topic successfully created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createTopicDto: CreateTopicDto, @GetUser('_id') userId: string) {
    createTopicDto.created_by = userId;
    return this.topicsService.create(createTopicDto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all topics (filtered by user permissions)' })
  @ApiResponse({ status: 200, description: 'List of topics' })
  findAll(@Query() query: any, @GetUser() user?: any) {
    if (user) {
      return this.topicsService.findByUserPermissions(
        user._id,
        user.role,
        user.organization_id
      );
    }
    // Si no hay usuario (público), solo temas aprobados y públicos
    return this.topicsService.findAll({ status: 'approved', visibility: 'public' });
  }

  @Roles('docente')
  @Get('my-topics')
  @ApiOperation({ summary: 'Get topics created by current user' })
  @ApiResponse({ status: 200, description: 'List of user topics' })
  getMyTopics(@GetUser('_id') userId: string) {
    return this.topicsService.findMyTopics(userId);
  }

  @Roles('admin', 'revisor')
  @Get('pending-review')
  @ApiOperation({ summary: 'Get topics pending review' })
  @ApiResponse({ status: 200, description: 'List of pending topics' })
  getPendingReview(@GetUser('organization_id') orgId?: string) {
    return this.approvalService.getPendingTopics(orgId);
  }

  @Roles('admin', 'revisor')
  @Get('stats')
  @ApiOperation({ summary: 'Get approval statistics' })
  @ApiResponse({ status: 200, description: 'Approval statistics' })
  getStats(@GetUser('organization_id') orgId?: string) {
    return this.approvalService.getApprovalStats(orgId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get topic by ID' })
  @ApiResponse({ status: 200, description: 'Topic found' })
  @ApiResponse({ status: 404, description: 'Topic not found' })
  findOne(@Param('id') id: string) {
    return this.topicsService.findOne(id);
  }

  @UseGuards(OwnershipGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update topic information' })
  @ApiResponse({ status: 200, description: 'Topic updated' })
  @ApiResponse({ status: 404, description: 'Topic not found' })
  update(@Param('id') id: string, @Body() updateTopicDto: UpdateTopicDto) {
    return this.topicsService.update(id, updateTopicDto);
  }

  @Roles('docente')
  @Post(':id/submit-review')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit topic for review' })
  @ApiResponse({ status: 200, description: 'Topic submitted for review' })
  @ApiResponse({ status: 400, description: 'Topic cannot be submitted' })
  submitForReview(@Param('id') id: string, @GetUser('_id') userId: string) {
    return this.approvalService.submitTopicForReview(id, userId);
  }

  @Roles('admin', 'revisor')
  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve a topic' })
  @ApiResponse({ status: 200, description: 'Topic approved' })
  @ApiResponse({ status: 400, description: 'Topic is not pending review' })
  approveTopic(
    @Param('id') id: string,
    @GetUser('_id') reviewerId: string,
    @Body() body?: { comments?: string }
  ) {
    return this.approvalService.approveTopic(id, reviewerId, body?.comments);
  }

  @Roles('admin', 'revisor')
  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject a topic' })
  @ApiResponse({ status: 200, description: 'Topic rejected' })
  @ApiResponse({ status: 400, description: 'Comments are required' })
  rejectTopic(
    @Param('id') id: string,
    @GetUser('_id') reviewerId: string,
    @Body() body: { comments: string }
  ) {
    return this.approvalService.rejectTopic(id, reviewerId, body.comments);
  }

  @Roles('admin', 'revisor')
  @Post(':id/request-changes')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request changes to a topic' })
  @ApiResponse({ status: 200, description: 'Changes requested' })
  @ApiResponse({ status: 400, description: 'Comments are required' })
  requestChanges(
    @Param('id') id: string,
    @GetUser('_id') reviewerId: string,
    @Body() body: { comments: string }
  ) {
    return this.approvalService.requestTopicChanges(id, reviewerId, body.comments);
  }

  @Roles('admin')
  @Post(':id/archive')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Archive a topic' })
  @ApiResponse({ status: 200, description: 'Topic archived' })
  archiveTopic(@Param('id') id: string) {
    return this.approvalService.archiveTopic(id);
  }

  @Roles('admin')
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