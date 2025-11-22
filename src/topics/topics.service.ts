import { Injectable, NotFoundException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
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

  async create(createTopicDto: CreateTopicDto, userId: string, role: string): Promise<Topics> {
    const existingTopic = await this.topicsModel.findOne({ topic_name: createTopicDto.topic_name }).exec();
    if (existingTopic) {
      throw new ConflictException('Topic name already exists');
    }

    const newTopicData = {
      ...createTopicDto,
      category_id: createTopicDto.category_id ? new Types.ObjectId(createTopicDto.category_id) : undefined,
      created_by: new Types.ObjectId(userId),
      is_approved: role === 'admin', // Admin topics are auto-approved
      history: [{
        date: new Date(),
        user: new Types.ObjectId(userId),
        action: 'create'
      }]
    };

    const newTopic = new this.topicsModel(newTopicData);

    try {
      return await newTopic.save();
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll(query?: any): Promise<Topics[]> {
    const filter: any = { is_deleted: false, is_approved: true }; // Only show active and approved
    if (query?.category) {
      filter.category_id = new Types.ObjectId(query.category);
    }
    if (query?.search) {
        filter.topic_name = { $regex: query.search, $options: 'i' };
    }
    // Si se pasa ?all=true (para admin), ignoramos is_approved
    if (query?.all === 'true') {
        delete filter.is_approved;
    }
    return this.topicsModel.find(filter).populate('created_by', 'user_name').exec();
  }
  
  async findTrash(): Promise<Topics[]> {
      return this.topicsModel.find({ is_deleted: true }).populate('deleted_by', 'user_name').exec();
  }

  async findPending(): Promise<Topics[]> {
      return this.topicsModel.find({ is_deleted: false, is_approved: false }).populate('created_by', 'user_name').exec();
  }

  async approve(id: string): Promise<Topics> {
      const topic = await this.topicsModel.findById(id).exec();
      if (!topic) throw new NotFoundException(`Topic with id ${id} not found`);
      topic.is_approved = true;
      return await topic.save();
  }

  async findOne(id: string): Promise<Topics> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid topic ID');
    }

    const topic = await this.topicsModel.findOne({ _id: id, is_deleted: false }).populate('created_by', 'user_name').exec();
    if (!topic) {
      throw new NotFoundException(`Topic with id ${id} not found`);
    }
    return topic;
  }

  async findByName(topic_name: string): Promise<Topics> {
    const topic = await this.topicsModel.findOne({ topic_name, is_deleted: false }).exec();
    if (!topic) {
      throw new NotFoundException(`Topic with name ${topic_name} not found`);
    }
    return topic;
  }

  async update(id: string, updateTopicDto: UpdateTopicDto, user: any): Promise<Topics> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid topic ID');
    }

    const topic = await this.topicsModel.findById(id).exec();
    if (!topic) throw new NotFoundException(`Topic with id ${id} not found`);

    // Check permissions
    const isOwner = topic.created_by?.toString() === user.userId;
    const isAdmin = user.role === 'admin';
    const canEdit = isOwner || isAdmin || (topic.edit_permissions && topic.edit_permissions.some(uid => uid.toString() === user.userId));

    if (!canEdit) {
        throw new ForbiddenException('You do not have permission to edit this topic');
    }

    if (updateTopicDto.category_id) {
      updateTopicDto.category_id = new Types.ObjectId(updateTopicDto.category_id) as any;
    }

    if (updateTopicDto.topic_name) {
      const existingTopic = await this.topicsModel.findOne({ topic_name: updateTopicDto.topic_name }).exec();
      if (existingTopic && existingTopic._id.toString() !== id) {
        throw new ConflictException('Topic name already exists');
      }
    }

    const historyEntry = {
        date: new Date(),
        user: new Types.ObjectId(user.userId),
        action: 'update'
    };

    const updatedTopic = await this.topicsModel
      .findByIdAndUpdate(
          id, 
          { 
              $set: updateTopicDto, 
              $push: { history: historyEntry } 
          }, 
          { new: true }
      )
      .exec();

    if (!updatedTopic) {
        throw new NotFoundException(`Topic with id ${id} not found`);
    }

    return updatedTopic;
  }

  async remove(id: string, user: any): Promise<Topics> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid topic ID');
    }
    
    const topic = await this.topicsModel.findById(id).exec();
    if (!topic) throw new NotFoundException(`Topic with id ${id} not found`);

    const isOwner = topic.created_by?.toString() === user.userId;
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
        throw new ForbiddenException('Only the owner or admin can delete this topic');
    }

    // Soft Delete
    topic.is_deleted = true;
    topic.deleted_at = new Date();
    topic.deleted_by = new Types.ObjectId(user.userId);
    
    return await topic.save();
  }

  async restore(id: string): Promise<Topics> {
      const topic = await this.topicsModel.findById(id).exec();
      if (!topic) throw new NotFoundException(`Topic with id ${id} not found`);
      
      topic.is_deleted = false;
      topic.deleted_at = undefined;
      topic.deleted_by = undefined;
      
      return await topic.save();
  }
}