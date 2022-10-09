import type { Plugin } from '@masknet/plugin-infra'
import { WalletState } from '@masknet/web3-state'

export class Wallet extends WalletState {
    constructor(context: Plugin.Shared.SharedUIContext) {
        super(context)
    }
}
