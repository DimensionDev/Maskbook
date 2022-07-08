import { isRiskMethod } from '@masknet/web3-shared-evm'
import type { Context, Middleware } from '../types'

export class NoneWallet implements Middleware<Context> {
    async fn(context: Context, next: () => Promise<void>) {
        if (isRiskMethod(context.method)) {
            context.abort(new Error('No allowed.'))
        }
        await next()
    }
}
