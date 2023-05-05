import { identity, pickBy } from 'lodash-es'
import { SolanaProviders, SolanaWeb3 } from '@masknet/web3-providers'
import type {
    FungibleToken,
    NonFungibleToken,
    NonFungibleCollection,
    NonFungibleTokenContract,
    NonFungibleTokenMetadata,
} from '@masknet/web3-shared-base'
import {
    AddressType,
    ChainId,
    createClient,
    decodeAddress,
    isNativeTokenAddress,
    ProviderType,
    type SchemaType,
    type TransactionReceipt,
    type TransactionSignature,
    type Web3Connection,
    type Web3ConnectionOptions,
} from '@masknet/web3-shared-solana'
import {
    type BlockResponse,
    type Connection as SolConnection,
    PublicKey,
    sendAndConfirmRawTransaction,
    SystemProgram,
    Transaction,
} from '@solana/web3.js'
import type { Plugin } from '@masknet/plugin-infra'
import type { Account, PartialRequired } from '@masknet/shared-base'
import { createTransferInstruction, getOrCreateAssociatedTokenAccount } from './spl-token/index.js'
import { SolanaWeb3StateRef } from '../../apis/Web3StateAPI.js'

class Connection implements Web3Connection {
    private connections: Map<ChainId, SolConnection> = new Map()

    constructor(
        private chainId: ChainId,
        private account: string,
        private providerType: ProviderType,
        private context?: Plugin.Shared.SharedUIContext,
    ) {}

    private getOptions(
        initial?: Web3ConnectionOptions,
        overrides?: Partial<Web3ConnectionOptions>,
    ): PartialRequired<Web3ConnectionOptions, 'account' | 'chainId' | 'providerType'> {
        return {
            account: this.account,
            chainId: this.chainId,
            providerType: this.providerType,
            ...pickBy(initial, identity),
            ...pickBy(overrides, identity),
        }
    }

    private _getWeb3Provider(initial?: Web3ConnectionOptions) {
        const options = this.getOptions(initial)
        return SolanaProviders[options.providerType]
    }

    private async _attachRecentBlockHash(transaction: Transaction, initial?: Web3ConnectionOptions) {
        const options = this.getOptions(initial)
        const connection = this.connections.get(options.chainId) ?? createClient(options.chainId)
        const blockHash = await connection.getRecentBlockhash()
        transaction.recentBlockhash = blockHash.blockhash
        return transaction
    }

    getWeb3(initial?: Web3ConnectionOptions) {
        const options = this.getOptions(initial)
        return this._getWeb3Provider(options).createWeb3(options)
    }

    getWeb3Provider(initial?: Web3ConnectionOptions) {
        const options = this.getOptions(initial)
        return this._getWeb3Provider(options).createWeb3Provider(options)
    }

