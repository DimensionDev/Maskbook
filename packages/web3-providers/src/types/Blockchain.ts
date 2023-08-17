import type { Block, BlockHeader, Transaction, TransactionDetailed, UTXO } from '@masknet/web3-shared-bitcoin'

/**
 * The blockchain provider interface for Bitcoin operations.
 */
export namespace BlockchainBaseAPI {
    export interface Provider {
        /**
         * Fetches the latest block on the blockchain.
         * @returns The latest block.
         */
        getLatestBlock?: () => Promise<Block>

        /**
         * Fetches the latest block height.
         * @returns The latest block height.
         */
        getLatestBlockHeight?: () => Promise<number>

        /**
         * Fetches a block by its height.
         * @param height - The height of the block to fetch.
         * @returns The requested block.
         */
        getBlockByHeight?: (height: number) => Promise<Block>

        /**
         * Fetches the block header of a block by its height.
         * @param height - The height of the block.
         * @returns The block header.
         */
        getBlockHeaderByHeight?: (height: number) => Promise<BlockHeader>

        /**
         * Fetches a transaction by its hash.
         * @param hash - The hash of the transaction.
         * @returns The detailed transaction.
         */
        getTransactionByHash?: (hash: string) => Promise<TransactionDetailed>

        /**
         * Fetches the balance of a specific address.
         * @param address - The address to check the balance for.
         * @returns The balance amount.
         */
        getBalance?: (address: string) => Promise<string>

        /**
         * Fetches unspent outputs for a specific address.
         * @param address - The address to fetch unspent outputs for.
         * @returns The array of unspent outputs (UTXOs).
         */
        getUnspentOutputs?: (address: string) => Promise<UTXO[]>

        /**
         * Estimates the transaction fee based on block confirmations (per kilobyte).
         * @param confirmations - The number of confirmations.
         * @returns The estimated fee amount.
         */
        estimateFeeByConfirmations?: (confirmations: number) => Promise<string>

        /**
         * Signs a transaction and returns the signed string.
         * @param transaction - The transaction to sign.
         * @returns The signed transaction in hex.
         */
        signTransaction?: (transaction: Transaction) => Promise<string>

        /**
         * Broadcasts a signed transaction and returns the transaction hash.
         * @param signed - The signed transaction in hex.
         * @returns The transaction hash.
         */
        broadcastSignedTransaction?: (signed: string) => Promise<string>
    }
}
