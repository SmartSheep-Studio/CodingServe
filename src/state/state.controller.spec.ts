import {Test, TestingModule} from '@nestjs/testing';
import {StateController} from './state.controller';

describe('AppController', () => {
    let appController: StateController;

    beforeEach(async () => {
        const app: TestingModule = await Test.createTestingModule({
            controllers: [StateController],
        }).compile();

        appController = app.get<StateController>(StateController);
    });

    describe('root', () => {
        it('should defined', () => {
            expect(appController).toBeDefined();
        });
    });
});
