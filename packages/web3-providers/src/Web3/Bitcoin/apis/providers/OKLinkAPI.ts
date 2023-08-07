import type { Block, Transaction, TransactionDetailed, UTXO, Web3 } from '@masknet/web3-shared-bitcoin'

export class OKXLinkAPI implements Web3 {
    getBalance(address: string): Promise<string> {
        throw new Error('Method not implemented.')
    }
    getUTXOs(address: string): Promise<UTXO[]> {
        throw new Error('Method not implemented.')
    }
    getChainId(): Promise<number> {
        throw new Error('Method not implemented.')
    }
    getBlockNumber(): Promise<number> {
        throw new Error('Method not implemented.')
    }
    getBlockByHash(hash: string): Promise<Block> {
        throw new Error('Method not implemented.')
    }
    getBlockByNumber(height: number): Promise<Block> {
        throw new Error('Method not implemented.')
    }
    getTransactionByHash(hash: string): Promise<TransactionDetailed> {
        throw new Error('Method not implemented.')
    }
    sendTransaction(transaction: Transaction): Promise<void> {
        throw new Error('Method not implemented.')
    }
    signTransaction(transaction: Transaction): Promise<string> {
        throw new Error('Method not implemented.')
    }
    sendRawTransaction(signed: string): Promise<string> {
        throw new Error('Method not implemented.')
    }
}
