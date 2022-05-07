import type Web3 from 'web3'
import { ChainId, FungibleTokenDetailed, createNativeToken } from '@masknet/web3-shared-evm'
import type { SavingsProtocol, ProtocolPairsResolver } from '../../types'
import CompoundLikeFetcher from '../common/CompoundLikeFetcher'
import TranquilProtocol from './TranquilProtocol'
import type { RewardToken, PairConfig } from '../common/protocol/BenQiRewardProtocol'
import { TRANQUIL_COMPTROLLER, TRANQUIL_Oracle } from '../../constants'

const TRANQ_INDEX = 0
const tqONE_INDEX = 1

export const rewardTokens: Array<RewardToken> = [
    {
        symbol: 'TRANQ',
        rewardType: TRANQ_INDEX,
    },
    {
        symbol: 'tqONE',
        rewardType: tqONE_INDEX,
    },
]

const pairConfig = <PairConfig>{
    comptroller: TRANQUIL_COMPTROLLER,
    oracle: TRANQUIL_Oracle,
}

const defaultChain = ChainId.Harmony

export class TranquilPairResolver implements ProtocolPairsResolver {
    public supportChains: ChainId[] = [defaultChain]
    public rewardTokens: Array<RewardToken> = rewardTokens

    public async resolve(chainId: ChainId, web3: Web3): Promise<SavingsProtocol[]> {
        if (!this.supportChains.includes(defaultChain)) {
            return []
        }
        const allPairs = await CompoundLikeFetcher.fetch(TRANQUIL_COMPTROLLER, chainId, web3)
        return allPairs.map((pair: [FungibleTokenDetailed, FungibleTokenDetailed]) => {
            const [bareToken, stakeToken] = pair
            if (stakeToken.symbol === TranquilProtocol.nativeToken) {
                pair[0] = createNativeToken(defaultChain)
            }
            return new TranquilProtocol(pair, allPairs, this.rewardTokens, pairConfig)
        })
    }
}

export const tranquilLazyResolver = new TranquilPairResolver()
