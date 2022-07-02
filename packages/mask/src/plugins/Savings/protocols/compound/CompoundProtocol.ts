import { ProtocolType, PairToken } from '../../types'
import CompoundBlockBasedProtocol from '../common/protocol/CompoundBlockBasedProtocol'

export default class CompoundProtocol extends CompoundBlockBasedProtocol {
    static nativeToken = 'cETH'

    constructor(pair: PairToken) {
        super(pair, CompoundProtocol.nativeToken)
    }

    override get type() {
        return ProtocolType.Compound
    }
}
