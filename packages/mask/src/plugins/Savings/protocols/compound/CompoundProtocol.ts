import { ProtocolType } from '../../types'
import CompoundBlockBasedProtocol from '../common/protocol/CompoundBlockBasedProtocol'
import type { FungibleTokenDetailed } from '@masknet/web3-shared-evm'

export default class CompoundProtocol extends CompoundBlockBasedProtocol {
    static nativeToken = 'cETH'

    constructor(pair: [FungibleTokenDetailed, FungibleTokenDetailed]) {
        super(pair, CompoundProtocol.nativeToken)
    }

    override get type() {
        return ProtocolType.Compound
    }
}
