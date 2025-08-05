import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EnumsService } from './enums.service';
import { EnumResponseDto } from './dto/enum-response.dto';

@ApiTags('enums')
@Controller('enums')
export class EnumsController {
  constructor(private readonly enumsService: EnumsService) {}

  @Get('user-statuses')
  @ApiOperation({ summary: 'Get user status enums with translations' })
  @ApiQuery({
    name: 'lang',
    required: false,
    description: 'Language code (ru, en)',
    example: 'ru',
  })
  @ApiResponse({
    status: 200,
    description: 'List of user statuses with translations',
    type: [EnumResponseDto],
  })
  getUserStatuses(@Query('lang') lang: string = 'ru'): EnumResponseDto[] {
    return this.enumsService.getUserStatuses(lang);
  }

  @Get('registration-statuses')
  @ApiOperation({ summary: 'Get registration status enums with translations' })
  @ApiQuery({
    name: 'lang',
    required: false,
    description: 'Language code (ru, en)',
    example: 'ru',
  })
  @ApiResponse({
    status: 200,
    description: 'List of registration statuses with translations',
    type: [EnumResponseDto],
  })
  getRegistrationStatuses(
    @Query('lang') lang: string = 'ru',
  ): EnumResponseDto[] {
    return this.enumsService.getRegistrationStatuses(lang);
  }
}
