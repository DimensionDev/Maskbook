import { BalanceNotifierState } from '@masknet/plugin-infra/web3'
import type { ChainId } from '@masknet/web3-shared-evm'

export class BalanceNotifier extends BalanceNotifierState<ChainId> {
    constructor() {
        super()
    }
}
