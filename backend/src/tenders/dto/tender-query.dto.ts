import {
  IsOptional,
  IsString,
  IsNumber,
  Min,
  IsArray,
  IsBoolean,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class TenderQueryDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  query?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20;

  @IsOptional()
  @Transform(({ value }) => value?.split(',').filter(Boolean))
  @IsArray()
  status?: string[];

  @IsOptional()
  @Transform(({ value }) => value?.split(',').filter(Boolean))
  @IsArray()
  region?: string[];

  @IsOptional()
  @Transform(({ value }) => value?.split(',').filter(Boolean))
  @IsArray()
  category?: string[];

  @IsOptional()
  @Transform(({ value }) => value?.split(',').filter(Boolean))
  @IsArray()
  buyer?: string[];

  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true' || value === '1')
  @IsBoolean()
  awarded?: boolean;
}
