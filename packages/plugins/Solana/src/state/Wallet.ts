import type { Plugin } from '@masknet/plugin-infra'
import { WalletState } from '@masknet/plugin-infra/web3'

export class Wallet extends WalletState {
    constructor(override context: Plugin.Shared.SharedUIContext) {
        super(context)
    }
}
