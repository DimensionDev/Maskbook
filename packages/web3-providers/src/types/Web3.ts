import type { FungibleToken, TransactionStatusType } from '@masknet/web3-shared-base'

export namespace Web3BaseAPI {
    export interface Provider<ChainId, AddressType, SchemaType, Transaction, TransactionReceipt, Block, Web3> {
        /** Create an interactive Web3 SDK instance from the given chain ID. */
        createSDK(chainId: ChainId): Web3
        /** Get balance */
        getBalance(chainId: ChainId, address: string): Promise<string>
        /** Get gas price */
        getGasPrice(chainId: ChainId): Promise<string>
        /** Get code */
        getCode(chainId: ChainId, address: string): Promise<string>
        /** Get address type of the given one. */
        getAddressType(chainId: ChainId, address: string): Promise<AddressType | undefined>
        /** Get schema type of token contract */
        getSchemaType(chainId: ChainId, address: string): Promise<SchemaType | undefined>
        /** Get block */
        getBlock(chainId: ChainId, noOrId: number | string): Promise<Block>
        /** Get the latest block number */
        getBlockNumber(chainid: ChainId): Promise<number>
        /** Get the latest block timestamp */
        getBlockTimestamp(chainid: ChainId): Promise<string>
        /** Get transaction */
        getTransaction(chainId: ChainId, hash: string): Promise<Transaction>
        /** Get transaction receipt */
        getTransactionReceipt(chainId: ChainId, hash: string): Promise<TransactionReceipt>
        /** Get transaction status */
        getTransactionStatus(chainId: ChainId, hash: string): Promise<TransactionStatusType>
        /** Get transaction nonce */
        getTransactionNonce(chainId: ChainId, hash: string): Promise<string>
        /** Get native token */
        getNativeToken(chainId: ChainId): Promise<FungibleToken<ChainId, SchemaType>>
        /** Get fungible token */
        getFungibleToken(chainId: ChainId, address: string): Promise<FungibleToken<ChainId, SchemaType>>
        /** Get the owner address of non-fungible token. */
        getNonFungibleTokenOwner(
            chainId: ChainId,
            address: string,
            tokenId: string,
            schema?: SchemaType,
        ): Promise<string>
        /** Get the ownership of non-fungible token. */
        getNonFungibleTokenOwnership(
            chainId: ChainId,
            address: string,
            tokenId: string,
            schema?: SchemaType,
        ): Promise<boolean>
    }
}
