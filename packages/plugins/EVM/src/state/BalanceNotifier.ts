import { BalanceNotifierState } from '@masknet/web3-state'
import type { ChainId } from '@masknet/web3-shared-evm'

export class BalanceNotifier extends BalanceNotifierState<ChainId> {
    constructor() {
        super()
    }
}
