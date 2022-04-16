import type { Subscription } from 'use-subscription'
import type { Plugin } from '../types'
import type { Web3Plugin } from '../web3-types'

export class WalletState implements Web3Plugin.ObjectCapabilities.WalletState {
    public wallets?: Subscription<Web3Plugin.Wallet[]>
    public walletPrimary?: Subscription<Web3Plugin.Wallet | null>

    constructor(protected context: Plugin.Shared.SharedContext) {
        this.wallets = context.wallets
        this.walletPrimary = context.walletPrimary
    }

    async getAllWallets() {
        return this.context.wallets.getCurrentValue()
    }

    async addWallet(id: string, wallet: Web3Plugin.Wallet) {
        return this.context.addWallet(id, wallet)
    }

    async removeWallet(id: string) {
        return this.context.removeWallet(id)
    }
}
