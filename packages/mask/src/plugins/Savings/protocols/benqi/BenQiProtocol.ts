import { ProtocolType } from '../../types'
import { default as BenQiRewardProtocol, RewardToken, PairConfig } from '../common/protocol/BenQiRewardProtocol'
import type { FungibleTokenDetailed } from '@masknet/web3-shared-evm'
import { BENQI_COMPTROLLER, BENQI_ChainlinkOracle } from '../../constants'

export default class BenQiProtocol extends BenQiRewardProtocol {
    static nativeToken = 'qiAVAX'

    constructor(
        pair: [FungibleTokenDetailed, FungibleTokenDetailed],
        allPairs: [[FungibleTokenDetailed, FungibleTokenDetailed]],
        rewardTokens: Array<RewardToken>,
    ) {
        super(pair, BenQiProtocol.nativeToken, allPairs, rewardTokens, <PairConfig>{
            comptroller: BENQI_COMPTROLLER,
            oracle: BENQI_ChainlinkOracle,
        })
    }

    override get type() {
        return ProtocolType.BENQI
    }
}
