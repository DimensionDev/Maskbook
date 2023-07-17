import type { Account, ECKeyIdentifier, Proof, Wallet } from '@masknet/shared-base'
import type {
    FungibleToken,
    Network,
    NonFungibleCollection,
    NonFungibleToken,
    NonFungibleTokenContract,
    NonFungibleTokenMetadata,
    TransactionStatusType,
    TransferableNetwork,
} from '@masknet/web3-shared-base'
import type { ConnectionOptions_Base } from './ConnectionOptionsAPI.js'

export interface ConnectionAPI_Base<
    ChainId,
    AddressType,
    SchemaType,
    ProviderType,
    NetworkType,
    Signature,
    Operation,
    Transaction,
    TransactionReceipt,
    TransactionDetailed,
    TransactionSignature,
    Block,
    Web3,
    Web3Provider,
    Options = ConnectionOptions_Base<ChainId, ProviderType, Transaction>,
> {
    /** Get web3 instance */
    getWeb3(initial?: Options): Web3
    /** Get web3 provider instance */
    getWeb3Provider(initial?: Options): Web3Provider
    /** Get the latest balance of the account. */
    getBalance(address: string, initial?: Options): Promise<string>
    /** Get native fungible token balance. */
    getNativeTokenBalance(initial?: Options): Promise<string>
    /** Get fungible token balance. */
    getFungibleTokenBalance(address: string, schema?: SchemaType, initial?: Options): Promise<string>
    /** Get non-fungible token balance. */
    getNonFungibleTokenBalance(
        address: string,
        tokenId?: string,
        schema?: SchemaType,
        initial?: Options,
    ): Promise<string>
    /** Get fungible token balance. */
    getFungibleTokensBalance(listOfAddress: string[], initial?: Options): Promise<Record<string, string>>
    /** Get non-fungible token balance. */
    getNonFungibleTokensBalance(listOfAddress: string[], initial?: Options): Promise<Record<string, string>>
    /** Get gas price */
    getGasPrice(initial?: Options): Promise<string>
    /** Get the source code of a on-chain program. */
    getCode(address: string, initial?: Options): Promise<string>
    /** Get address type of given address. */
    getAddressType(address: string, initial?: Options): Promise<AddressType | undefined>
    /** Get schema type of given token address. */
    getSchemaType(address: string, initial?: Options): Promise<SchemaType | undefined>
    /** Get the latest block by number. */
    getBlock(no: number, initial?: Options): Promise<Block | null>
    /** Get the latest block number. */
    getBlockNumber(initial?: Options): Promise<number>
    /** Get the latest block unix timestamp. */
    getBlockTimestamp(initial?: Options): Promise<number>
    /** Get the detailed of transaction by id. */
    getTransaction(id: string, initial?: Options): Promise<TransactionDetailed | null>
    /** Get the transaction receipt. */
    getTransactionReceipt(id: string, initial?: Options): Promise<TransactionReceipt | null>
    /** Get the latest transaction status. */
    getTransactionStatus(id: string, initial?: Options): Promise<TransactionStatusType>
    /** Get the latest transaction nonce. */
    getTransactionNonce(address: string, initial?: Options): Promise<number>
    /** Get a native fungible token. */
    getNativeToken(initial?: Options): Promise<FungibleToken<ChainId, SchemaType>>
    /** Get a fungible token. */
    getFungibleToken(address: string, initial?: Options): Promise<FungibleToken<ChainId, SchemaType>>
    /** Get a non-fungible token. */
    getNonFungibleToken(
        address: string,
        tokenId: string | undefined,
        schema?: SchemaType,
        initial?: Options,
    ): Promise<NonFungibleToken<ChainId, SchemaType>>
    getNonFungibleTokenOwner(
        address: string,
        tokenId: string | undefined,
        schema?: SchemaType,
        initial?: Options,
    ): Promise<string>
    getNonFungibleTokenOwnership(
        address: string,
        tokenId: string | undefined,
        owner: string,
        schema?: SchemaType,
        initial?: Options,
    ): Promise<boolean>
    getNonFungibleTokenMetadata(
        address: string,
        tokenId: string | undefined,
        schema?: SchemaType,
        initial?: Options,
    ): Promise<NonFungibleTokenMetadata<ChainId>>
    /** Get a non-fungible token contract. */
    getNonFungibleTokenContract(
        address: string,
        schema?: SchemaType,
        initial?: Options,
    ): Promise<NonFungibleTokenContract<ChainId, SchemaType>>
    /** Get a non-fungible token collection. */
    getNonFungibleTokenCollection(
        address: string,
        schema?: SchemaType,
        initial?: Options,
    ): Promise<NonFungibleCollection<ChainId, SchemaType>>
    /** Get the currently connected account. */
    getAccount(initial?: Options): Promise<string>
    /** Get the currently chain id. */
    getChainId(initial?: Options): Promise<ChainId>
    /** Create a new account */
    createAccount(initial?: Options): Account<ChainId>
    /** Switch to sub network */
    switchChain?: (chainId: ChainId, initial?: Options) => Promise<void>
    /** Sign message */
    signMessage(type: string, message: string, initial?: Options): Promise<Signature>
    /** Verify message */
    verifyMessage(type: string, message: string, signature: Signature, initial?: Options): Promise<boolean>
    /** Approve a recipient for using a fungible token. */
    approveFungibleToken(address: string, recipient: string, amount: string, initial?: Options): Promise<string>
    /** Approve a recipient for using a non-fungible token. */
    approveNonFungibleToken(
        address: string,
        recipient: string,
        tokenId: string,
        schema?: SchemaType,
        initial?: Options,
    ): Promise<string>
    /** Approve a recipient for using all non-fungible tokens. */
    approveAllNonFungibleTokens(
        address: string,
        recipient: string,
        approved: boolean,
        schema?: SchemaType,
        initial?: Options,
    ): Promise<string>
    /** Transfer fungible token to */
    transferFungibleToken(
        address: string,
        recipient: string,
        amount: string,
        memo?: string,
        initial?: Options,
    ): Promise<string>
    /** Transfer non-fungible token to */
    transferNonFungibleToken(
        address: string | undefined,
        tokenId: string,
        recipient: string,
        amount: string,
        schema?: SchemaType,
        initial?: Options,
    ): Promise<string>
    /** Get all supported entry points */
    supportedEntryPoints?: () => Promise<string[]>
    /** Call a operation */
    callUserOperation?: (owner: string, operation: Operation, initial?: Options) => Promise<string>
    /** Send a operation */
    sendUserOperation?: (owner: string, operation: Operation, initial?: Options) => Promise<TransactionSignature>
    /** Transfer some native tokens from contract wallet */
    transfer?: (recipient: string, amount: string, initial?: Options) => Promise<string>
    /** Change owner of contract wallet */
    changeOwner?: (recipient: string, initial?: Options) => Promise<string>
    /** Fund contract wallet */
    fund?: (proof: Proof, initial?: Options) => Promise<string>
    /** Deploy contract wallet */
    deploy?: (owner: string, identifier?: ECKeyIdentifier, initial?: Options) => Promise<string>
    /** Sign a transaction */
    signTransaction(transaction: Transaction, initial?: Options): Promise<TransactionSignature>
    /** Sign multiple transactions */
    signTransactions(transactions: Transaction[], initial?: Options): Promise<TransactionSignature[]>
    /** Query a transaction */
    callTransaction(transaction: Transaction, initial?: Options): Promise<string>
    /** Send a transaction and wait for mining */
    sendTransaction(transaction: Transaction, initial?: Options): Promise<string>
    /** Estimate a transaction  */
    estimateTransaction?: (transaction: Transaction, fallback?: number, initial?: Options) => Promise<string>
    /** Send a signed transaction */
    sendSignedTransaction(signature: TransactionSignature, initial?: Options): Promise<string>
    /** Build connection */
    connect(initial?: Options): Promise<Account<ChainId>>
    /** Break connection */
    disconnect(initial?: Options): Promise<void>
    /** Get all wallets. */
    getWallets?: (initial?: Options) => Promise<Wallet[]>
    /** Add a new wallet. */
    addWallet?: (wallet: Wallet, initial?: Options) => Promise<void>
    /** Update a wallet. */
    updateWallet?: (address: string, wallet: Wallet, initial?: Options) => Promise<void>
    /** Add or update a new wallet on demand. */
    updateOrAddWallet?: (wallet: Wallet, initial?: Options) => Promise<void>
    /** Rename a wallet */
    renameWallet?: (address: string, name: string, initial?: Options) => Promise<void>
    /** Reset all wallets */
    resetAllWallets?: (initial?: Options) => Promise<void>
    /** Remove a wallet */
    removeWallet?: (address: string, password?: string | undefined, initial?: Options) => Promise<void>
    /** Update a bunch of wallets. */
    updateWallets?: (wallets: Wallet[], initial?: Options) => Promise<void>
    /** Remove a bunch of wallets. */
    removeWallets?: (wallets: Wallet[], initial?: Options) => Promise<void>
    /** Get all registered & customized networks. */
    getNetworks(initial?: Options): Promise<Array<Network<ChainId, SchemaType, NetworkType>>>
    /** Add a new network. */
    addNetwork(network: TransferableNetwork<ChainId, SchemaType, NetworkType>, initial?: Options): Promise<void>
    /** Rename a network. */
    renameNetwork(id: string, name: string, initial?: Options): Promise<void>
    /** Remove a network by id. */
    removeNetwork(id: string, initial?: Options): Promise<void>
    /** Confirm transaction */
    confirmTransaction(hash: string, initial?: Options): Promise<TransactionReceipt>
    /** Replace transaction */
    replaceTransaction(hash: string, config: Transaction, initial?: Options): Promise<void>
    /** Cancel transaction */
    cancelTransaction(hash: string, config: Transaction, initial?: Options): Promise<void>
}
