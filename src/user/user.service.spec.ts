import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserModule } from './user.module';
import { DatabaseModule } from 'src/database/database.module';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule, UserModule],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should return null', () => {
    const result = service.findByEmail('example@org.com');
    expect(result).toBe(null);
  });
});
