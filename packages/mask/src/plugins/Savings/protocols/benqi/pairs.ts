import type Web3 from 'web3'
import { ChainId, createNativeToken } from '@masknet/web3-shared-evm'
import type { SavingsProtocol, ProtocolPairsResolver, PairToken } from '../../types'
import { BENQI_COMPTROLLER } from '../../constants'
import CompoundLikeFetcher from '../common/CompoundLikeFetcher'
import BenQiProtocol from './BenQiProtocol'
import type { Web3Helper } from '@masknet/plugin-infra/web3'

export type RewardToken = {
    symbol: string
    rewardType: number
}

const qiQiReward = 0
const qiAVAXReward = 1

const rewardTokens: RewardToken[] = [
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
    public async resolve(
        chainId: ChainId,
        web3: Web3,
        connection: Web3Helper.Web3ConnectionScope,
    ): Promise<SavingsProtocol[]> {
        if (!this.supportChains.includes(ChainId.Avalanche)) {
            return []
        }
        const allPairs = await CompoundLikeFetcher.fetch(BENQI_COMPTROLLER, chainId, web3, connection)
        return allPairs.map((pair: PairToken) => {
            const [bareToken, stakeToken] = pair
            if (stakeToken.symbol === BenQiProtocol.nativeToken) {
                pair[0] = createNativeToken(ChainId.Avalanche)
            }
            return new BenQiProtocol(pair, allPairs, rewardTokens)
        })
    }
}

export const benqiLazyResolver = new BenQiPairResolver()
