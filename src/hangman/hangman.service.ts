import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateHangmanDto } from './dto/create-hangman.dto';
import { UpdateHangmanDto } from './dto/update-hangman.dto';
import { Hangman } from './hangman.schema';

@Injectable()
export class HangmanService {
  constructor(
    @InjectModel(Hangman.name)
    private readonly hangmanModel: Model<Hangman>,
  ) {}

  async create(createHangmanDto: CreateHangmanDto) {
    const newEntry = new this.hangmanModel(createHangmanDto);
    return newEntry.save();
  }

  async findAll(query: any) {
    const filter: any = {};
    if (query.topic_id) filter.topic_id = query.topic_id;
    if (query.title) filter.title = query.title;
    return this.hangmanModel.find(filter).exec();
  }

  async findOne(id: string) {
    return this.hangmanModel.findById(id).exec();
  }

  async update(id: string, updateHangmanDto: UpdateHangmanDto) {
    return this.hangmanModel.findByIdAndUpdate(id, updateHangmanDto, {
      new: true,
    });
  }

  async remove(id: string) {
    return this.hangmanModel.findByIdAndDelete(id);
  }
}
