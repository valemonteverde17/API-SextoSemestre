import { PartialType } from '@nestjs/swagger';
import { CreateMemoramaDto } from './create-memorama.dto';

export class UpdateMemoramaDto extends PartialType(CreateMemoramaDto) {}
