import { IsString, MaxLength, IsOptional, IsArray, IsUUID } from 'class-validator';

export class UpdateNoteDto {
  @IsString()
  @MaxLength(255)
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  categoryIds?: string[];
}
