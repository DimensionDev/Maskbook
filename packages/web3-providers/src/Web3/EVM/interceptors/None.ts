import type { Middleware } from '@masknet/web3-shared-evm'
import type { ConnectionContext } from '../libs/ConnectionContext.js'

export class NoneWallet implements Middleware<ConnectionContext> {
    async fn(context: ConnectionContext, next: () => Promise<void>) {
        if (context.risky) {
            context.abort(new Error('No allowed.'))
        }
        await next()
    }
}
