
import {Controller, Ctx, Get, QueryParam } from 'trafficlight';
import {injectable, multiInject} from 'inversify';
import {ServiceQuery, ServiceResponse} from "../messages";
import {IService} from "../interfaces";
import * as ip from 'ip';
import * as isValidDomain from 'is-valid-domain';
import * as Bluebird from 'bluebird';

import * as Services from '../services'

@injectable()
@Controller('/query-services')
export class QueryServicesController {

    constructor(
        @multiInject(Services.Types.IService) services: IService[]
    ){
        this._services = services;
    }

    private _services: IService[] = [];

    // TODO: Change to POST verb
    @Get()
    async get(@QueryParam('host') host: string, @QueryParam('service') serviceNames: string[] = ['geoip'], @Ctx() context) {

        if (!host || (!ip.isV4Format(host) && !ip.isV6Format(host) && !isValidDomain(host))) {
            context.status = 400;
            return { error: 'Invalid host.' }
        }

        if(!Array.isArray(serviceNames)){
            // @ts-ignore
            serviceNames = [serviceNames]
        }
        if(!serviceNames || serviceNames.length < 1){
            context.status = 400;
            return { error: 'No services provided.' }
        }

        let services: IService[] = [];
        let service: IService | undefined;

        for (let serviceName of serviceNames) {
            serviceName = serviceName.toLowerCase();

            service = this._services.find((srv) => srv.name === serviceName);
            if(!service){
                context.status = 400;
                return { error: 'Unknown service.' }
            }
            services.push(service);
        }

        const request = new ServiceQuery(host);
        let jobFinished: Bluebird<any>[] = [];
        // noinspection JSAssignmentUsedAsCondition
        while(service = services.pop()){
            let job = await service.query(request);
            let serviceName = service.name;
            jobFinished.push(job
                .finished()
                .catch(ex => Bluebird.resolve(new ServiceResponse(serviceName, {error: ex.message})))
            );
        }

        return await Bluebird.all(jobFinished);
    }
}