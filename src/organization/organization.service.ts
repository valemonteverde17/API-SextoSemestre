import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { Organization, OrganizationDocument } from './organization.schema';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectModel(Organization.name) private organizationModel: Model<OrganizationDocument>,
  ) {}

  async create(createOrganizationDto: CreateOrganizationDto): Promise<Organization> {
    // Verificar si el código ya existe
    const existingOrg = await this.organizationModel.findOne({ 
      code: createOrganizationDto.code 
    }).exec();
    
    if (existingOrg) {
      throw new ConflictException('Organization code already exists');
    }

    const newOrganization = new this.organizationModel({
      ...createOrganizationDto,
      admin_id: new Types.ObjectId(createOrganizationDto.admin_id),
    });

    try {
      return await newOrganization.save();
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll(): Promise<Organization[]> {
    return this.organizationModel.find().populate('admin_id', 'user_name role').exec();
  }

  async findOne(id: string): Promise<Organization> {
    const organization = await this.organizationModel
      .findById(id)
      .populate('admin_id', 'user_name role')
      .exec();
    
    if (!organization) {
      throw new NotFoundException(`Organization with id ${id} not found`);
    }
    
    return organization;
  }

  async findByCode(code: string): Promise<Organization> {
    const organization = await this.organizationModel
      .findOne({ code })
      .populate('admin_id', 'user_name role')
      .exec();
    
    if (!organization) {
      throw new NotFoundException(`Organization with code ${code} not found`);
    }
    
    return organization;
  }

  async findByAdmin(adminId: string): Promise<Organization[]> {
    return this.organizationModel
      .find({ admin_id: new Types.ObjectId(adminId) })
      .exec();
  }

  async update(id: string, updateOrganizationDto: UpdateOrganizationDto): Promise<Organization> {
    // Si se actualiza el código, verificar que no exista
    if (updateOrganizationDto.code) {
      const existingOrg = await this.organizationModel.findOne({ 
        code: updateOrganizationDto.code,
        _id: { $ne: id }
      }).exec();
      
      if (existingOrg) {
        throw new ConflictException('Organization code already exists');
      }
    }

    const updateData: any = { ...updateOrganizationDto };
    if (updateOrganizationDto.admin_id) {
      updateData.admin_id = new Types.ObjectId(updateOrganizationDto.admin_id);
    }

    const updatedOrganization = await this.organizationModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('admin_id', 'user_name role')
      .exec();

    if (!updatedOrganization) {
      throw new NotFoundException(`Organization with id ${id} not found`);
    }
    
    return updatedOrganization;
  }

  async remove(id: string): Promise<Organization> {
    const deletedOrganization = await this.organizationModel.findByIdAndDelete(id).exec();
    
    if (!deletedOrganization) {
      throw new NotFoundException(`Organization with id ${id} not found`);
    }
    
    return deletedOrganization;
  }

  async getMemberCount(organizationId: string): Promise<{ students: number; teachers: number; total: number }> {
    // Este método se implementará cuando actualicemos el Users service
    // Por ahora retorna valores por defecto
    return {
      students: 0,
      teachers: 0,
      total: 0
    };
  }
}
