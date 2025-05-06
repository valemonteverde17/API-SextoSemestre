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
      throw new ConflictException('Username already exists');
    }

    // Validar que el rol sea válido
    if (!['docente', 'estudiante'].includes(createUserDto.role)) {
      throw new BadRequestException('Invalid role. Must be "docente" or "estudiante"');
    }

    // Hashear la contraseña antes de guardarla
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    
    const newUser = new this.usersModel({
      user_name: createUserDto.user_name,
      password: hashedPassword,
      role: createUserDto.role // Ahora es un string
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
}