import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsStudentsGateway } from './notifications_students.gateway';

describe('NotificationsStudentsGateway', () => {
  let gateway: NotificationsStudentsGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationsStudentsGateway],
    }).compile();

    gateway = module.get<NotificationsStudentsGateway>(NotificationsStudentsGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
