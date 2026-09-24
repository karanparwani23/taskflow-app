import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { CredentialsDto } from './dto/auth.dto';
import { AuthUser } from './auth.types';
import { User, UserDocument } from './user.schema';

export interface AuthResult {
  accessToken: string;
  user: AuthUser;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly users: Model<UserDocument>,
    private readonly jwt: JwtService,
  ) {}

  async register(credentials: CredentialsDto): Promise<AuthResult> {
    const email = credentials.email.trim().toLowerCase();
    const passwordHash = await bcrypt.hash(credentials.password, 12);

    try {
      const user = await this.users.create({ email, passwordHash });
      return this.issueToken({ id: user.id, email: user.email });
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 11000
      ) {
        throw new ConflictException('An account with this email already exists.');
      }
      throw error;
    }
  }

  async login(credentials: CredentialsDto): Promise<AuthResult> {
    const email = credentials.email.trim().toLowerCase();
    const user = await this.users
      .findOne({ email })
      .select('+passwordHash')
      .exec();

    if (!user || !(await bcrypt.compare(credentials.password, user.passwordHash))) {
      throw new UnauthorizedException('Email or password is incorrect.');
    }

    return this.issueToken({ id: user.id, email: user.email });
  }

  private async issueToken(user: AuthUser): Promise<AuthResult> {
    const accessToken = await this.jwt.signAsync({
      sub: user.id,
      email: user.email,
    });
    return { accessToken, user };
  }
}
