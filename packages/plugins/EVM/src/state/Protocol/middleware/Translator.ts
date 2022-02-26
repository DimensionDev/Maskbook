import { ChainId } from '@masknet/web3-shared-evm'
import { Base } from '../translators/Base'
import { Polygon } from '../translators/Polygon'
import { Celo } from '../translators/Celo'
import type { Context, Middleware, Translator as ChainTranslator } from '../types'

/**
 * JSON RPC transactor for EVM chains.
 */
export class Translator implements Middleware<Context> {
    private translators: Record<ChainId, ChainTranslator> = {
        [ChainId.Mainnet]: new Base(),
        [ChainId.Ropsten]: new Base(),
        [ChainId.Kovan]: new Base(),
        [ChainId.Rinkeby]: new Base(),
        [ChainId.Gorli]: new Base(),

        [ChainId.BSC]: new Base(),
        [ChainId.BSCT]: new Base(),

        [ChainId.Matic]: new Polygon(),
        [ChainId.Mumbai]: new Polygon(),

        [ChainId.Arbitrum]: new Base(),
        [ChainId.Arbitrum_Rinkeby]: new Base(),

        [ChainId.xDai]: new Base(),

        [ChainId.Avalanche]: new Base(),
        [ChainId.Avalanche_Fuji]: new Base(),

        [ChainId.Celo]: new Celo(),

        [ChainId.Fantom]: new Base(),

        [ChainId.Aurora]: new Base(),
        [ChainId.Aurora_Testnet]: new Base(),

        [ChainId.Fuse]: new Base(),

        [ChainId.Boba]: new Base(),

        [ChainId.Metis]: new Base(),

        [ChainId.Optimistic]: new Base(),

        [ChainId.Conflux]: new Base(),
    }

    async fn(context: Context, next: () => Promise<void>) {
        const translator = this.translators[context.chainId]

        if (translator?.encode) translator.encode(context)
        await next()
        if (translator?.decode) translator.decode(context)
    }
}
