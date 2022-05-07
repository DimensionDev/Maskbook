import type Web3 from 'web3'
import { ChainId, FungibleTokenDetailed, createNativeToken } from '@masknet/web3-shared-evm'
import type { SavingsProtocol, ProtocolPairsResolver } from '../../types'
import { BENQI_COMPTROLLER } from '../../constants'
import CompoundLikeFetcher from '../common/CompoundLikeFetcher'
import BenQiProtocol from './BenQiProtocol'

export type RewardToken = {
    symbol: string
    rewardType: number
}

const qiQiReward = 0
const qiAVAXReward = 1

const rewardTokens: Array<RewardToken> = [
    {
        symbol: 'qiQI',
        rewardType: qiQiReward,
    },
    {
        symbol: 'qiAVAX',
        rewardType: qiAVAXReward,
    },
]

export class BenQiPairResolver implements ProtocolPairsResolver {
    public supportChains: ChainId[] = [ChainId.Avalanche]
    public async resolve(chainId: ChainId, web3: Web3): Promise<SavingsProtocol[]> {
        if (!this.supportChains.includes(ChainId.Avalanche)) {
            return []
        }
        const allPairs = await CompoundLikeFetcher.fetch(BENQI_COMPTROLLER, chainId, web3)
        return allPairs.map((pair: [FungibleTokenDetailed, FungibleTokenDetailed]) => {
            const [bareToken, stakeToken] = pair
            if (stakeToken.symbol === BenQiProtocol.nativeToken) {
                pair[0] = createNativeToken(ChainId.Avalanche)
            }
            return new BenQiProtocol(pair, allPairs, rewardTokens)
        })
    }
}

export const benqiLazyResolver = new BenQiPairResolver()
