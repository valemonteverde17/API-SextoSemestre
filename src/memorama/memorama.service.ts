import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Memorama, MemoramaDocument } from './memorama.schema';
import { CreateMemoramaDto } from './dto/create-memorama.dto';
import { UpdateMemoramaDto } from './dto/update-memorama.dto';

@Injectable()
export class MemoramaService {
  constructor(
    @InjectModel(Memorama.name) private memoramaModel: Model<MemoramaDocument>,
  ) {}

  async create(createMemoramaDto: CreateMemoramaDto): Promise<Memorama> {
    const newPair = new this.memoramaModel(createMemoramaDto);
    return newPair.save();
  }

  async findAll(): Promise<Memorama[]> {
    return this.memoramaModel.find().populate('topic_id').exec();
  }

  async findByTopic(topicId: string, difficulty?: string): Promise<Memorama[]> {
    const filter: any = { topic_id: topicId, isActive: true };
    if (difficulty) {
      filter.difficulty = difficulty;
    }
    return this.memoramaModel.find(filter).exec();
  }

  async findOne(id: string): Promise<Memorama> {
    const pair = await this.memoramaModel.findById(id).exec();
    if (!pair) {
      throw new NotFoundException(`Memorama pair with ID ${id} not found`);
    }
    return pair;
  }

  async update(
    id: string,
    updateMemoramaDto: UpdateMemoramaDto,
  ): Promise<Memorama> {
    const updatedPair = await this.memoramaModel
      .findByIdAndUpdate(id, updateMemoramaDto, { new: true })
      .exec();
    if (!updatedPair) {
      throw new NotFoundException(`Memorama pair with ID ${id} not found`);
    }
    return updatedPair;
  }

  async remove(id: string): Promise<Memorama> {
    const deletedPair = await this.memoramaModel.findByIdAndDelete(id).exec();
    if (!deletedPair) {
      throw new NotFoundException(`Memorama pair with ID ${id} not found`);
    }
    return deletedPair;
  }
}
