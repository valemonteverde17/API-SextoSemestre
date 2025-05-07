import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Quiz, QuizDocument } from './quiz.schema';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';

@Injectable()
export class QuizService {
  constructor(
    @InjectModel(Quiz.name) private quizModel: Model<QuizDocument>
  ) {}

  async create(dto: CreateQuizDto): Promise<Quiz> {
    const quiz = new this.quizModel(dto);
    return quiz.save();
  }

  async findAll(): Promise<Quiz[]> {
    return this.quizModel.find().populate('topic_id').exec();
  }

  async findByTopic(topicId: string): Promise<Quiz[]> {
    return this.quizModel.find({ topic_id: topicId }).exec();
  }

  async findOne(id: string): Promise<Quiz> {
    const quiz = await this.quizModel.findById(id).exec();
    if (!quiz) throw new NotFoundException(`Quiz con id ${id} no encontrado`);
    return quiz;
  }

  async update(id: string, dto: UpdateQuizDto): Promise<Quiz> {
    const quiz = await this.quizModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!quiz) throw new NotFoundException(`Quiz con id ${id} no encontrado`);
    return quiz;
  }

  async remove(id: string): Promise<Quiz> {
    const quiz = await this.quizModel.findByIdAndDelete(id).exec();
    if (!quiz) throw new NotFoundException(`Quiz con id ${id} no encontrado`);
    return quiz;
  }
}
