import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Users, UsersDocument } from './users.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(Users.name) private usersModel: Model<UsersDocument>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<Users> {
    // Verificar si el username ya existe
    const existingUser = await this.usersModel.findOne({ user_name: createUserDto.user_name }).exec();
    if (existingUser) {
      throw new ConflictException('El nombre de usuario ya existe');
    }

    // Verificar si el email ya existe
    const existingEmail = await this.usersModel.findOne({ email: createUserDto.email }).exec();
    if (existingEmail) {
      throw new ConflictException('El email ya está registrado');
    }

    // Validar que el rol sea válido
    const validRoles = ['admin', 'revisor', 'docente', 'estudiante'];
    if (!validRoles.includes(createUserDto.role)) {
      throw new BadRequestException(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
    }

    // Validar organization_id según rol
    if (createUserDto.role === 'admin' && !createUserDto.organization_id) {
      throw new BadRequestException('Admin debe tener una organización asignada');
    }

    // Hashear la contraseña antes de guardarla
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    
    // Determinar el estado inicial basado en el rol
    let initialStatus = 'active';
    
    // Si es docente independiente (sin organization_id), requiere aprobación
    if (createUserDto.role === 'docente' && !createUserDto.organization_id) {
      initialStatus = 'pending';
    }
    
    // Si es admin o revisor, siempre requiere aprobación
    if (createUserDto.role === 'admin' || createUserDto.role === 'revisor') {
      initialStatus = 'pending';
    }

    const newUser = new this.usersModel({
      user_name: createUserDto.user_name,
      password: hashedPassword,
      email: createUserDto.email,
      role: createUserDto.role,
      organization_id: createUserDto.organization_id,
      status: createUserDto.status || initialStatus,
      profile: createUserDto.profile || {},
      permissions: createUserDto.permissions || {
        canReview: false,
        canManageUsers: false
      },
      createdBy: createUserDto.createdBy
    });

    try {
      return await newUser.save();
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll(query?: any): Promise<Users[]> {
    // Filtrar por query params (ej. /users?role=docente)
    const filter = query?.role ? { role: query.role } : {};
    return this.usersModel.find(filter).select('-password').exec(); // Excluir passwords por seguridad
  }

  async findOne(id: string): Promise<Users> {
    const user = await this.usersModel.findById(id).select('-password').exec();
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async findByUsername(username: string): Promise<UsersDocument | null> {
    return this.usersModel.findOne({ user_name: username }).select('+password').exec();
  }

  async findByEmail(email: string): Promise<UsersDocument | null> {
    return this.usersModel.findOne({ email }).select('+password').exec();
  }

  async findByUsernameOrEmail(identifier: string): Promise<UsersDocument | null> {
    return this.usersModel.findOne({
      $or: [
        { user_name: identifier },
        { email: identifier }
      ]
    }).select('+password').exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<Users> {
    // Si se actualiza la contraseña, hashearla
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Validar el rol si se está actualizando
    if (updateUserDto.role && !['docente', 'estudiante'].includes(updateUserDto.role)) {
      throw new BadRequestException('Invalid role. Must be "docente" or "estudiante"');
    }

    const updatedUser = await this.usersModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .select('-password')
      .exec();

    if (!updatedUser) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return updatedUser;
  }

  async remove(id: string): Promise<Users> {
    const deletedUser = await this.usersModel.findByIdAndDelete(id).select('-password').exec();
    if (!deletedUser) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return deletedUser;
  }

  // Método para validar usuario (login)
  async validateUser(username: string, pass: string): Promise<Users | null> {
    const user = await this.usersModel.findOne({ user_name: username });
    if (!user) return null;
  
    const isPasswordValid = await bcrypt.compare(pass, user.password);
    if (!isPasswordValid) return null;
  
    const userObject = user.toObject() as Partial<Users>;
    delete userObject.password;
    return userObject as Users;
  }

  // MÉTODOS DE APROBACIÓN

  async approveUser(userId: string, approvedById: string): Promise<Users> {
    const user = await this.usersModel.findById(userId).exec();
    
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    if (user.status !== 'pending') {
      throw new BadRequestException(`User is not pending approval. Current status: ${user.status}`);
    }

    user.status = 'active';
    user.approvedBy = approvedById as any;
    user.approvedAt = new Date();

    await user.save();
    
    return this.findOne(userId);
  }

  async rejectUser(userId: string, approvedById: string): Promise<Users> {
    const user = await this.usersModel.findById(userId).exec();
    
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    if (user.status !== 'pending') {
      throw new BadRequestException(`User is not pending approval. Current status: ${user.status}`);
    }

    user.status = 'rejected';
    user.approvedBy = approvedById as any;
    user.approvedAt = new Date();

    await user.save();
    
    return this.findOne(userId);
  }

  async suspendUser(userId: string): Promise<Users> {
    const user = await this.usersModel.findById(userId).exec();
    
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    user.status = 'suspended';
    await user.save();
    
    return this.findOne(userId);
  }

  async activateUser(userId: string): Promise<Users> {
    const user = await this.usersModel.findById(userId).exec();
    
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    user.status = 'active';
    await user.save();
    
    return this.findOne(userId);
  }

  async findPendingUsers(): Promise<Users[]> {
    return this.usersModel
      .find({ status: 'pending' })
      .select('-password')
      .populate('organization_id', 'name code')
      .exec();
  }

  async findByOrganization(organizationId: string): Promise<Users[]> {
    return this.usersModel
      .find({ organization_id: organizationId })
      .select('-password')
      .exec();
  }

  async findByRole(role: string): Promise<Users[]> {
    return this.usersModel
      .find({ role })
      .select('-password')
      .populate('organization_id', 'name code')
      .exec();
  }
}