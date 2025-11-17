import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';

@ApiTags('Organizations')
@ApiBearerAuth()
@Controller('organizations')
@UseGuards(AuthGuard, RolesGuard)
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Roles('admin')
  @Post()
  @ApiOperation({ summary: 'Crear nueva organización' })
  @ApiResponse({ status: 201, description: 'Organización creada exitosamente' })
  @ApiResponse({ status: 409, description: 'El código de organización ya existe' })
  create(@Body() createOrganizationDto: CreateOrganizationDto) {
    return this.organizationService.create(createOrganizationDto);
  }

  @Roles('admin')
  @Get()
  @ApiOperation({ summary: 'Obtener todas las organizaciones' })
  @ApiResponse({ status: 200, description: 'Lista de organizaciones' })
  findAll() {
    return this.organizationService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener organización por ID' })
  @ApiResponse({ status: 200, description: 'Organización encontrada' })
  @ApiResponse({ status: 404, description: 'Organización no encontrada' })
  findOne(@Param('id') id: string) {
    return this.organizationService.findOne(id);
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Obtener organización por código' })
  @ApiResponse({ status: 200, description: 'Organización encontrada' })
  @ApiResponse({ status: 404, description: 'Organización no encontrada' })
  findByCode(@Param('code') code: string) {
    return this.organizationService.findByCode(code);
  }

  @Get('admin/:adminId')
  @ApiOperation({ summary: 'Obtener organizaciones de un administrador' })
  @ApiResponse({ status: 200, description: 'Lista de organizaciones del admin' })
  findByAdmin(@Param('adminId') adminId: string) {
    return this.organizationService.findByAdmin(adminId);
  }

  @Get(':id/members/count')
  @ApiOperation({ summary: 'Obtener conteo de miembros de la organización' })
  @ApiResponse({ status: 200, description: 'Conteo de miembros' })
  getMemberCount(@Param('id') id: string) {
    return this.organizationService.getMemberCount(id);
  }

  @Roles('admin')
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar organización' })
  @ApiResponse({ status: 200, description: 'Organización actualizada' })
  @ApiResponse({ status: 404, description: 'Organización no encontrada' })
  update(@Param('id') id: string, @Body() updateOrganizationDto: UpdateOrganizationDto) {
    return this.organizationService.update(id, updateOrganizationDto);
  }

  @Roles('admin')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar organización' })
  @ApiResponse({ status: 204, description: 'Organización eliminada' })
  @ApiResponse({ status: 404, description: 'Organización no encontrada' })
  remove(@Param('id') id: string) {
    return this.organizationService.remove(id);
  }
}
