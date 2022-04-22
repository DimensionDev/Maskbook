import type { Plugin } from '@masknet/plugin-infra'
import { WalletState, Web3Plugin } from '@masknet/plugin-infra/web3'

export class Wallet extends WalletState implements Web3Plugin.ObjectCapabilities.WalletState {
    constructor(context: Plugin.Shared.SharedContext) {
        super(context)
    }
}
