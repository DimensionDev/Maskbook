import type { Transaction } from '@masknet/web3-shared-solana'
import { BaseSolanaWalletProvider } from './Base.js'
import { unimplemented } from '@masknet/kit'
export class NoneProvider extends BaseSolanaWalletProvider {
    override signTransactions(transactions: Transaction[]): Promise<Transaction[]> {
        throw new Error('Method not implemented.')
    }
    override signMessage(): never {
        unimplemented()
    }
    override signTransaction(): never {
        unimplemented()
    }
}
