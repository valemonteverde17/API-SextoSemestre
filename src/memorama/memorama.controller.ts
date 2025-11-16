import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MemoramaService } from './memorama.service';
import { CreateMemoramaDto } from './dto/create-memorama.dto';
import { UpdateMemoramaDto } from './dto/update-memorama.dto';

@ApiTags('memorama')
@Controller('memorama')
export class MemoramaController {
  constructor(private readonly memoramaService: MemoramaService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new memorama pair' })
  @ApiResponse({ status: 201, description: 'Pair created successfully' })
  create(@Body() createMemoramaDto: CreateMemoramaDto) {
    return this.memoramaService.create(createMemoramaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all memorama pairs' })
  findAll() {
    return this.memoramaService.findAll();
  }

  @Get('topic/:topicId')
  @ApiOperation({ summary: 'Get memorama pairs by topic' })
  findByTopic(
    @Param('topicId') topicId: string,
    @Query('difficulty') difficulty?: string,
  ) {
    return this.memoramaService.findByTopic(topicId, difficulty);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a memorama pair by ID' })
  findOne(@Param('id') id: string) {
    return this.memoramaService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a memorama pair' })
  update(@Param('id') id: string, @Body() updateMemoramaDto: UpdateMemoramaDto) {
    return this.memoramaService.update(id, updateMemoramaDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a memorama pair' })
  remove(@Param('id') id: string) {
    return this.memoramaService.remove(id);
  }
}
