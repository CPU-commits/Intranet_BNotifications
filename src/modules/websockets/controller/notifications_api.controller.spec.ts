import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsApiController } from './notifications_api.controller';

describe('NotificationsApiController', () => {
  let controller: NotificationsApiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsApiController],
    }).compile();

    controller = module.get<NotificationsApiController>(NotificationsApiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
