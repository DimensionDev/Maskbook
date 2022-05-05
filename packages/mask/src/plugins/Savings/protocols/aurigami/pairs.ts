import type Web3 from 'web3'
import { ChainId, FungibleTokenDetailed, createNativeToken } from '@masknet/web3-shared-evm'
import type { SavingsProtocol, ProtocolPairsResolver } from '../../types'
import CompoundLikeFetcher from '../common/CompoundLikeFetcher'
import AurigamiProtocol from './AurigamiProtocol'
import type { PairConfig } from '../common/protocol/BenQiRewardProtocol'
import { AURIGAMI_COMPTROLLER, AURIGAMI_ORACLE, AURIGAMI_LENS } from '../../constants'

// Aurigami's UI doesn't show this pair
const excludePairs = ['DAI']

const pairConfig = <PairConfig>{
    comptroller: AURIGAMI_COMPTROLLER,
    oracle: AURIGAMI_ORACLE,
    lens: AURIGAMI_LENS,
}

export class AurigamiPairResolver implements ProtocolPairsResolver {
    public supportChains: ChainId[] = [ChainId.Aurora]
    public async resolve(chainId: ChainId, web3: Web3): Promise<SavingsProtocol[]> {
        if (!this.supportChains.includes(ChainId.Aurora)) {
            return []
        }
        const allPairs = await CompoundLikeFetcher.fetch(AURIGAMI_COMPTROLLER, chainId, web3)
        return allPairs
            .filter(
                (pair: [FungibleTokenDetailed, FungibleTokenDetailed]) =>
                    pair[0]?.symbol && !excludePairs.includes(pair[0].symbol),
            )
            .map((pair: [FungibleTokenDetailed, FungibleTokenDetailed]) => {
                const [bareToken, stakeToken] = pair
                if (stakeToken.symbol === AurigamiProtocol.nativeToken) {
                    pair[0] = createNativeToken(ChainId.Aurora)
                }
                return new AurigamiProtocol(pair, allPairs, pairConfig)
            })
    }
}

export const aurigamiLazyResolver = new AurigamiPairResolver()
