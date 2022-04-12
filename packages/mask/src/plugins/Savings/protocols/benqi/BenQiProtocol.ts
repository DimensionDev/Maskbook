import { ProtocolType } from '../../types'
import CompoundTimestampBasedProtocol from '../common/protocol/CompoundTimestampBasedProtocol'
import type { FungibleTokenDetailed } from '@masknet/web3-shared-evm'

export default class BenQiProtocol extends CompoundTimestampBasedProtocol {
    static nativeToken = 'qiAVAX'

    constructor(pair: [FungibleTokenDetailed, FungibleTokenDetailed]) {
        super(pair, BenQiProtocol.nativeToken)
    }

    override get type() {
        return ProtocolType.BENQI
    }
}
