import type { Context, Middleware } from '../types'

export class MetaMask implements Middleware<Context> {
    async fn(context: Context, next: () => Promise<void>) {
        switch (context.request.method) {
            default:
                await next()
        }
    }
}
