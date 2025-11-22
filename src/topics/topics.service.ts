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
      status: role === 'admin' ? 'approved' : 'draft', // Admin crea aprobados, docentes en borrador
      is_approved: role === 'admin', // Deprecated - mantener compatibilidad
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
    const filter: any = { is_deleted: false };
    
    // Por defecto, solo mostrar temas aprobados (para estudiantes y vista pública)
    if (!query?.all) {
      filter.status = 'approved';
    }
    
    if (query?.category) {
      filter.category_id = new Types.ObjectId(query.category);
    }
    if (query?.search) {
        filter.topic_name = { $regex: query.search, $options: 'i' };
    }
    
    // Si se pasa ?all=true (para admin/docentes), traer todos los temas sin filtro de status
    if (query?.all === 'true') {
        delete filter.status;
    }
    
    return this.topicsModel
      .find(filter)
      .populate('created_by', 'user_name')
      .populate('edit_permissions', 'user_name')
      .exec();
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

    const topic = await this.topicsModel
      .findOne({ _id: id, is_deleted: false })
      .populate('created_by', 'user_name')
      .populate('edit_permissions', 'user_name')
      .exec();
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

  async submitForApproval(id: string, userId: string): Promise<Topics> {
    const topic = await this.topicsModel.findById(id).exec();
    if (!topic) throw new NotFoundException(`Topic with id ${id} not found`);

    // Validar que sea el creador
    if (topic.created_by?.toString() !== userId) {
      throw new ForbiddenException('Only the creator can submit for approval');
    }

    // Validar estado actual
    if (topic.status !== 'draft' && topic.status !== 'editing' && topic.status !== 'rejected') {
      throw new BadRequestException(`Cannot submit topic with status: ${topic.status}`);
    }

    topic.status = 'pending_approval';
    if (!topic.history) topic.history = [];
    topic.history.push({
      date: new Date(),
      user: new Types.ObjectId(userId),
      action: 'submit_for_approval'
    });

    return await topic.save();
  }

  async approveTopic(id: string, userId: string): Promise<Topics> {
    const topic = await this.topicsModel.findById(id).exec();
    if (!topic) throw new NotFoundException(`Topic with id ${id} not found`);

    if (topic.status !== 'pending_approval') {
      throw new BadRequestException('Topic is not pending approval');
    }

    topic.status = 'approved';
    topic.is_approved = true; // Mantener compatibilidad
    topic.edit_request_pending = false; // Limpiar solicitud si existía
    if (!topic.history) topic.history = [];
    topic.history.push({
      date: new Date(),
      user: new Types.ObjectId(userId),
      action: 'approve'
    });

    return await topic.save();
  }

  async rejectTopic(id: string, userId: string, reason?: string): Promise<Topics> {
    const topic = await this.topicsModel.findById(id).exec();
    if (!topic) throw new NotFoundException(`Topic with id ${id} not found`);

    if (topic.status !== 'pending_approval') {
      throw new BadRequestException('Topic is not pending approval');
    }

    topic.status = 'rejected';
    topic.is_approved = false;
    if (!topic.history) topic.history = [];
    topic.history.push({
      date: new Date(),
      user: new Types.ObjectId(userId),
      action: `reject${reason ? `: ${reason}` : ''}`
    });

    return await topic.save();
  }

  async requestEdit(id: string, userId: string): Promise<Topics> {
    const topic = await this.topicsModel.findById(id).exec();
    if (!topic) throw new NotFoundException(`Topic with id ${id} not found`);

    // Validar que sea creador o colaborador
    const isOwner = topic.created_by?.toString() === userId;
    const isCollaborator = topic.edit_permissions?.some(uid => uid.toString() === userId);
    
    if (!isOwner && !isCollaborator) {
      throw new ForbiddenException('Only creator or collaborators can request edit');
    }

    if (topic.status !== 'approved') {
      throw new BadRequestException('Can only request edit for approved topics');
    }

    topic.edit_request_pending = true;
    topic.edit_requested_by = new Types.ObjectId(userId);
    topic.edit_requested_at = new Date();
    if (!topic.history) topic.history = [];
    topic.history.push({
      date: new Date(),
      user: new Types.ObjectId(userId),
      action: 'request_edit'
    });

    return await topic.save();
  }

  async approveEditRequest(id: string, userId: string): Promise<Topics> {
    const topic = await this.topicsModel.findById(id).exec();
    if (!topic) throw new NotFoundException(`Topic with id ${id} not found`);

    if (!topic.edit_request_pending) {
      throw new BadRequestException('No edit request pending');
    }

    topic.status = 'editing';
    topic.edit_request_pending = false;
    if (!topic.history) topic.history = [];
    topic.history.push({
      date: new Date(),
      user: new Types.ObjectId(userId),
      action: 'approve_edit_request'
    });

    return await topic.save();
  }

  async rejectEditRequest(id: string, userId: string): Promise<Topics> {
    const topic = await this.topicsModel.findById(id).exec();
    if (!topic) throw new NotFoundException(`Topic with id ${id} not found`);

    if (!topic.edit_request_pending) {
      throw new BadRequestException('No edit request pending');
    }

    topic.edit_request_pending = false;
    topic.edit_requested_by = undefined;
    topic.edit_requested_at = undefined;
    if (!topic.history) topic.history = [];
    topic.history.push({
      date: new Date(),
      user: new Types.ObjectId(userId),
      action: 'reject_edit_request'
    });

    return await topic.save();
  }

  async addCollaborator(topicId: string, collaboratorId: string, requestingUserId: string): Promise<Topics> {
    const topic = await this.topicsModel.findById(topicId).exec();
    if (!topic) throw new NotFoundException(`Topic with id ${topicId} not found`);

    // Solo creador o admin pueden añadir colaboradores
    const isOwner = topic.created_by?.toString() === requestingUserId;
    if (!isOwner) {
      throw new ForbiddenException('Only the creator can add collaborators');
    }

    // Verificar que no esté ya en la lista
    const alreadyCollaborator = topic.edit_permissions?.some(uid => uid.toString() === collaboratorId);
    if (alreadyCollaborator) {
      throw new ConflictException('User is already a collaborator');
    }

    if (!topic.edit_permissions) {
      topic.edit_permissions = [];
    }

    topic.edit_permissions.push(new Types.ObjectId(collaboratorId));
    if (!topic.history) topic.history = [];
    topic.history.push({
      date: new Date(),
      user: new Types.ObjectId(requestingUserId),
      action: `add_collaborator:${collaboratorId}`
    });

    return await topic.save();
  }

  async removeCollaborator(topicId: string, collaboratorId: string, requestingUserId: string): Promise<Topics> {
    const topic = await this.topicsModel.findById(topicId).exec();
    if (!topic) throw new NotFoundException(`Topic with id ${topicId} not found`);

    const isOwner = topic.created_by?.toString() === requestingUserId;
    if (!isOwner) {
      throw new ForbiddenException('Only the creator can remove collaborators');
    }

    topic.edit_permissions = topic.edit_permissions?.filter(uid => uid.toString() !== collaboratorId) || [];
    if (!topic.history) topic.history = [];
    topic.history.push({
      date: new Date(),
      user: new Types.ObjectId(requestingUserId),
      action: `remove_collaborator:${collaboratorId}`
    });

    return await topic.save();
  }

  async findByStatus(status: string): Promise<Topics[]> {
    return this.topicsModel.find({ status, is_deleted: false })
      .populate('created_by', 'user_name')
      .populate('edit_requested_by', 'user_name')
      .populate('edit_permissions', 'user_name')
      .exec();
  }

  async findEditRequests(): Promise<Topics[]> {
    return this.topicsModel.find({ edit_request_pending: true, is_deleted: false })
      .populate('created_by', 'user_name')
      .populate('edit_requested_by', 'user_name')
      .exec();
  }
}