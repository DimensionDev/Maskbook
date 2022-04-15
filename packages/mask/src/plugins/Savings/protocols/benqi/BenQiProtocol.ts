import { ProtocolType } from '../../types'
import { default as BenQiRewardProtocol, RewardToken, PairConfig } from '../common/protocol/BenQiRewardProtocol'
import type { FungibleTokenDetailed } from '@masknet/web3-shared-evm'
import { BENQI_COMPTROLLER } from '../../constants'

const BenQiChainlinkOracle = '0x316ae55ec59e0beb2121c0e41d4bdef8bf66b32b'

export default class BenQiProtocol extends BenQiRewardProtocol {
    static nativeToken = 'qiAVAX'

    constructor(
        pair: [FungibleTokenDetailed, FungibleTokenDetailed],
        allPairs: [[FungibleTokenDetailed, FungibleTokenDetailed]],
        rewardTokens: Array<RewardToken>,
    ) {
        super(pair, BenQiProtocol.nativeToken, allPairs, rewardTokens, <PairConfig>{
            comptroller: BENQI_COMPTROLLER,
            oracle: BenQiChainlinkOracle,
        })
    }

    override get type() {
        return ProtocolType.BENQI
    }
}
