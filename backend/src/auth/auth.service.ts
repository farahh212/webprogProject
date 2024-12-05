import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { RegisterDto } from './dto/registerDto';
import { CreateUserDto } from 'src/users/dto/CreateUser.dto';
import * as bcrypt from 'bcrypt';
import mongoose, { Model, Types } from 'mongoose';
import { SignInDto } from './dto/signInDto';
import * as dotenv from 'dotenv';
import { Log } from 'src/log/log.schema';
@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
      ) {}

      async register(user: RegisterDto): Promise<string> {
        const existingUser = await this.usersService.findUserByUsername(user.email);
        if (existingUser) {
          throw new ConflictException('Email already exists');
        }
    
        // Hash password before saving
        const hashedPassword = await bcrypt.hash(user.password, 10);
    
        // Create a new user object for saving
        const newUser: CreateUserDto = {
          ...user,
          password: hashedPassword, // Correct field name
        };
    
        // Save the new user to the database
        await this.usersService.create(newUser, hashedPassword);
    
        return 'Registered successfully';
      }
      
      async login(loginDto: SignInDto) {
        const { username, password } = loginDto;
      
        // Log username for debugging
        console.log(`Attempting login for username: ${username}`);
      
        // Find user by username
        const user = await this.usersService.findUserByUsername(username);
        if (!user) {
          console.error(`User not found for username: ${username}`);
          throw new NotFoundException('User not found');
        }
      
        console.log('Password Provided:', password);
        console.log('Password Stored:', user.passwordHash);
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        console.log('Password Validation Result:', isPasswordValid);
        if (!isPasswordValid) {
          console.error(`Invalid password for user: ${username}`);
          throw new UnauthorizedException('Invalid credentials');
        }
      
        console.log(`User authenticated: ${username}, generating token...`);
      
        // JWT payload
        const payload = { username: user.username, role: user.role};
        console.log("payload met");
        // Debugging JWT configuration
        const secret = process.env.JWT_SECRET || 'yourSuperSecretKey';
        const expiresIn = process.env.JWT_EXPIRES_IN || '1h';
        console.log('JWT Configuration:', { secret, expiresIn });
      
        // Generate token
        const token = await this.jwtService.signAsync(payload, { expiresIn });
        console.log('Generated token:', token);
      
        return {
          access_token: token,
          payload,
        };

}
}
