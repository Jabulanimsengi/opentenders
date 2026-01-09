import { IsOptional, IsString, IsNumber, Min, IsArray } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class TenderQueryDto {
    @IsOptional()
    @IsString()
    q?: string;

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
}
