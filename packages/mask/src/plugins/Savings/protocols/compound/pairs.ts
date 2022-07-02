import type Web3 from 'web3'
import { ChainId, createNativeToken } from '@masknet/web3-shared-evm'
import type { SavingsProtocol, ProtocolPairsResolver, PairToken } from '../../types'
import { COMPOUND_COMPTROLLER } from '../../constants'
import CompoundLikeFetcher from '../common/CompoundLikeFetcher'
import CompoundProtocol from './CompoundProtocol'
import type { Web3Helper } from '@masknet/plugin-infra/web3'

export class CompoundPairResolver implements ProtocolPairsResolver {
    public supportChains: ChainId[] = [ChainId.Mainnet]
    public async resolve(
        chainId: ChainId,
        web3: Web3,
        connection: Web3Helper.Web3ConnectionScope,
    ): Promise<SavingsProtocol[]> {
        if (!this.supportChains.includes(ChainId.Mainnet)) {
            return []
        }
        const allPairs = await CompoundLikeFetcher.fetch(COMPOUND_COMPTROLLER, chainId, web3, connection)
        return allPairs.map((pair: PairToken) => {
            const [bareToken, stakeToken] = pair
            if (stakeToken.symbol === CompoundProtocol.nativeToken) {
                pair[0] = createNativeToken(ChainId.Mainnet)
            }
            return new CompoundProtocol(pair)
        })
    }
}

export const compoundLazyResolver = new CompoundPairResolver()
