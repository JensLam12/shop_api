import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsPositive, IsOptional, Min } from 'class-validator';

export class PaginationDto {

    @ApiProperty({
        default: 10,
        description: 'How many rows do you need?'
    })
    @IsOptional()
    @IsPositive()
    @Type( () => Number) // EnableImplicitConversions: true
    limit?: number;

    @ApiProperty({
        default: 10,
        description: 'How many rows do you want to skip?'
    })
    @IsOptional()
    @Min(0)
    @Type( () => Number) // EnableImplicitConversions: true
    offset?: number;
}