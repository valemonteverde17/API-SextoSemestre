import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { QuizSet, QuizSetDocument } from './quiz-set.schema';
import { CreateQuizSetDto } from './dto/create-quiz-set.dto';
import { UpdateQuizSetDto } from './dto/update-quiz-set.dto';

@Injectable()
export class QuizSetService {
  constructor(
    @InjectModel(QuizSet.name) private quizSetModel: Model<QuizSetDocument>,
  ) {}

  async create(createQuizSetDto: CreateQuizSetDto): Promise<QuizSet> {
    const newQuizSet = new this.quizSetModel(createQuizSetDto);
    return newQuizSet.save();
  }

  async findAll(): Promise<QuizSet[]> {
    return this.quizSetModel.find().populate('topic_id').exec();
  }

  async findOne(id: string): Promise<QuizSet> {
    const quizSet = await this.quizSetModel.findById(id).populate('topic_id').exec();
    if (!quizSet) {
      throw new NotFoundException(`QuizSet with ID ${id} not found`);
    }
    return quizSet;
  }

  async findByTopic(topicId: string): Promise<QuizSet[]> {
    return this.quizSetModel.find({ topic_id: topicId }).populate('topic_id').exec();
  }

  async update(id: string, updateQuizSetDto: UpdateQuizSetDto): Promise<QuizSet> {
    const updatedQuizSet = await this.quizSetModel
      .findByIdAndUpdate(id, updateQuizSetDto, { new: true })
      .exec();
    if (!updatedQuizSet) {
      throw new NotFoundException(`QuizSet with ID ${id} not found`);
    }
    return updatedQuizSet;
  }

  async remove(id: string): Promise<QuizSet> {
    const deletedQuizSet = await this.quizSetModel.findByIdAndDelete(id).exec();
    if (!deletedQuizSet) {
      throw new NotFoundException(`QuizSet with ID ${id} not found`);
    }
    return deletedQuizSet;
  }
}
