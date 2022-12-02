import type { Context, Middleware } from '../types.js'

export class NoneWallet implements Middleware<Context> {
    async fn(context: Context, next: () => Promise<void>) {
        if (context.risky) {
            context.abort(new Error('No allowed.'))
        }
        await next()
    }
}
