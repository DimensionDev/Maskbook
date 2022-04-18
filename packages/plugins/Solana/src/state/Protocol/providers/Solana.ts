import type { PublicKey } from '@solana/web3.js'
import Wallet from '@project-serum/sol-wallet-adapter'
import { ChainId, getNetworkTypeFromChainId, isValidAddress } from '@masknet/web3-shared-solana'
import type { Provider } from '../types'
import { BaseProvider } from './Base'

export class SolanaProvider extends BaseProvider implements Provider {
    private wallet: Wallet | null = null

    constructor(private provider = 'https://www.sollet.io') {
        super()
    }

    private createWallet(chainId: ChainId, callback: (publicKey: PublicKey) => void) {
        const wallet = this.wallet ?? new Wallet(this.provider, getNetworkTypeFromChainId(chainId))
        if (wallet.connected && wallet.publicKey && isValidAddress(wallet.publicKey.toBase58())) {
            callback(wallet.publicKey)
            return
        }
        wallet.on('connect', callback)
        return wallet
    }

    override async connect(chainId: ChainId) {
        return new Promise<{
            account: string
            chainId: ChainId
        }>((resolve, reject) => {
            try {
                this.createWallet(chainId, (publicKey) => {
                    resolve({
                        chainId,
                        account: publicKey.toBase58(),
                    })
                })
            } catch (error: unknown) {
                reject(error instanceof Error ? error : new Error('Failed to connect to provider.'))
            }
        })
    }

    override async disconnect() {
        if (!this.wallet) return
        await this.wallet.disconnect()
        this.wallet = null
    }
}
