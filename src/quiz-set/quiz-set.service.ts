import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { QuizSet, QuizSetDocument } from './quiz-set.schema';
import { CreateQuizSetDto } from './dto/create-quiz-set.dto';
import { UpdateQuizSetDto } from './dto/update-quiz-set.dto';

@Injectable()
export class QuizSetService {
  constructor(
    @InjectModel(QuizSet.name) private quizSetModel: Model<QuizSetDocument>,
  ) {}

  async create(
    createQuizSetDto: CreateQuizSetDto,
    userId: string,
    role: string,
  ): Promise<QuizSet> {
    const newQuizSetData = {
      ...createQuizSetDto,
      created_by: new Types.ObjectId(userId),
      is_deleted: false,
    };
    const newQuizSet = new this.quizSetModel(newQuizSetData);
    return newQuizSet.save();
  }

  async findAll(): Promise<QuizSet[]> {
    return this.quizSetModel
      .find({ is_deleted: false })
      .populate('topic_id')
      .populate('created_by', 'user_name')
      .exec();
  }

  async findOne(id: string): Promise<QuizSet> {
    const quizSet = await this.quizSetModel
      .findOne({ _id: id, is_deleted: false })
      .populate('topic_id')
      .populate('created_by', 'user_name')
      .exec();
    if (!quizSet) {
      throw new NotFoundException(`QuizSet with ID ${id} not found`);
    }
    return quizSet;
  }

  async findByTopic(topicId: string): Promise<QuizSet[]> {
    return this.quizSetModel
      .find({ topic_id: topicId, is_deleted: false })
      .populate('topic_id')
      .populate('created_by', 'user_name')
      .exec();
  }

  async update(
    id: string,
    updateQuizSetDto: UpdateQuizSetDto,
    user: any,
  ): Promise<QuizSet> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid quiz set ID');
    }

    const quizSet = await this.quizSetModel.findById(id).exec();
    if (!quizSet)
      throw new NotFoundException(`QuizSet with ID ${id} not found`);

    // Check permissions: owner or admin
    const isOwner = quizSet.created_by?.toString() === user._id;
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException(
        'You do not have permission to edit this quiz set',
      );
    }

    const updatedQuizSet = await this.quizSetModel
      .findByIdAndUpdate(id, { $set: updateQuizSetDto }, { new: true })
      .exec();

    if (!updatedQuizSet) {
      throw new NotFoundException(`QuizSet with ID ${id} not found`);
    }
    return updatedQuizSet;
  }

  async remove(id: string, user: any): Promise<QuizSet> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid quiz set ID');
    }

    const quizSet = await this.quizSetModel.findById(id).exec();
    if (!quizSet)
      throw new NotFoundException(`QuizSet with ID ${id} not found`);

    // Check permissions: owner or admin
    const isOwner = quizSet.created_by?.toString() === user._id;
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException(
        'Only the owner or admin can delete this quiz set',
      );
    }

    // Soft Delete
    quizSet.is_deleted = true;
    quizSet.deleted_at = new Date();
    quizSet.deleted_by = new Types.ObjectId(user._id);

    return await quizSet.save();
  }
}
