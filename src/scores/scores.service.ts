import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Score, ScoreDocument } from './scores.schema';
import { CreateScoreDto } from './dto/create-score.dto';
import { UpdateScoreDto } from './dto/update-score.dto';

@Injectable()
export class ScoresService {
  constructor(
    @InjectModel(Score.name) private scoreModel: Model<ScoreDocument>,
  ) {}

  async create(createScoreDto: CreateScoreDto): Promise<Score> {
    // Validar IDs
    if (!Types.ObjectId.isValid(createScoreDto.user_id)) {
      throw new BadRequestException('ID de usuario inválido');
    }
    if (!Types.ObjectId.isValid(createScoreDto.quiz_set_id)) {
      throw new BadRequestException('ID de quiz set inválido');
    }
    if (!Types.ObjectId.isValid(createScoreDto.topic_id)) {
      throw new BadRequestException('ID de tema inválido');
    }

    // Verificar si ya existe un score para este usuario y quiz
    const existing = await this.scoreModel.findOne({
      user_id: new Types.ObjectId(createScoreDto.user_id),
      quiz_set_id: new Types.ObjectId(createScoreDto.quiz_set_id),
    });

    if (existing) {
      // Actualizar el score existente (solo si el nuevo es mejor o más reciente)
      const updated = await this.scoreModel.findByIdAndUpdate(
        existing._id,
        {
          ...createScoreDto,
          user_id: new Types.ObjectId(createScoreDto.user_id),
          quiz_set_id: new Types.ObjectId(createScoreDto.quiz_set_id),
          topic_id: new Types.ObjectId(createScoreDto.topic_id),
          completed_at: new Date(),
        },
        { new: true },
      ).populate('user_id', 'user_name role')
       .populate('quiz_set_id', 'title')
       .populate('topic_id', 'topic_name')
       .exec();
      
      if (!updated) {
        throw new NotFoundException('No se pudo actualizar el score');
      }
      
      return updated;
    }

    // Crear nuevo score
    const newScore = new this.scoreModel({
      ...createScoreDto,
      user_id: new Types.ObjectId(createScoreDto.user_id),
      quiz_set_id: new Types.ObjectId(createScoreDto.quiz_set_id),
      topic_id: new Types.ObjectId(createScoreDto.topic_id),
      completed_at: new Date(),
    });

    const saved = await newScore.save();
    const populated = await this.scoreModel.findById(saved._id)
      .populate('user_id', 'user_name role')
      .populate('quiz_set_id', 'title')
      .populate('topic_id', 'topic_name')
      .exec();
    
    if (!populated) {
      throw new NotFoundException('No se pudo crear el score');
    }
    
    return populated;
  }

  async findAll(): Promise<Score[]> {
    return this.scoreModel.find()
      .populate('user_id', 'user_name role')
      .populate('quiz_set_id', 'title')
      .populate('topic_id', 'topic_name')
      .sort({ score: -1, time_taken: 1 })
      .exec();
  }

  async findByUser(userId: string): Promise<Score[]> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('ID de usuario inválido');
    }

    return this.scoreModel.find({ user_id: new Types.ObjectId(userId) })
      .populate('quiz_set_id', 'title')
      .populate('topic_id', 'topic_name')
      .sort({ completed_at: -1 })
      .exec();
  }

  async findByQuizSet(quizSetId: string): Promise<Score[]> {
    if (!Types.ObjectId.isValid(quizSetId)) {
      throw new BadRequestException('ID de quiz set inválido');
    }

    return this.scoreModel.find({ quiz_set_id: new Types.ObjectId(quizSetId) })
      .populate('user_id', 'user_name role')
      .sort({ score: -1, time_taken: 1 })
      .exec();
  }

  async findByTopic(topicId: string): Promise<Score[]> {
    if (!Types.ObjectId.isValid(topicId)) {
      throw new BadRequestException('ID de tema inválido');
    }

    return this.scoreModel.find({ topic_id: new Types.ObjectId(topicId) })
      .populate('user_id', 'user_name role')
      .populate('quiz_set_id', 'title')
      .sort({ score: -1, time_taken: 1 })
      .exec();
  }

  async getGlobalRanking(): Promise<any[]> {
    // Ranking global: suma de puntajes por usuario
    const ranking = await this.scoreModel.aggregate([
      {
        $group: {
          _id: '$user_id',
          total_score: { $sum: '$score' },
          quizzes_completed: { $sum: 1 },
          average_score: { $avg: '$score' },
          total_time: { $sum: '$time_taken' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $project: {
          user_id: '$_id',
          user_name: '$user.user_name',
          total_score: 1,
          quizzes_completed: 1,
          average_score: { $round: ['$average_score', 2] },
          total_time: 1,
        },
      },
      {
        $sort: { total_score: -1, average_score: -1 },
      },
    ]);

    return ranking;
  }

  async getQuizSetRanking(quizSetId: string): Promise<Score[]> {
    if (!Types.ObjectId.isValid(quizSetId)) {
      throw new BadRequestException('ID de quiz set inválido');
    }

    return this.scoreModel.find({ quiz_set_id: new Types.ObjectId(quizSetId) })
      .populate('user_id', 'user_name role')
      .sort({ score: -1, time_taken: 1 })
      .limit(10)
      .exec();
  }

  async getUserStats(userId: string): Promise<any> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('ID de usuario inválido');
    }

    const scores = await this.scoreModel.find({ user_id: new Types.ObjectId(userId) });

    if (scores.length === 0) {
      return {
        total_quizzes: 0,
        average_score: 0,
        highest_score: 0,
        total_time: 0,
        total_correct: 0,
        total_questions: 0,
      };
    }

    const stats = {
      total_quizzes: scores.length,
      average_score: Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length),
      highest_score: Math.max(...scores.map(s => s.score)),
      total_time: scores.reduce((sum, s) => sum + s.time_taken, 0),
      total_correct: scores.reduce((sum, s) => sum + s.correct_answers, 0),
      total_questions: scores.reduce((sum, s) => sum + s.total_questions, 0),
    };

    return stats;
  }

  async findOne(id: string): Promise<Score> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID inválido');
    }

    const score = await this.scoreModel.findById(id)
      .populate('user_id', 'user_name role')
      .populate('quiz_set_id', 'title')
      .populate('topic_id', 'topic_name')
      .exec();

    if (!score) {
      throw new NotFoundException('Score no encontrado');
    }

    return score;
  }

  async update(id: string, updateScoreDto: UpdateScoreDto): Promise<Score> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID inválido');
    }

    const updated = await this.scoreModel.findByIdAndUpdate(
      id,
      updateScoreDto,
      { new: true },
    )
      .populate('user_id', 'user_name role')
      .populate('quiz_set_id', 'title')
      .populate('topic_id', 'topic_name')
      .exec();

    if (!updated) {
      throw new NotFoundException('Score no encontrado');
    }

    return updated;
  }

  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID inválido');
    }

    const result = await this.scoreModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException('Score no encontrado');
    }
  }
}
