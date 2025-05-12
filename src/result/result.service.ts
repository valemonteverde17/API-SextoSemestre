import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Result, ResultDocument } from './result.schema';
import { CreateResultDto } from './dto/create-result.dto';

@Injectable()
export class ResultService {
  constructor(
    @InjectModel(Result.name) private resultModel: Model<ResultDocument>
  ) {}

  async create(dto: CreateResultDto): Promise<Result> {
    return new this.resultModel(dto).save();
  }

  async findByUser(userId: string): Promise<Result[]> {
    return this.resultModel.find({ user_id: userId }).populate('quiz_id').exec();
  }

async getScoreByTopic(userId: string, topicId: string): Promise<{ total: number, correct: number }> {
  const all = await this.resultModel.find({ user_id: userId }).populate({
    path: 'quiz_id',
    select: 'topic_id'  // <- Asegura que traemos solo lo necesario
  }).exec();

  // Ahora sí podemos acceder a quiz_id.topic_id porque fue "populado"
  const filtered = all.filter(r => {
    // Si por alguna razón no se populó bien, evitamos error
    const quiz = r.quiz_id as any;
    return quiz?.topic_id?.toString() === topicId;
  });

  const correct = filtered.filter(r => r.isCorrect).length;
  return { total: filtered.length, correct };
}

  async getGlobalRanking(): Promise<{ user_id: string; correct: number }[]> {
    const raw = await this.resultModel.aggregate([
      { $match: { isCorrect: true } },
      {
        $group: {
          _id: "$user_id",
          correct: { $sum: 1 }
        }
      },
      { $sort: { correct: -1 } }
    ]);
  
    return raw.map(r => ({ user_id: r._id.toString(), correct: r.correct }));
  }
  
}
