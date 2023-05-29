import { ChainId, type Middleware, type Translator as Translator_ } from '@masknet/web3-shared-evm'
import { Base } from '../translators/Base.js'
import { Astar } from '../translators/Astar.js'
import { Polygon } from '../translators/Polygon.js'
import type { ConnectionContext } from '../libs/ConnectionContext.js'

/**
 * JSON RPC transactor for EVM chains.
 */
export class Translator implements Middleware<ConnectionContext> {
    private base = new Base()

    private translators: Partial<Record<ChainId, Translator_<ConnectionContext>>> = {
        [ChainId.Astar]: new Astar(),
        [ChainId.Mumbai]: new Polygon(),
    }

    async fn(context: ConnectionContext, next: () => Promise<void>) {
        const translator = this.translators[context.chainId] ?? this.base
        if (translator.encode) await translator.encode(context)
        await next()
        if (translator.decode) await translator.decode(context)
    }
}