    async connect(initial?: Web3ConnectionOptions): Promise<Account<ChainId>> {
        const options = this.getOptions(initial)
        return {
            account: '',
            chainId: ChainId.Mainnet,
            ...(await SolanaWeb3StateRef.value.Provider?.connect(options.providerType, options.chainId)),
        }
    }
    async disconnect(initial?: Web3ConnectionOptions): Promise<void> {
        const options = this.getOptions(initial)
        await SolanaWeb3StateRef.value.Provider?.disconnect(options.providerType)
    }
    private async transferSol(recipient: string, amount: string, initial?: Web3ConnectionOptions) {
        const options = this.getOptions(initial)
        if (!options.account) throw new Error('No payer provides.')
        const payerPubkey = new PublicKey(options.account)
        const recipientPubkey = new PublicKey(recipient)
        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: payerPubkey,
                toPubkey: recipientPubkey,
                lamports: Number.parseInt(amount, 10),
            }),
        )
        transaction.feePayer = payerPubkey
        await this._attachRecentBlockHash(transaction)

        return this.sendTransaction(transaction)
    }
    private async transferSplToken(
        address: string,
        recipient: string,
        amount: string,
        initial?: Web3ConnectionOptions,
    ): Promise<string> {
        const options = this.getOptions(initial)
        if (!options.account) throw new Error('No payer provides.')

        const payerPubkey = new PublicKey(options.account)
        const recipientPubkey = new PublicKey(recipient)
        const mintPubkey = new PublicKey(address)
        const signTransaction = this.signTransaction.bind(this)
        const connection = this.connections.get(options.chainId) ?? createClient(options.chainId)
        const formatTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            payerPubkey,
            mintPubkey,
            payerPubkey,
            signTransaction,
        )
        const toTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            payerPubkey,
            mintPubkey,
            recipientPubkey,
            signTransaction,
        )
        const transaction = new Transaction().add(
            createTransferInstruction(
                formatTokenAccount.address,
                toTokenAccount.address,
                payerPubkey,
                Number.parseInt(amount, 10),
            ),
        )
        const blockHash = await connection.getLatestBlockhash()
        transaction.feePayer = payerPubkey
        transaction.recentBlockhash = blockHash.blockhash
        const signature = await this.sendTransaction(transaction)
        return signature
    }
    approveFungibleToken(
        address: string,
        recipient: string,
        amount: string,
        initial?: Web3ConnectionOptions,
    ): Promise<string> {
        throw new Error('Method not implemented.')
    }
    approveNonFungibleToken(
        address: string,
        recipient: string,
        tokenId: string,
        schema?: SchemaType,
        initial?: Web3ConnectionOptions,
    ): Promise<string> {
        throw new Error('Method not implemented.')
    }
    approveAllNonFungibleTokens(
        address: string,
        recipient: string,
        approved: boolean,
        schema?: SchemaType,
        initial?: Web3ConnectionOptions,
    ): Promise<string> {
        throw new Error('Method not implemented.')
    }
    async transferFungibleToken(
        address: string,
        recipient: string,
        amount: string,
        memo?: string,
        initial?: Web3ConnectionOptions,
    ): Promise<string> {
        const options = this.getOptions(initial)
        if (isNativeTokenAddress(address)) {
            return this.transferSol(recipient, amount, options)
        }
        return this.transferSplToken(address, recipient, amount, options)
    }
    transferNonFungibleToken(
        address: string,
        tokenId: string,
        recipient: string,
        amount: string,
        schema?: SchemaType,
        initial?: Web3ConnectionOptions,
    ): Promise<string> {
        const options = this.getOptions(initial)
        return this.transferSplToken(address, recipient, amount, options)
    }
    getGasPrice(initial?: Web3ConnectionOptions): Promise<string> {
        throw new Error('Method not implemented.')
    }
    getAddressType(address: string, initial?: Web3ConnectionOptions): Promise<AddressType | undefined> {
        return Promise.resolve(AddressType.Default)
    }
    getSchemaType(address: string, initial?: Web3ConnectionOptions): Promise<SchemaType> {
        throw new Error('Method not implemented.')
    }
    getNonFungibleTokenContract(
        address: string,
        schema?: SchemaType,
        initial?: Web3ConnectionOptions,
    ): Promise<NonFungibleTokenContract<ChainId, SchemaType>> {
        throw new Error('Method not implemented.')
    }
    getNonFungibleTokenCollection(
        address: string,
        schema?: SchemaType,
        initial?: Web3ConnectionOptions,
    ): Promise<NonFungibleCollection<ChainId, SchemaType>> {
        throw new Error('Method not implemented.')
    }
    async switchChain(chainId: ChainId, initial?: Web3ConnectionOptions) {
        const options = this.getOptions(initial)
        await SolanaProviders[options.providerType].switchChain(chainId)
    }
    getNativeToken(initial?: Web3ConnectionOptions): Promise<FungibleToken<ChainId, SchemaType>> {
        const options = this.getOptions(initial)
        return SolanaWeb3.getNativeToken(options.chainId)
    }
    async getNativeTokenBalance(initial?: Web3ConnectionOptions): Promise<string> {
        const options = this.getOptions(initial)
        return SolanaWeb3.getNativeTokenBalance(options.chainId, options.account)
    }
    async getFungibleTokenBalance(
        address: string,
        schema?: SchemaType,
        initial?: Web3ConnectionOptions,
    ): Promise<string> {
        const options = this.getOptions(initial)
        return SolanaWeb3.getFungibleTokenBalance(options.chainId, address, options.account, schema)
    }
    getNonFungibleTokenBalance(
        address: string,
        tokenId?: string,
        schema?: SchemaType,
        initial?: Web3ConnectionOptions,
    ): Promise<string> {
        throw new Error('Method not implemented.')
    }
    async getFungibleTokensBalance(
        listOfAddress: string[],
        initial?: Web3ConnectionOptions,
    ): Promise<Record<string, string>> {
        const options = this.getOptions(initial)
        return SolanaWeb3.getFungibleTokensBalance(options.chainId, listOfAddress, options.account)
    }
    getNonFungibleTokensBalance(
        listOfAddress: string[],
        initial?: Web3ConnectionOptions,
    ): Promise<Record<string, string>> {
        throw new Error('Method not implemented.')
    }
    getCode(address: string, initial?: Web3ConnectionOptions): Promise<string> {
        throw new Error('Method not implemented.')
    }

    getWeb3Connection(initial?: Web3ConnectionOptions) {
        const options = this.getOptions(initial)
        return SolanaWeb3.getWeb3Connection(options.chainId)
    }

    getAccount(initial?: Web3ConnectionOptions) {
        const options = this.getOptions(initial)
        return Promise.resolve(options.account)
    }

    getAccountInfo(account: string, initial?: Web3ConnectionOptions) {
        const options = this.getOptions(initial, {
            account,
        })
        return this.getWeb3Connection(options).getAccountInfo(decodeAddress(account))
    }

    getChainId(initial?: Web3ConnectionOptions) {
        const options = this.getOptions(initial)
        return Promise.resolve(options.chainId)
    }

    async getBlock(no: number, initial?: Web3ConnectionOptions): Promise<BlockResponse | null> {
        const options = this.getOptions(initial)
        return SolanaWeb3.getBlock(options.chainId, no)
    }

    async getBlockNumber(initial?: Web3ConnectionOptions) {
        const options = this.getOptions(initial)
        return SolanaWeb3.getBlockNumber(options.chainId)
    }

    async getBlockTimestamp(initial?: Web3ConnectionOptions): Promise<number> {
        const options = this.getOptions(initial)
        return SolanaWeb3.getBlockTimestamp(options.chainId)
    }

    async getBalance(account: string, initial?: Web3ConnectionOptions) {
        const options = this.getOptions(initial)
        return SolanaWeb3.getBalance(options.chainId, account)
    }

    getTransaction(id: string, initial?: Web3ConnectionOptions) {
        const options = this.getOptions(initial)
        return SolanaWeb3.getTransaction(options.chainId, id)
    }

    async getTransactionReceipt(id: string, initial?: Web3ConnectionOptions): Promise<TransactionReceipt | null> {
        const options = this.getOptions(initial)
        return SolanaWeb3.getTransactionReceipt(options.chainId, id)
    }

    async getTransactionStatus(id: string, initial?: Web3ConnectionOptions) {
        const options = this.getOptions(initial)
        return SolanaWeb3.getTransactionStatus(options.chainId, id)
    }

    async signMessage(type: string, message: string, initial?: Web3ConnectionOptions) {
        const options = this.getOptions(initial)
        return this._getWeb3Provider(options).signMessage(message)
    }

    async verifyMessage(
        type: string,
        message: string,
        signature: string,
        initial?: Web3ConnectionOptions,
    ): Promise<boolean> {
        const options = this.getOptions(initial)
        return this._getWeb3Provider(options).verifyMessage(message, signature)
    }

    async signTransaction(transaction: Transaction, initial?: Web3ConnectionOptions) {
        const options = this.getOptions(initial)
        return this._getWeb3Provider(options).signTransaction(transaction)
    }

    signTransactions(transactions: Transaction[], initial?: Web3ConnectionOptions) {
        const options = this.getOptions(initial)
        return Promise.all(transactions.map((x) => this.signTransaction(x, options)))
    }

    callTransaction(transaction: Transaction, initial?: Web3ConnectionOptions): Promise<string> {
        throw new Error('Method not implemented.')
    }

    async sendTransaction(transaction: Transaction, initial?: Web3ConnectionOptions) {
        const options = this.getOptions(initial)
        const signedTransaction = await this.signTransaction(transaction)
        return sendAndConfirmRawTransaction(this.getWeb3Connection(options), signedTransaction.serialize())
    }

    sendSignedTransaction(signature: TransactionSignature, initial?: Web3ConnectionOptions) {
        const options = this.getOptions(initial)
        return SolanaWeb3.sendSignedTransaction(options.chainId, signature)
    }

    async getTransactionNonce(account: string, initial?: Web3ConnectionOptions): Promise<number> {
        const options = this.getOptions(initial, {
            account,
        })
        return SolanaWeb3.getTransactionNonce(options.chainId, options.account)
    }

    async getFungibleToken(
        address: string,
        initial?: Web3ConnectionOptions,
    ): Promise<FungibleToken<ChainId, SchemaType>> {
        const options = this.getOptions(initial)
        return SolanaWeb3.getFungibleToken(options.chainId, address)
    }
    async getNonFungibleToken(
        address: string,
        tokenId: string,
        schema?: SchemaType,
        initial?: Web3ConnectionOptions,
    ): Promise<NonFungibleToken<ChainId, SchemaType>> {
        const options = this.getOptions(initial)
        return SolanaWeb3.getNonFungibleToken(options.chainId, address, tokenId, schema)
    }
    getNonFungibleTokenOwner(
        address: string,
        tokenId: string,
        schema?: SchemaType,
        initial?: Web3ConnectionOptions,
    ): Promise<string> {
        throw new Error('Method not implemented.')
    }
    getNonFungibleTokenOwnership(
        address: string,
        tokenId: string,
        owner: string,
        schema?: SchemaType | undefined,
        initial?: Web3ConnectionOptions,
    ): Promise<boolean> {
        throw new Error('Method not implemented.')
    }
    getNonFungibleTokenMetadata(
        address: string,
        tokenId: string,
        schema?: SchemaType,
        initial?: Web3ConnectionOptions,
    ): Promise<NonFungibleTokenMetadata<ChainId>> {
        throw new Error('Method not implemented.')
    }
    confirmTransaction(hash: string, initial?: Web3ConnectionOptions): Promise<TransactionReceipt> {
        throw new Error('Method not implemented.')
    }
    replaceTransaction(hash: string, config: Transaction, options?: Web3ConnectionOptions): Promise<void> {
        throw new Error('Method not implemented.')
    }
    cancelTransaction(hash: string, config: Transaction, options?: Web3ConnectionOptions): Promise<void> {
        throw new Error('Method not implemented.')
    }
}

export function createConnection(
    context: Plugin.Shared.SharedUIContext,
    options?: {
        chainId?: ChainId
        account?: string
        providerType?: ProviderType
    },
) {
    const { chainId = ChainId.Mainnet, account = '', providerType = ProviderType.Phantom } = options ?? {}

    return new Connection(chainId, account, providerType, context)
}
