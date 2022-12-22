import type { Context, Middleware } from '../types.js'

export class Popups implements Middleware<Context> {
    async fn(context: Context, next: () => Promise<void>) {
        if (context.risky) {
            // invoke popups to edit the tx
        }

        await next()
    }
}
