import type Web3 from 'web3'
import { ChainId, FungibleTokenDetailed, createNativeToken } from '@masknet/web3-shared-evm'
import type { SavingsProtocol, ProtocolPairsResolver } from '../../types'
import { COMPOUND_COMPTROLLER } from '../../constants'
import CompoundLikeFetcher from '../common/CompoundLikeFetcher'
import { CompoundProtocol } from './CompoundProtocol'

export class CompoundPairResolver implements ProtocolPairsResolver {
    public supportChains: ChainId[] = [ChainId.Mainnet]
    public async resolve(chainId: ChainId, web3: Web3): Promise<SavingsProtocol[]> {
        if (!this.supportChains.includes(ChainId.Mainnet)) {
            return []
        }
        const allPairs = await CompoundLikeFetcher.fetch(COMPOUND_COMPTROLLER, chainId, web3)
        return allPairs.map((pair: [FungibleTokenDetailed, FungibleTokenDetailed]) => {
            const [bareToken, stakeToken] = pair
            if (stakeToken.symbol === CompoundProtocol.nativeToken) {
                pair[0] = createNativeToken(ChainId.Mainnet)
            }
            return new CompoundProtocol(pair)
        })
    }
}

export const compoundLazyResolver = new CompoundPairResolver()
