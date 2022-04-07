import type Web3 from 'web3'
import { ChainId, FungibleTokenDetailed } from '@masknet/web3-shared-evm'
import type { SavingsProtocol, ProtocolPairsResolver } from '../../types'
import AAVELikeFetcher from '../common/AAVELikeFetcher'
import { MoolaProtocol } from './MoolaProtocol'

// https://github.com/moolamarket/moola-v2/blob/main/cli.js#L239
export const AaveProtocolDataProvider = '0xb3072f5F0d5e8B9036aEC29F37baB70E86EA0018'
export const LendingPoolAddressProvider = '0x31ccB9dC068058672D96E92BAf96B1607855822E'

export class MoolaPairResolver implements ProtocolPairsResolver {
    public supportChains: ChainId[] = [ChainId.Celo]
    public async resolve(chainId: ChainId, web3: Web3): Promise<SavingsProtocol[]> {
        if (!this.supportChains.includes(chainId)) {
            return []
        }
        const allPairsWithArgs = await AAVELikeFetcher.fetch(
            AaveProtocolDataProvider,
            LendingPoolAddressProvider,
            chainId,
            web3,
        )
        return allPairsWithArgs.map((args: [[FungibleTokenDetailed, FungibleTokenDetailed], string, string]) => {
            // const [bareToken, stakeToken] = pair
            // if (stakeToken.symbol === GiestProtocol.nativeToken) {
            //     pair[0] = createNativeToken(ChainId.Mainnet)
            // }
            const [pair, pool, dataProvider] = args
            return new MoolaProtocol(pair, pool, dataProvider)
        })
    }
}

export const moolaLazyResolver = new MoolaPairResolver()
