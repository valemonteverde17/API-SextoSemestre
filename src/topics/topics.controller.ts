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
  @Get('edit-requests')
  @ApiOperation({ summary: 'Get topics with pending edit requests (Admin only)' })
  findEditRequests() {
    return this.topicsService.findEditRequests();
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Get('status/:status')
  @ApiOperation({ summary: 'Get topics by status (Admin only)' })
  findByStatus(@Param('status') status: string) {
    return this.topicsService.findByStatus(status);
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

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('docente', 'admin')
  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit topic for approval' })
  submitForApproval(@Param('id') id: string, @Request() req) {
    return this.topicsService.submitForApproval(id, req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Patch(':id/approve-topic')
  @ApiOperation({ summary: 'Approve topic (Admin only)' })
  approveTopic(@Param('id') id: string, @Request() req) {
    return this.topicsService.approveTopic(id, req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Patch(':id/reject-topic')
  @ApiOperation({ summary: 'Reject topic (Admin only)' })
  rejectTopic(@Param('id') id: string, @Body() body: { reason?: string }, @Request() req) {
    return this.topicsService.rejectTopic(id, req.user.userId, body.reason);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('docente', 'admin')
  @Post(':id/request-edit')
  @ApiOperation({ summary: 'Request edit permission for approved topic' })
  requestEdit(@Param('id') id: string, @Request() req) {
    return this.topicsService.requestEdit(id, req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Patch(':id/approve-edit-request')
  @ApiOperation({ summary: 'Approve edit request (Admin only)' })
  approveEditRequest(@Param('id') id: string, @Request() req) {
    return this.topicsService.approveEditRequest(id, req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Patch(':id/reject-edit-request')
  @ApiOperation({ summary: 'Reject edit request (Admin only)' })
  rejectEditRequest(@Param('id') id: string, @Request() req) {
    return this.topicsService.rejectEditRequest(id, req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('docente', 'admin')
  @Post(':id/collaborators')
  @ApiOperation({ summary: 'Add collaborator to topic' })
  addCollaborator(@Param('id') id: string, @Body() body: { collaboratorId: string }, @Request() req) {
    return this.topicsService.addCollaborator(id, body.collaboratorId, req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('docente', 'admin')
  @Delete(':id/collaborators/:collaboratorId')
  @ApiOperation({ summary: 'Remove collaborator from topic' })
  removeCollaborator(@Param('id') id: string, @Param('collaboratorId') collaboratorId: string, @Request() req) {
    return this.topicsService.removeCollaborator(id, collaboratorId, req.user.userId);
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