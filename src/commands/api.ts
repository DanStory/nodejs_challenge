import { Run, Option, Handler, ShowHelp, Help } from '@typecli/framework';
import 'reflect-metadata';
import * as Koa from 'koa';
import * as Router from 'koa-router';
import { bindRoutes } from 'trafficlight';


import * as Config from '../config';
import * as Controllers from '../controllers';
import {rootContainer} from "../container";


@ShowHelp()
@Help({caption: 'Start api service', header: 'Start api service'})
export class Api {
    @Option({default: '3000', desc: 'Port number to bind to.'})
    port: string;

    @Option({ default: 'redis://localhost:6379', desc: 'Url to redis.' })
    redis: string;

    @Run()
    async run() {
        const portNumber = Number(this.port);
        if(isNaN(portNumber) || portNumber < 1 || portNumber > 65353){
            throw new Error(`Invalid option: port`);
        }

        rootContainer.bind(Config.Types.Redis).toConstantValue(this.redis);

        const app = new Koa();
        this.buildRoutes(app);

        app.listen(this.port);
    }

    private buildRoutes(app: Koa) {
        const routerRoutes = new Router();

        bindRoutes(routerRoutes, Controllers.Controllers, ctrl => rootContainer.get(ctrl));

        app.use(routerRoutes.routes());
        app.use(routerRoutes.allowedMethods());
    }
}