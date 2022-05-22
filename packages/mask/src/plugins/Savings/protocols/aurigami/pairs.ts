import type Web3 from 'web3'
import {
    ChainId,
    FungibleTokenDetailed,
    createNativeToken,
    ZERO_ADDRESS,
    getAurigamiConstants,
} from '@masknet/web3-shared-evm'
import type { SavingsProtocol, ProtocolPairsResolver } from '../../types'
import CompoundLikeFetcher from '../common/CompoundLikeFetcher'
import AurigamiProtocol from './AurigamiProtocol'
import type { PairConfig } from '../common/protocol/BenQiRewardProtocol'

export const AURIGAMI_COMPTROLLER = getAurigamiConstants(ChainId.Aurora).COMPTROLLER || ZERO_ADDRESS
export const AURIGAMI_ORACLE = getAurigamiConstants(ChainId.Aurora).ORACLE || ZERO_ADDRESS
export const AURIGAMI_LENS = getAurigamiConstants(ChainId.Aurora).LENS || ZERO_ADDRESS

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
