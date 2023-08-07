import type { ChainId } from '@masknet/web3-shared-bitcoin'
import { BalanceNotifierState } from '../../Base/state/BalanceNotifier.js'

export class BalanceNotifier extends BalanceNotifierState<ChainId> {
    constructor() {
        super()
    }
}
