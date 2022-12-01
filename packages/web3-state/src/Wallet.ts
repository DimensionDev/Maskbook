import type { Subscription } from 'use-subscription'
import type { Wallet, WalletState as Web3WalletState } from '@masknet/web3-shared-base'
import type { Plugin } from '@masknet/plugin-infra'

export class WalletState implements Web3WalletState {
    public wallets?: Subscription<Wallet[]>
    public walletPrimary?: Subscription<Wallet | null>

    constructor(protected context: Plugin.Shared.SharedUIContext) {
        this.wallets = context.wallets
        this.walletPrimary = context.walletPrimary
    }

    async getAllWallets() {
        return this.context.getWallets()
    }

    async getWallet(id: string) {
        return this.getAllWallets()
    }

    async addWallet(id: string, wallet: Wallet) {
        return this.context.addWallet(id, wallet)
    }

    async updateWallet(id: string, wallet: Partial<Wallet>) {}

    async removeWallet(id: string) {
        return this.context.removeWallet(id)
    }
}
