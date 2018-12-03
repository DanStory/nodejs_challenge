import { Api } from './commands/api';
import { Worker } from './commands/worker';
import { rootContainer } from './container';
import * as Services from './services';
import * as Controllers from './controllers';

import { Sub, ShowHelp, run } from '@typecli/framework';

@ShowHelp()
@Sub(Api)
@Sub(Worker)
class ApplicationMain {}

async function bootstrap(): Promise<any> {

    rootContainer.load(Services.Container, Controllers.Container);

    return await run(ApplicationMain, process.argv);
}
bootstrap().catch( (error) => process.exit(1) );
