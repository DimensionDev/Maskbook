import base58 from 'bs58'
import type { Transaction } from '@solana/web3.js'
import * as Wallet from /* webpackDefer: true */ '@project-serum/sol-wallet-adapter'
import { type ChainId, ProviderType } from '@masknet/web3-shared-solana'
import { BaseSolanaWalletProvider } from './Base.js'

export class SolanaSolletProvider extends BaseSolanaWalletProvider {
    private wallet: Wallet.default | null = null
    private providerURL = 'https://www.sollet.io'
    private get solanaProvider() {
        if (!this.wallet) throw new Error('No sollet connection.')
        return this.wallet
    }
    private set solanaProvider(newWallet: Wallet.default) {
        this.wallet = newWallet
    }

    override async signMessage(message: string) {
        const data = new TextEncoder().encode(message)
        const { signature } = await this.solanaProvider.sign(data, 'uft8')
        return base58.encode(signature)
    }

    override signTransaction(transaction: Transaction) {
        return this.solanaProvider.signTransaction(transaction)
    }

    override signTransactions(transactions: Transaction[]) {
        return this.solanaProvider.signAllTransactions(transactions)
    }

    override async connect(chainId: ChainId) {
        this.solanaProvider = new Wallet.default(this.providerURL, '')
        await this.solanaProvider.connect()
        return {
            chainId,
            account: this.solanaProvider.publicKey?.toBase58() ?? '',
        }
    }

    override async disconnect() {
        this.solanaProvider = new Wallet.default(this.providerURL, '')
        await this.solanaProvider.disconnect()
        this.emitter.emit('disconnect', ProviderType.Sollet)

        // clean the internal wallet
        this.wallet = null
    }
}
