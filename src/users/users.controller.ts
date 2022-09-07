import {
  BadRequestException,
  Body,
  Catch,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { MongooseError } from 'mongoose';
import { CreateUserDto } from './create-user.dto';
import { User } from './users.schema';
import { UsersService } from './users.service';

@Controller('/api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getUsers(): Promise<User[]> {
    return this.usersService.getUsers();
  }

  @Post()
  createNewUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    if (!createUserDto.email || !createUserDto.username) {
      throw new BadRequestException('Missing required data');
    }
    return this.usersService.create(createUserDto);
  }

  // @Catch(MongooseError)
}
