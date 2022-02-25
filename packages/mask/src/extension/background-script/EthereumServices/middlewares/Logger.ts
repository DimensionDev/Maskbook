import type { Context, Middleware } from '../types'

export class Logger implements Middleware<Context> {
    async fn(context: Context, next: () => Promise<void>) {
        console.log(`START: ${context.request.method}_${JSON.stringify(context.request.params)}`)
        await next()
        console.log(`END: ${context.request.method}_${JSON.stringify(context.result)}`)
    }
}
