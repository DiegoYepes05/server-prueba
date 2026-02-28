import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  signIn() {
    return 'Sign In';
  }

  signUp() {
    return 'Sign Up';
  }
}
