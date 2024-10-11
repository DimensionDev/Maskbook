import { ChainId, type Middleware, type Translator as Translator_ } from '@masknet/web3-shared-evm'
import { DefaultTranslator } from '../translators/Base.js'
import { AstarTranslator } from '../translators/Astar.js'
import { PolygonTranslator } from '../translators/Polygon.js'
import type { ConnectionContext } from '../libs/ConnectionContext.js'

/**
 * JSON RPC transactor for EVM chains.
 */
export class Translator implements Middleware<ConnectionContext> {
    private base = new DefaultTranslator()

    private translators: Partial<Record<ChainId, Translator_<ConnectionContext>>> = {
        [ChainId.Astar]: new AstarTranslator(),
        [ChainId.Polygon]: new PolygonTranslator(),
    }

    async fn(context: ConnectionContext, next: () => Promise<void>) {
        const translator = this.translators[context.chainId] ?? this.base
        if (translator.encode) await translator.encode(context)
        await next()
        if (translator.decode) await translator.decode(context)
    }
}
