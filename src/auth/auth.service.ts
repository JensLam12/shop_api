import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt'
import { User } from './entities/user.entity';
import { LoginUserDto, CreateUserDto } from './dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService
  ){}

  async create(createUserDto: CreateUserDto) {
    
    try {
      const { password, ...userData} = createUserDto;

      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10)
      });
      await this.userRepository.save( user );
      delete user.password;

      return {
        ...user,
        token: this.getJwtToken({ id: user.id })
      }

    }catch(exception) {
      this.handleDBErrors(exception)
    }
  }

  async login(loginUserDto: LoginUserDto) {
    
    try {
      const { password, email } = loginUserDto;

      const user = await this.userRepository.findOne({
        where: {email},
        select: { email: true, password: true, id: true }
      });

      if( !user )
        throw new UnauthorizedException('Credentials are not validator(email)');

      if( !bcrypt.compareSync(password, user.password) )
        throw new UnauthorizedException('Credentials are not valid(password)');

      return {
        ...user,
        token: this.getJwtToken({ id: user.id })
      }
      
    }catch(exception) {
      this.handleDBErrors(exception)
    }
  }

  async checkAuthStatus(user: User) {
    return {
      ...user,
      token: this.getJwtToken({ id: user.id })
    }
  }

  private getJwtToken( payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }

  private handleDBErrors( error: any): never {
    if( error.code === '23505') {
      throw new BadRequestException(error.detail);
    }

    console.log(error);
    throw new InternalServerErrorException('Please check server logs');
  }
}
