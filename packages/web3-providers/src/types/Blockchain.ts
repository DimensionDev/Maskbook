import type { Block, BlockHeader, Transaction, TransactionDetailed, UTXO } from '@masknet/web3-shared-bitcoin'

export namespace BlockchainBaseAPI {
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
         * Get block header by height
         * @param height
         * @returns
         */
        getBlockHeaderByHeight?: (height: number) => Promise<BlockHeader>

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
         * Estimate fee by block confirmations (per kilobyte)
         * @param confirmations
         * @returns
         */
        estimateFeeByConfirmations?: (confirmations: number) => Promise<string>

        /**
         * Sign a transaction and return a signed string. Leave for API-based wallet.
         */
        signTransaction?: (transaction: Transaction) => Promise<string>

        /**
         * Broadcast a transaction and return the transaction hash.
         * @param signed The signed transaction in hex
         * @returns
         */
        broadcastSignedTransaction?: (signed: string) => Promise<string>
    }
}
