import type { Account } from '@masknet/shared-base'
import type { FungibleToken, TransactionStatusType } from '@masknet/web3-shared-base'
import type { BaseConnectionOptions } from './ConnectionOptions.js'

export interface BaseConnection<
    ChainId,
    AddressType,
    SchemaType,
    ProviderType,
    Signature,
    Transaction,
    TransactionReceipt,
    TransactionDetailed,
    TransactionSignature,
    Options = BaseConnectionOptions<ChainId, ProviderType, Transaction>,
> {
    /** Get the latest balance of the account. */
    getBalance(address: string, initial?: Options): Promise<string>

    /** Get native fungible token balance. */
    getNativeTokenBalance(initial?: Options): Promise<string>

    /** Get fungible token balance. */
    getFungibleTokenBalance(address: string, schema?: SchemaType, initial?: Options): Promise<string>

    /** Get fungible token balance. */
    getFungibleTokensBalance(listOfAddress: string[], initial?: Options): Promise<Record<string, string>>

    /** Get gas price */
    getGasPrice(initial?: Options): Promise<string>

    /** Get address type of given address. */
    getAddressType(address: string, initial?: Options): Promise<AddressType | undefined>

    /** Get the latest block number. */
    getBlockNumber(initial?: Options): Promise<number>

    /** Get the detailed of transaction by id. */
    getTransaction(id: string, initial?: Options): Promise<TransactionDetailed | null>

    /** Get the transaction receipt. */
    getTransactionReceipt(id: string, initial?: Options): Promise<TransactionReceipt | null>

    /** Get the latest transaction status. */
    getTransactionStatus(id: string, initial?: Options): Promise<TransactionStatusType>

    /** Get a fungible token. */
    getFungibleToken(address: string, initial?: Options): Promise<FungibleToken<ChainId, SchemaType>>

    /** Get the currently connected account. */
    getAccount(initial?: Options): Promise<string>

    /** Get the currently chain id. */
    getChainId(initial?: Options): Promise<ChainId>

    /** Switch to sub network */
    switchChain?: (chainId: ChainId, initial?: Options) => Promise<void>

    /** Sign message */
    signMessage(type: string, message: string, initial?: Options): Promise<Signature>

    /** Transfer fungible token to */
    transferFungibleToken(
        address: string,
        recipient: string,
        amount: string,
        memo?: string,
        initial?: Options,
    ): Promise<string>

    /** Sign a transaction */
    signTransaction(transaction: Transaction, initial?: Options): Promise<TransactionSignature>

    /** Sign multiple transactions */
    signTransactions(transactions: Transaction[], initial?: Options): Promise<TransactionSignature[]>

    /** Send a transaction and wait for mining */
    sendTransaction(transaction: Transaction, initial?: Options): Promise<string>

    /** Build connection */
    connect(initial?: Options): Promise<Account<ChainId>>

    /** Break connection */
    disconnect(initial?: Options): Promise<void>

    /** Rename a wallet */
    renameWallet?: (address: string, name: string, initial?: Options) => Promise<void>
    /** Remove a wallet */
    removeWallet?: (address: string, password?: string | undefined, initial?: Options) => Promise<void>
    /** Reset all wallets */
    resetAllWallets?: (initial?: Options) => Promise<void>
}
