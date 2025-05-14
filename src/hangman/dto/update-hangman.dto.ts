import { PartialType } from '@nestjs/mapped-types';
import { CreateHangmanDto } from './create-hangman.dto';

export class UpdateHangmanDto extends PartialType(CreateHangmanDto) {}
