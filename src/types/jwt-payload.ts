import { Role } from '../user/entity/user.entity';
import { TokenType } from './token';

export interface JwtPayload {
  sub: number;
  role: Role;
  type: TokenType;
  iat: number;
  exp: number;
}
