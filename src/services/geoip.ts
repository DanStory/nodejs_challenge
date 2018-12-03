import * as Bull from 'bull';
import * as Request from 'request-promise-native';
import {IWorkerService, IService} from '../interfaces';
import {ServiceQuery, ServiceResponse} from '../messages';
import {inject, injectable} from 'inversify';
import * as ip from 'ip';
import * as dns from 'dns';
import * as util from 'util';
import * as convert from 'xml-js'
import * as Config from '../config';

const dnsLookupAsync = util.promisify(dns.lookup);

@injectable()
export class GeoIpService implements IService {
    constructor(@inject(Config.Types.Redis) redis: string) {
        this.queue = Bull(`query_${this.name}`, redis);
    }

    name: string = 'geoip';

    protected queue: Bull.Queue;

    public async query(query: ServiceQuery): Promise<Bull.Job> {
        return this.queue.add(query);
    }
}

@injectable()
export class GeoIpWorkerService extends GeoIpService implements IWorkerService {
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

        if (!ip.isV4Format(query.host) && !ip.isV6Format(query.host)) {
            this.resolveHost(query.host)
                .then((ipAddress) => this.queryService(ipAddress))
                .then((response) => done(null, response))
                .catch(ex => done(new Error(ex)));
        }

        this.queryService(query.host)
            .then((response) => done(null, response))
            .catch(ex => done(new Error(ex)));
    }

    private async resolveHost(host: string): Promise<any> {
        dnsLookupAsync(host).then((ipAddress) => {
            return Promise.resolve(ipAddress.address);
        })
    }

    private async queryService(ip: string): Promise<any> {
        return Request.get({uri: 'http://api.geoiplookup.net', qs: {query: ip}})
            .then((body) => {
                const response = new ServiceResponse(this.name, convert.xml2js(body, {compact: true}));
                response.response._declaration = undefined;
                return Promise.resolve(response);
        });
    }

}