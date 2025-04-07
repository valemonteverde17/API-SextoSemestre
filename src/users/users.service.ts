import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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

    // Hashear la contraseña antes de guardarla
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    
    const newUser = new this.usersModel({
      ...createUserDto,
      password: hashedPassword,
      role_id: new Types.ObjectId(createUserDto.role_id) // Convertir a ObjectId
    });

    try {
      return await newUser.save();
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll(query?: any): Promise<Users[]> {
    // Opcional: Filtrar por query params (ej. /users?role=admin)
    const filter = query?.role ? { 'role_id.name': query.role } : {};
    return this.usersModel.find(filter).select('-password').exec(); // Excluir passwords por seguridad
  }

  async findOne(id: string): Promise<Users> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID');
    }

    const user = await this.usersModel.findById(id).select('-password').exec();
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async findByUsername(username: string): Promise<Users> {
    const user = await this.usersModel.findOne({ user_name: username }).exec();
    if (!user) {
      throw new NotFoundException(`User with username ${username} not found`);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<Users> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID');
    }

    // Si se actualiza la contraseña, hashearla
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Si se actualiza el role_id, convertirlo a ObjectId
    if (updateUserDto.role_id) {
      updateUserDto.role_id = new Types.ObjectId(updateUserDto.role_id) as any;
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
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID');
    }

    const deletedUser = await this.usersModel.findByIdAndDelete(id).select('-password').exec();
    if (!deletedUser) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return deletedUser;
  }

  // Método adicional para validar usuario (útil para auth)
  async validateUser(username: string, pass: string): Promise<Users | null> {
    const user = await this.usersModel.findOne({ user_name: username });
    if (!user) return null;

    const isPasswordValid = await bcrypt.compare(pass, user.password);
    if (!isPasswordValid) return null;

    return user.toObject({ versionKey: false });
  }
}
