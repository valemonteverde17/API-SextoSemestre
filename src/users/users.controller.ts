import {Controller,Get,Post,Body,Patch,Param,Delete,UsePipes,ValidationPipe,Query,NotFoundException,UnauthorizedException} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiResponse, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersDocument } from './users.schema';
import * as bcrypt from 'bcrypt';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UsePipes(new ValidationPipe({ transform: true }))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  
    @Post('login')
    @ApiOperation({ summary: 'Authenticate a user' })
    @ApiResponse({
      status: 200,
      description: 'User authenticated successfully',
      schema: {
        example: {
          _id: '507f1f77bcf86cd799439011',
          user_name: 'profesor1',
          role: 'docente'
        }
      }
    })
    @ApiResponse({ status: 401, description: 'Invalid password' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async login(@Body() body: { user_name: string; password: string }) {
      const user: UsersDocument | null = await this.usersService.findByUsername(body.user_name);
      if (!user) throw new NotFoundException('User not found');
  
      const isMatch = await bcrypt.compare(body.password, user.password);
      if (!isMatch) throw new UnauthorizedException('Invalid password');
  
      return {
        _id: user._id,
        user_name: user.user_name,
        role: user.role
      };
    }
  

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ 
    status: 201, 
    description: 'User successfully created',
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439011',
        user_name: 'profesor1',
        role: 'docente',
        createdAt: '2023-05-18T14:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid role or data' })
  @ApiResponse({ status: 409, description: 'Username already exists' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users (optionally filtered by role)' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of users'
  })
  findAll(@Query() query: any) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user information' })
  @ApiResponse({ status: 200, description: 'User updated' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid role or data' })
  @ApiResponse({ status: 404, description: 'User not found' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({ status: 200, description: 'User deleted' })
  @ApiResponse({ status: 404, description: 'User not found' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Get('username/:username')
  @ApiOperation({ summary: 'Get user by username' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findByUsername(@Param('username') username: string) {
    return this.usersService.findByUsername(username);
  }
}
