import { QueryServicesController } from './query-services';
import { ContainerModule } from 'inversify';

export const Controllers: any[] = [
    QueryServicesController
];

export const Container = new ContainerModule(bind => {
    Controllers.forEach(controller => bind(controller).toSelf());
});