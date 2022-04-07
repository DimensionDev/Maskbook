import type Web3 from 'web3'
import { ChainId, FungibleTokenDetailed } from '@masknet/web3-shared-evm'
import type { SavingsProtocol, ProtocolPairsResolver } from '../../types'
import AAVELikeFetcher from '../common/AAVELikeFetcher'
import { GiestProtocol } from './GiestProtocol'

// https://docs.geist.finance/useful-info/deployments-addresses
export const AaveProtocolDataProvider = '0xf3B0611e2E4D2cd6aB4bb3e01aDe211c3f42A8C3'
export const LendingPoolAddressProvider = '0x6c793c628Fe2b480c5e6FB7957dDa4b9291F9c9b'

export class GiestPairResolver implements ProtocolPairsResolver {
    public supportChains: ChainId[] = [ChainId.Fantom]
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
            return new GiestProtocol(pair, pool, dataProvider)
        })
    }
}

export const compoundLazyResolver = new GiestPairResolver()
