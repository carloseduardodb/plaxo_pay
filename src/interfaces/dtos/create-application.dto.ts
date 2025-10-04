import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateApplicationDto {
  @ApiProperty({ description: 'Application name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'API key for the application' })
  @IsString()
  apiKey: string;

  @ApiProperty({ description: 'Whether application is active', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}