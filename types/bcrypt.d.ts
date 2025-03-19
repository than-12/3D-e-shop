declare module 'bcrypt' {
  export function compare(password: string, hash: string): Promise<boolean>;
  export function hash(password: string, salt: number): Promise<string>;
  export function genSalt(rounds: number): Promise<string>;
} 