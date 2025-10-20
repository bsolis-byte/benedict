import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') || 'defaultSecret',
    });
  }

  // Ensure validate returns an object that contains the user's id
  async validate(payload: any) {
    // payload shape depends on how you sign the token.
    // Common patterns: { sub: userId, username, ... }  OR  { id: userId, ... }
    const userId = payload.sub ?? payload.id ?? payload.userId;
    return { id: userId, ...payload };
  }
}