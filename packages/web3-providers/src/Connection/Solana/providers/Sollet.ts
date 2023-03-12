import base58 from 'bs58'
import type { Transaction } from '@solana/web3.js'
import Wallet from '@project-serum/sol-wallet-adapter'
import { type ChainId, ProviderType, type Web3Provider, type Web3 } from '@masknet/web3-shared-solana'
import { BaseProvider } from './Base.js'
import type { WalletAPI } from '../../../entry-types.js'

export class SolletProvider
    extends BaseProvider
    implements WalletAPI.Provider<ChainId, ProviderType, Web3Provider, Web3>
{
    private wallet: Wallet | null = null

    private get solanaProvider() {
        if (!this.wallet) throw new Error('No sollet connection.')
        return this.wallet
    }

    private set solanaProvider(newWallet: Wallet) {
        this.wallet = newWallet
    }

    constructor(private providerURL = 'https://www.sollet.io') {
        super()
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
        this.solanaProvider = new Wallet(this.providerURL, '')
        await this.solanaProvider.connect()
        return {
            chainId,
            account: this.solanaProvider.publicKey?.toBase58() ?? '',
        }
    }

    override async disconnect() {
        this.solanaProvider = new Wallet(this.providerURL, '')
        await this.solanaProvider.disconnect()
        this.emitter.emit('disconnect', ProviderType.Sollet)

        // clean the internal wallet
        this.wallet = null
    }
}
