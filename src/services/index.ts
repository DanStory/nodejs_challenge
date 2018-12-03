import { IService, IWorkerService } from '../interfaces';
import { GeoIpService, GeoIpWorkerService } from './geoip'

import {ContainerModule, interfaces} from 'inversify';
import {PingService, PingWorkerService} from "./ping";

export const Types = {
    IService: Symbol.for('IService'),
    IWorkerService: Symbol.for('IWorkerService')
};

export const Container = new ContainerModule((bind: interfaces.Bind) => {
    bind(GeoIpService).toSelf().inSingletonScope();
    bind(GeoIpWorkerService).toSelf();
    bind<IService>(Types.IService).toService(GeoIpService);
    bind<IWorkerService>(Types.IWorkerService).toService(GeoIpWorkerService);

    bind(PingService).toSelf().inSingletonScope();
    bind(PingWorkerService).toSelf();
    bind<IService>(Types.IService).toService(PingService);
    bind<IWorkerService>(Types.IWorkerService).toService(PingWorkerService);
});