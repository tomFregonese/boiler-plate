import { User } from '../entities/user.entity';

export interface UserUpdateData {
  login?: string;
  password?: string;
  roles?: string[];
  status?: string;
}

export interface IUserRepository {
  save(user: User): Promise<User>;
  findByLogin(login: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  update(id: string, data: UserUpdateData): Promise<User>;
}




