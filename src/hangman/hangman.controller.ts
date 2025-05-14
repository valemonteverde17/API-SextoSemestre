import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { HangmanService } from './hangman.service';
import { CreateHangmanDto } from './dto/create-hangman.dto';
import { UpdateHangmanDto } from './dto/update-hangman.dto';

@Controller('hangman')
export class HangmanController {
  constructor(private readonly hangmanService: HangmanService) {}

  @Post()
  create(@Body() createHangmanDto: CreateHangmanDto) {
    return this.hangmanService.create(createHangmanDto);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.hangmanService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hangmanService.findOne(id); // <-- ID como string
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHangmanDto: UpdateHangmanDto) {
    return this.hangmanService.update(id, updateHangmanDto); // <-- ID como string
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.hangmanService.remove(id); // <-- ID como string
  }
}
