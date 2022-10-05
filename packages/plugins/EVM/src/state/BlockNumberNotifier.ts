import { BlockNumberNotifierState } from '@masknet/web3-state'
import type { ChainId } from '@masknet/web3-shared-evm'

export class BlockNumberNotifier extends BlockNumberNotifierState<ChainId> {
    constructor() {
        super()
    }
}
