import { ChainId } from '@masknet/web3-shared-evm'
import { Base } from '../translators/Base'
import { Polygon } from '../translators/Polygon'
import type { Context, Middleware, Translator as ChainTranslator } from '../types'

/**
 * JSON RPC transactor for EVM chains.
 */
export class Translator implements Middleware<Context> {
    private base = new Base()

    private translators: Partial<Record<ChainId, ChainTranslator>> = {
        [ChainId.Matic]: new Polygon(),
        [ChainId.Mumbai]: new Polygon(),
    }

    async fn(context: Context, next: () => Promise<void>) {
        const translator = this.translators[context.chainId] ?? this.base

        if (translator.encode) await translator.encode(context)
        await next()
        if (translator.decode) await translator.decode(context)
    }
}
