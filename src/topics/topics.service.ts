import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { Topics, TopicsDocument } from './topics.schema';

@Injectable()
export class TopicsService {
  constructor(
    @InjectModel(Topics.name) private topicsModel: Model<TopicsDocument>,
  ) {}

  async create(createTopicDto: CreateTopicDto): Promise<Topics> {
    // Verificar si el nombre del tema ya existe
    const existingTopic = await this.topicsModel.findOne({ topic_name: createTopicDto.topic_name }).exec();
    if (existingTopic) {
      throw new ConflictException('Topic name already exists');
    }

    // Crear un objeto con los datos a insertar, convirtiendo category_id a ObjectId si se proporciona
    const newTopicData = {
      ...createTopicDto,
      category_id: createTopicDto.category_id ? new Types.ObjectId(createTopicDto.category_id) : undefined,
    };

    const newTopic = new this.topicsModel(newTopicData);

    try {
      return await newTopic.save();
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll(query?: any): Promise<Topics[]> {
    // Si se pasa un parámetro "category", filtra por category_id convertido a ObjectId
    const filter = query?.category ? { category_id: new Types.ObjectId(query.category) } : {};
    return this.topicsModel.find(filter).exec();
  }

  async findOne(id: string): Promise<Topics> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid topic ID');
    }

    const topic = await this.topicsModel.findById(id).exec();
    if (!topic) {
      throw new NotFoundException(`Topic with id ${id} not found`);
    }
    return topic;
  }

  async findByName(topic_name: string): Promise<Topics> {
    const topic = await this.topicsModel.findOne({ topic_name }).exec();
    if (!topic) {
      throw new NotFoundException(`Topic with name ${topic_name} not found`);
    }
    return topic;
  }

  async update(id: string, updateTopicDto: UpdateTopicDto): Promise<Topics> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid topic ID');
    }

    // Si se actualiza el category_id, convertirlo a ObjectId
    if (updateTopicDto.category_id) {
      updateTopicDto.category_id = new Types.ObjectId(updateTopicDto.category_id) as any;
    }

    // Si se actualiza el topic_name, verificar que no exista otro tema con el mismo nombre
    if (updateTopicDto.topic_name) {
      const existingTopic = await this.topicsModel.findOne({ topic_name: updateTopicDto.topic_name }).exec();
      if (existingTopic && existingTopic._id.toString() !== id) {
        throw new ConflictException('Topic name already exists');
      }
    }

    const updatedTopic = await this.topicsModel
      .findByIdAndUpdate(id, updateTopicDto, { new: true })
      .exec();

    if (!updatedTopic) {
      throw new NotFoundException(`Topic with id ${id} not found`);
    }
    return updatedTopic;
  }

  async remove(id: string): Promise<Topics> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid topic ID');
    }

    const deletedTopic = await this.topicsModel.findByIdAndDelete(id).exec();
    if (!deletedTopic) {
      throw new NotFoundException(`Topic with id ${id} not found`);
    }
    return deletedTopic;
  }
}