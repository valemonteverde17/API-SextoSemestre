import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Topics, TopicsDocument } from '../../topics/topics.schema';
import { Quiz, QuizDocument } from '../../quiz/quiz.schema';

/**
 * Servicio centralizado para manejar el flujo de aprobación de contenido
 * Gestiona estados: draft, pending_review, approved, rejected, archived
 */
@Injectable()
export class ApprovalService {
  constructor(
    @InjectModel(Topics.name) private topicsModel: Model<TopicsDocument>,
    @InjectModel(Quiz.name) private quizModel: Model<QuizDocument>,
  ) {}

  // ==================== TOPICS ====================

  async submitTopicForReview(topicId: string, userId: string): Promise<Topics> {
    const topic = await this.topicsModel.findById(topicId).exec();
    
    if (!topic) {
      throw new NotFoundException(`Topic with id ${topicId} not found`);
    }

    // Verificar que el usuario sea el creador
    if (topic.created_by.toString() !== userId) {
      throw new BadRequestException('Only the creator can submit this topic for review');
    }

    // Verificar que esté en draft
    if (topic.status !== 'draft') {
      throw new BadRequestException(`Topic cannot be submitted. Current status: ${topic.status}`);
    }

    topic.status = 'pending_review';
    topic.is_editing = false;
    await topic.save();

    return topic;
  }

  async approveTopic(topicId: string, reviewerId: string, comments?: string): Promise<Topics> {
    const topic = await this.topicsModel.findById(topicId).exec();
    
    if (!topic) {
      throw new NotFoundException(`Topic with id ${topicId} not found`);
    }

    if (topic.status !== 'pending_review') {
      throw new BadRequestException(`Topic is not pending review. Current status: ${topic.status}`);
    }

    topic.status = 'approved';
    topic.reviewed_by = reviewerId as any;
    topic.reviewed_at = new Date();
    topic.review_comments = comments;
    topic.publishedAt = new Date();
    
    await topic.save();

    return topic;
  }

  async rejectTopic(topicId: string, reviewerId: string, comments: string): Promise<Topics> {
    const topic = await this.topicsModel.findById(topicId).exec();
    
    if (!topic) {
      throw new NotFoundException(`Topic with id ${topicId} not found`);
    }

    if (topic.status !== 'pending_review') {
      throw new BadRequestException(`Topic is not pending review. Current status: ${topic.status}`);
    }

    if (!comments) {
      throw new BadRequestException('Comments are required when rejecting a topic');
    }

    topic.status = 'rejected';
    topic.reviewed_by = reviewerId as any;
    topic.reviewed_at = new Date();
    topic.review_comments = comments;
    
    await topic.save();

    return topic;
  }

  async requestTopicChanges(topicId: string, reviewerId: string, comments: string): Promise<Topics> {
    const topic = await this.topicsModel.findById(topicId).exec();
    
    if (!topic) {
      throw new NotFoundException(`Topic with id ${topicId} not found`);
    }

    if (topic.status !== 'pending_review') {
      throw new BadRequestException(`Topic is not pending review. Current status: ${topic.status}`);
    }

    if (!comments) {
      throw new BadRequestException('Comments are required when requesting changes');
    }

    topic.status = 'draft';
    topic.is_editing = true;
    topic.reviewed_by = reviewerId as any;
    topic.reviewed_at = new Date();
    topic.review_comments = comments;
    
    await topic.save();

    return topic;
  }

  async archiveTopic(topicId: string): Promise<Topics> {
    const topic = await this.topicsModel.findById(topicId).exec();
    
    if (!topic) {
      throw new NotFoundException(`Topic with id ${topicId} not found`);
    }

    topic.status = 'archived';
    await topic.save();

    return topic;
  }

  async getPendingTopics(organizationId?: string): Promise<Topics[]> {
    const filter: any = { status: 'pending_review' };
    
    if (organizationId) {
      filter.organization_id = organizationId;
    }

    return this.topicsModel
      .find(filter)
      .populate('created_by', 'user_name email')
      .populate('organization_id', 'name code')
      .sort({ createdAt: -1 })
      .exec();
  }

  // ==================== QUIZZES ====================

  async submitQuizForReview(quizId: string, userId: string): Promise<Quiz> {
    const quiz = await this.quizModel.findById(quizId).exec();
    
    if (!quiz) {
      throw new NotFoundException(`Quiz with id ${quizId} not found`);
    }

    if (quiz.created_by.toString() !== userId) {
      throw new BadRequestException('Only the creator can submit this quiz for review');
    }

    if (quiz.status !== 'draft') {
      throw new BadRequestException(`Quiz cannot be submitted. Current status: ${quiz.status}`);
    }

    quiz.status = 'pending_review';
    await quiz.save();

    return quiz;
  }

  async approveQuiz(quizId: string, reviewerId: string): Promise<Quiz> {
    const quiz = await this.quizModel.findById(quizId).exec();
    
    if (!quiz) {
      throw new NotFoundException(`Quiz with id ${quizId} not found`);
    }

    if (quiz.status !== 'pending_review') {
      throw new BadRequestException(`Quiz is not pending review. Current status: ${quiz.status}`);
    }

    quiz.status = 'approved';
    quiz.reviewed_by = reviewerId as any;
    quiz.reviewed_at = new Date();
    
    await quiz.save();

    return quiz;
  }

  async rejectQuiz(quizId: string, reviewerId: string): Promise<Quiz> {
    const quiz = await this.quizModel.findById(quizId).exec();
    
    if (!quiz) {
      throw new NotFoundException(`Quiz with id ${quizId} not found`);
    }

    if (quiz.status !== 'pending_review') {
      throw new BadRequestException(`Quiz is not pending review. Current status: ${quiz.status}`);
    }

    quiz.status = 'rejected';
    quiz.reviewed_by = reviewerId as any;
    quiz.reviewed_at = new Date();
    
    await quiz.save();

    return quiz;
  }

  async getPendingQuizzes(organizationId?: string): Promise<Quiz[]> {
    const filter: any = { status: 'pending_review' };
    
    if (organizationId) {
      filter.organization_id = organizationId;
    }

    return this.quizModel
      .find(filter)
      .populate('created_by', 'user_name email')
      .populate('topic_id', 'topic_name')
      .sort({ createdAt: -1 })
      .exec();
  }

  // ==================== ESTADÍSTICAS ====================

  async getApprovalStats(organizationId?: string): Promise<any> {
    const filter: any = organizationId ? { organization_id: organizationId } : {};

    const [
      pendingTopics,
      approvedTopics,
      rejectedTopics,
      pendingQuizzes,
      approvedQuizzes,
      rejectedQuizzes
    ] = await Promise.all([
      this.topicsModel.countDocuments({ ...filter, status: 'pending_review' }),
      this.topicsModel.countDocuments({ ...filter, status: 'approved' }),
      this.topicsModel.countDocuments({ ...filter, status: 'rejected' }),
      this.quizModel.countDocuments({ ...filter, status: 'pending_review' }),
      this.quizModel.countDocuments({ ...filter, status: 'approved' }),
      this.quizModel.countDocuments({ ...filter, status: 'rejected' })
    ]);

    return {
      topics: {
        pending: pendingTopics,
        approved: approvedTopics,
        rejected: rejectedTopics,
        total: pendingTopics + approvedTopics + rejectedTopics
      },
      quizzes: {
        pending: pendingQuizzes,
        approved: approvedQuizzes,
        rejected: rejectedQuizzes,
        total: pendingQuizzes + approvedQuizzes + rejectedQuizzes
      }
    };
  }
}
