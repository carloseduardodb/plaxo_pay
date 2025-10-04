import { Controller, Post, Get, Param, Body, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { ApplicationService } from '@/application/services/application.service';
import { CreateApplicationDto } from '../dtos/create-application.dto';

@ApiTags('applications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('applications')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new application' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Application created successfully' })
  async createApplication(@Body() dto: CreateApplicationDto) {
    return this.applicationService.createApplication(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all applications' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Applications found' })
  async getApplications() {
    return this.applicationService.getAllApplications();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get application by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Application found' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Application not found' })
  async getApplication(@Param('id') id: string) {
    const application = await this.applicationService.getApplicationById(id);
    if (!application) {
      throw new Error('Application not found');
    }
    return application;
  }
}