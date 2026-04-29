import { IsString, IsNotEmpty, MaxLength, IsOptional, IsArray, IsUUID } from 'class-validator';

export class CreateNoteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  categoryIds?: string[];
}
