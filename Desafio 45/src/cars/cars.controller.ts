import { Body, Controller, Get, Post } from '@nestjs/common';
import { CarsService } from './cars.service';
import { CreateCarDto } from '../dto/create-car.dto';
import { Car } from '../interfaces/car.interface';

@Controller('cars')
export class CarsController {
    constructor(private readonly carsService: CarsService) {}

    @Post()
    async create(@Body() createCarDto: CreateCarDto) {
      this.carsService.create(createCarDto);
    }
   
    @Get()
    async findAll(): Promise<Car[]> {
      return this.carsService.findAll();
    }
}
