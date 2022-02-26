import { WalletState, Plugin } from '@masknet/plugin-infra'

export class Wallet extends WalletState {
    constructor(context: Plugin.Shared.SharedContext) {
        super(context)
    }
}
