import type { ChainId } from '@masknet/web3-shared-evm'
import { BlockNumberNotifierState } from '../../Base/state/BlockNumberNotifier.js'

export class BlockNumberNotifier extends BlockNumberNotifierState<ChainId> {
    constructor() {
        super()
    }
}
