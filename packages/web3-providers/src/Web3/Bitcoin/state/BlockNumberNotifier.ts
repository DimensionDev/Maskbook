import type { ChainId } from '@masknet/web3-shared-bitcoin'
import { BlockNumberNotifierState } from '../../Base/state/BlockNumberNotifier.js'

export class BlockNumberNotifier extends BlockNumberNotifierState<ChainId> {
    constructor() {
        super()
    }
}
