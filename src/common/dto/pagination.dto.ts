import { Type } from 'class-transformer';
import { IsPositive, IsOptional, Min } from 'class-validator';

export class PaginationDto {

    @IsOptional()
    @IsPositive()
    @Type( () => Number) // EnableImplicitConversions: true
    limit?: number;

    @IsOptional()
    @Min(0)
    @Type( () => Number) // EnableImplicitConversions: true
    offset?: number;
}