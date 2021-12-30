import { ApiProperty } from '@nestjs/swagger';

export class CreateCarDto {
    @ApiProperty()
    readonly marca: string;
   
    @ApiProperty()
    readonly modelo: string;
   
    @ApiProperty()
    readonly anio: number;
}