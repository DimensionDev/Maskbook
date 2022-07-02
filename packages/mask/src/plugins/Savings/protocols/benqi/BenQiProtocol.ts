import { ProtocolType, PairToken } from '../../types'
import { default as BenQiRewardProtocol, RewardToken, PairConfig } from '../common/protocol/BenQiRewardProtocol'
import { BENQI_COMPTROLLER, BENQI_ChainlinkOracle } from '../../constants'

export default class BenQiProtocol extends BenQiRewardProtocol {
    static nativeToken = 'qiAVAX'

    constructor(pair: PairToken, allPairs: PairToken[], rewardTokens: RewardToken[]) {
        super(pair, BenQiProtocol.nativeToken, allPairs, rewardTokens, <PairConfig>{
            comptroller: BENQI_COMPTROLLER,
            oracle: BENQI_ChainlinkOracle,
        })
    }

    override get type() {
        return ProtocolType.BENQI
    }
}
