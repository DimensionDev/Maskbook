import { BlockNumberNotifierState } from '@masknet/plugin-infra/web3'
import type { ChainId } from '@masknet/web3-shared-evm'

export class BlockNumberNotifier extends BlockNumberNotifierState<ChainId> {
    constructor() {
        super()
    }
}
