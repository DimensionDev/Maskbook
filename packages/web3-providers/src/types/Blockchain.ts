import type { Block, Transaction, TransactionDetailed, UTXO } from '@masknet/web3-shared-bitcoin'

export namespace BlockchainAPI {
    export interface Provider {
        /**
         * Get the block latest block
         */
        getLatestBlock?: () => Promise<Block>

        /**
         * Get the latest block height.
         * @returns
         */
        getLatestBlockHeight?: () => Promise<number>

        /**
         * Get block by height
         * @returns
         */
        getBlockByHeight?: (height: number) => Promise<Block>

        /**
         * Get transaction with given hash
         */
        getTransactionByHash?: () => Promise<TransactionDetailed>

        /**
         * Provider has computed balance API that accumulates unspent outputs in a total balance.
         * @param address
         * @returns
         */
        getBalance?: (address: string) => Promise<string>

        /**
         * Provider only returns UTXOs
         * @param address
         */
        getUnspentOutputs?: (address: string) => Promise<UTXO[]>

        /**
         * Leave for API-based wallet.
         */
        signTransaction?: (transaction: Transaction) => Promise<string>

        /**
         * Broadcast a transaction and return the transaction hash.
         * @param signed The signed transaction
         * @returns
         */
        broadcastTransaction?: (signed: string) => Promise<string>
    }
}
