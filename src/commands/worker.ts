import { Run, Option, ShowHelp, Help } from '@typecli/framework';
import {IWorkerService} from '../interfaces';
import {rootContainer} from '../container';

import * as Config from '../config';
import * as Services from '../services';

@ShowHelp()
@Help({caption: 'Start worker service', header: 'Start worker service'})
export class Worker {

    @Option({ default: 'redis://localhost:6379', desc: 'Url to redis.' })
    public redis: string;

    private _services: IWorkerService[] = [];

    @Run()
    public async run(): Promise<any> {

        rootContainer.bind(Config.Types.Redis).toConstantValue(this.redis);

        try {
            this._services = rootContainer.getAll(Services.Types.IWorkerService);

            this.start();

            process.on('SIGTERM', () => this.stop());
            process.on('SIGINT', () => this.stop());

            process.stdin.resume();
        }
        catch(ex)
        {
            return Promise.reject(ex)
        }

        return Promise.resolve();
    }

    private start(): void {
        for (let service of this._services) {
            service.start();
        }
    }

    private stop(): void {
        for (let service of this._services) {
            service.stop();
        }
        process.exit();
    }
}