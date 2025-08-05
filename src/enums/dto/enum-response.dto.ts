import { ApiProperty } from '@nestjs/swagger';

export class EnumResponseDto {
  @ApiProperty({
    description: 'Enum value',
    example: 'ACTIVE',
  })
  value: string;

  @ApiProperty({
    description: 'Translated label for the enum value',
    example: 'Активный',
  })
  label: string;
}
