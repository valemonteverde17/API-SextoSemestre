import { PartialType } from '@nestjs/mapped-types';
import { CreateQuizSetDto } from './create-quiz-set.dto';

export class UpdateQuizSetDto extends PartialType(CreateQuizSetDto) {}
