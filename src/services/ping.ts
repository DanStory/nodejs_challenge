import * as Bull from 'bull';
import * as Request from 'request-promise-native';
import {IWorkerService, IService} from '../interfaces';
import {ServiceQuery, ServiceResponse} from '../messages';
import {inject, injectable} from 'inversify';
import * as ping from 'ping';
import * as util from 'util';
import * as Config from '../config';

@injectable()
export class PingService implements IService {
    constructor(@inject(Config.Types.Redis) redis: string) {
        this.queue = Bull(`query_${this.name}`, redis);
    }

    name: string = 'ping';

    protected queue: Bull.Queue;

    public async query(query: ServiceQuery): Promise<Bull.Job> {
        return this.queue.add(query);
    }
}

@injectable()
export class PingWorkerService extends PingService implements IWorkerService {
    constructor(@inject(Config.Types.Redis) redis: string) {
        super(redis);
    }

    public start(): void {
        this.queue.process((job, done) => this.process(job, done));
    }

    public async stop(): Promise<any> {
        if(this.queue){
            return this.queue.close();
        }
        return Promise.resolve();
    }

    private process(job: Bull.Job, done: Bull.DoneCallback): void {
        let query: ServiceQuery = job.data;

        ping.promise.probe(query.host)
            .then((response) => done(null, new ServiceResponse(this.name, response)))
            .catch(ex => done(new Error(ex)));
    }

}