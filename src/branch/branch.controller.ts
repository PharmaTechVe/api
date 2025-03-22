import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpStatus,
  ParseUUIDPipe,
  HttpCode,
} from '@nestjs/common';
import { BranchService } from './branch.service';
import {
  CreateBranchDTO,
  UpdateBranchDTO,
  ResponseBranchDTO,
} from './dto/branch.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorador';
import { Role } from 'src/auth/rol.enum';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('branch')
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a branch' })
  @ApiResponse({
    description: 'Successful branch creation',
    status: HttpStatus.CREATED,
    type: ResponseBranchDTO,
  })
  async create(
    @Body() createBranchDto: CreateBranchDTO,
  ): Promise<ResponseBranchDTO> {
    return await this.branchService.create(createBranchDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all branches or filter by city ID' })
  @ApiResponse({
    description: 'Successful retrieval of branches',
    status: HttpStatus.OK,
    type: [ResponseBranchDTO],
  })
  async findAll(): Promise<ResponseBranchDTO[]> {
    return await this.branchService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get branch by ID' })
  @ApiResponse({
    description: 'Successful retrieval of branch',
    status: HttpStatus.OK,
    type: ResponseBranchDTO,
  })
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<ResponseBranchDTO> {
    return await this.branchService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update branch by ID' })
  @ApiResponse({
    description: 'Successful update of branch',
    status: HttpStatus.OK,
    type: ResponseBranchDTO,
  })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateBranchDto: UpdateBranchDTO,
  ): Promise<ResponseBranchDTO> {
    return await this.branchService.update(id, updateBranchDto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete branch by ID' })
  @ApiResponse({
    description: 'Successful deletion of branch',
    status: HttpStatus.NO_CONTENT,
  })
  async remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    await this.branchService.remove(id);
  }
}
