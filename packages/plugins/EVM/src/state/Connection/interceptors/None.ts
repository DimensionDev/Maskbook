import type { ConnectionContext, Middleware } from '@masknet/web3-shared-evm'

export class NoneWallet implements Middleware<ConnectionContext> {
    async fn(context: ConnectionContext, next: () => Promise<void>) {
        if (context.risky) {
            context.abort(new Error('No allowed.'))
        }
        await next()
    }
}
