import type { Subscription } from 'use-subscription'
import type { Wallet, WalletState as Web3WalletState } from '@masknet/web3-shared-base'
import type { Plugin } from '../types'

export class WalletState implements Web3WalletState {
    public wallets?: Subscription<Wallet[]>
    public walletPrimary?: Subscription<Wallet | null>

    constructor(protected context: Plugin.Shared.SharedContext) {
        this.wallets = context.wallets
        this.walletPrimary = context.walletPrimary
    }

    async getAllWallets() {
        return this.context.getWallets()
    }

    async addWallet(id: string, wallet: Wallet) {
        return this.context.addWallet(id, wallet)
    }

    async removeWallet(id: string) {
        return this.context.removeWallet(id)
    }
}
