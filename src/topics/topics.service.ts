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

    // Crear un objeto con los datos a insertar
    const newTopicData: any = {
      ...createTopicDto,
      category_id: createTopicDto.category_id ? new Types.ObjectId(createTopicDto.category_id) : undefined,
      created_by: new Types.ObjectId(createTopicDto.created_by),
      organization_id: createTopicDto.organization_id ? new Types.ObjectId(createTopicDto.organization_id) : undefined,
      status: createTopicDto.status || 'draft',
      visibility: createTopicDto.visibility || 'public',
      is_editing: true,
      version: 1
    };

    const newTopic = new this.topicsModel(newTopicData);

    try {
      return await newTopic.save();
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll(query?: any): Promise<Topics[]> {
    const filter: any = {};
    
    // Filtrar por categoría
    if (query?.category) {
      filter.category_id = new Types.ObjectId(query.category);
    }
    
    // Filtrar por estado
    if (query?.status) {
      filter.status = query.status;
    }
    
    // Filtrar por organización
    if (query?.organization_id) {
      filter.organization_id = new Types.ObjectId(query.organization_id);
    }
    
    // Filtrar por visibilidad
    if (query?.visibility) {
      filter.visibility = query.visibility;
    }

    return this.topicsModel
      .find(filter)
      .populate('created_by', 'user_name email')
      .populate('organization_id', 'name code')
      .populate('reviewed_by', 'user_name')
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Obtener temas según el rol y organización del usuario
   */
  async findByUserPermissions(userId: string, userRole: string, organizationId?: string): Promise<Topics[]> {
    const filter: any = {};

    if (userRole === 'estudiante') {
      // Estudiantes solo ven temas aprobados
      filter.status = 'approved';
      
      if (organizationId) {
        // Estudiantes de organización ven temas de su org + públicos
        filter.$or = [
          { organization_id: new Types.ObjectId(organizationId) },
          { visibility: 'public' }
        ];
      } else {
        // Estudiantes independientes solo ven públicos
        filter.visibility = 'public';
      }
    } else if (userRole === 'docente') {
      // Docentes ven sus propios temas + aprobados de su org
      if (organizationId) {
        filter.$or = [
          { created_by: new Types.ObjectId(userId) },
          { organization_id: new Types.ObjectId(organizationId), status: 'approved' }
        ];
      } else {
        // Docentes independientes solo ven sus temas + públicos aprobados
        filter.$or = [
          { created_by: new Types.ObjectId(userId) },
          { visibility: 'public', status: 'approved' }
        ];
      }
    } else if (userRole === 'revisor' || userRole === 'admin') {
      // Revisores y admins ven todo de su organización
      if (organizationId) {
        filter.organization_id = new Types.ObjectId(organizationId);
      }
      // Si no tienen org, ven todo (admin global)
    }

    return this.topicsModel
      .find(filter)
      .populate('created_by', 'user_name email')
      .populate('organization_id', 'name code')
      .populate('reviewed_by', 'user_name')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findMyTopics(userId: string): Promise<Topics[]> {
    return this.topicsModel
      .find({ created_by: new Types.ObjectId(userId) })
      .populate('organization_id', 'name code')
      .populate('reviewed_by', 'user_name')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Topics> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid topic ID');
    }

    const topic = await this.topicsModel
      .findById(id)
      .populate('created_by', 'user_name email role')
      .populate('organization_id', 'name code')
      .populate('reviewed_by', 'user_name email')
      .exec();
      
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
      .populate('created_by', 'user_name email role')
      .populate('organization_id', 'name code')
      .populate('reviewed_by', 'user_name email')
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