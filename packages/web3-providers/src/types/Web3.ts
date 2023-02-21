import type {
    FungibleToken,
    NonFungibleCollection,
    NonFungibleToken,
    NonFungibleTokenContract,
    NonFungibleTokenMetadata,
    TransactionStatusType,
} from '@masknet/web3-shared-base'

export namespace Web3BaseAPI {
    export interface ERC721Metadata {
        name: string
        description: string
        image: string
    }

    export interface ERC1155Metadata {
        name: string
        decimals: number
        description: string
        image: string
    }

    export interface Provider<
        ChainId,
        AddressType,
        SchemaType,
        Transaction,
        TransactionDetailed,
        TransactionReceipt,
        TransactionSignature,
        Block,
        Provider,
        Web3,
    > {
        /** Create an instance from the network SDK. */
        getWeb3(chainId: ChainId): Web3
        /** Create an instance that implement the wallet protocol. */
        getWeb3Provider(chainId: ChainId): Provider
        /** Get the latest balance of the account. */
        getBalance(chainId: ChainId, address: string): Promise<string>
        /** Get native fungible token balance. */
        getNativeTokenBalance(chainId: ChainId, owner: string): Promise<string>
        /** Get fungible token balance. */
        getFungibleTokenBalance(chainId: ChainId, address: string, owner: string, schema?: SchemaType): Promise<string>
        /** Get non-fungible token balance. */
        getNonFungibleTokenBalance(
            chainId: ChainId,
            address: string,
            tokenId: string | undefined,
            owner: string,
            schema?: SchemaType,
        ): Promise<string>
        /** Get fungible token balance. */
        getFungibleTokensBalance(
            chainId: ChainId,
            listOfAddress: string[],
            owner: string,
        ): Promise<Record<string, string>>
        /** Get non-fungible token balance. */
        getNonFungibleTokensBalance(
            chainId: ChainId,
            listOfAddress: string[],
            owner: string,
        ): Promise<Record<string, string>>
        /** Get gas price */
        getGasPrice(chainId: ChainId): Promise<string>
        /** Get the source code of a on-chain program. */
        getCode(chainId: ChainId, address: string): Promise<string>
        /** Get address type of given address. */
        getAddressType(chainId: ChainId, address: string): Promise<AddressType | undefined>
        /** Get schema type of given token address. */
        getSchemaType(chainId: ChainId, address: string): Promise<SchemaType | undefined>
        /** Get the latest block by number. */
        getBlock(chainId: ChainId, noOrId: number | string): Promise<Block | null>
        /** Get the latest block number. */
        getBlockNumber(chainId: ChainId): Promise<number>
        /** Get the latest block unix timestamp. */
        getBlockTimestamp(chainId: ChainId): Promise<number>
        /** Get the detailed of transaction by id. */
        getTransaction(chainId: ChainId, hash: string): Promise<TransactionDetailed | null>
        /** Get the transaction receipt. */
        getTransactionReceipt(chainId: ChainId, hash: string): Promise<TransactionReceipt | null>
        /** Get the latest transaction status. */
        getTransactionStatus(chainId: ChainId, hash: string): Promise<TransactionStatusType>
        /** Get transaction nonce */
        getTransactionNonce(chainId: ChainId, address: string): Promise<number>
        /** Get a native fungible token. */
        getNativeToken(chainId: ChainId): Promise<FungibleToken<ChainId, SchemaType>>
        /** Get fungible token */
        getFungibleToken(chainId: ChainId, address: string): Promise<FungibleToken<ChainId, SchemaType>>
        /** Get non-fungible token */
        getNonFungibleToken(
            chainId: ChainId,
            address: string,
            tokenId: string,
            schema?: SchemaType,
        ): Promise<NonFungibleToken<ChainId, SchemaType>>
        /** Get a fungible token. */
        getNonFungibleTokenOwner(
            chainId: ChainId,
            address: string,
            tokenId: string,
            schema?: SchemaType,
        ): Promise<string>
        /** Get a non-fungible token. */
        getNonFungibleTokenOwnership(
            chainId: ChainId,
            address: string,
            tokenId: string,
            owner: string,
            schema?: SchemaType,
        ): Promise<boolean>
        getNonFungibleTokenMetadata(
            chainId: ChainId,
            address: string,
            tokenId?: string,
            schema?: SchemaType,
        ): Promise<NonFungibleTokenMetadata<ChainId>>
        /** Get a non-fungible token contract. */
        getNonFungibleTokenContract(
            chainId: ChainId,
            address: string,
            schema?: SchemaType,
        ): Promise<NonFungibleTokenContract<ChainId, SchemaType>>
        /** Get a non-fungible token collection. */
        getNonFungibleTokenCollection(
            chainId: ChainId,
            address: string,
            schema?: SchemaType,
        ): Promise<NonFungibleCollection<ChainId, SchemaType>>
        /** Query a transaction */
        callTransaction(chainId: ChainId, transaction: Transaction): Promise<string>
        /** Confirm a transaction */
        confirmTransaction(chainId: ChainId, hash: string, signal?: AbortSignal): Promise<TransactionReceipt>
        /** Estimate a transaction  */
        estimateTransaction(chainId: ChainId, transaction: Transaction, fallback?: number): Promise<string>
        /** Send a signed transaction */
        sendSignedTransaction(chainId: ChainId, signed: TransactionSignature): Promise<string>
    }
}
