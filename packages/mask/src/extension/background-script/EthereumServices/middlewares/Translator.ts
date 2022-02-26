import { ChainId } from '@masknet/web3-shared-evm'
import { Celo } from '../translators/Celo'
import type { Context, Middleware, Translator as ChainTranslator } from '../types'

/**
 * JSON RPC transactor for EVM chains.
 */
export class Translator implements Middleware<Context> {
    private translators: Partial<Record<ChainId, ChainTranslator>> = {
        [ChainId.Celo]: new Celo(),
    }

    async fn(context: Context, next: () => Promise<void>) {
        const translator = this.translators[context.chainId]

        if (translator?.encode) {
            const request = translator.encode(context.request)
            context.requestArguments = {
                method: request.method,
                params: request.params,
            }
        }

        await next()

        if (translator?.decode) {
            const [error, response] = translator.decode(context.error, context.response)
            if (error) context.error = error
            else context.result = response.result
        }
    }
}
