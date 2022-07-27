import { MagicEden } from '@masknet/web3-providers'
import {
    Account,
    ConnectionOptions,
    createNonFungibleToken,
    FungibleToken,
    NonFungibleToken,
    NonFungibleTokenCollection,
    NonFungibleTokenContract,
    NonFungibleTokenMetadata,
    TransactionStatusType,
} from '@masknet/web3-shared-base'
import { ChainId, createNativeToken, decodeAddress, ProviderType, SchemaType } from '@masknet/web3-shared-solana'
import {
    BlockResponse,
    Connection as SolConnection,
    PublicKey,
    sendAndConfirmRawTransaction,
    SystemProgram,
    Transaction,
} from '@solana/web3.js'
import { NETWORK_ENDPOINTS, SOL_ADDRESS } from '../../constants'
import { SolanaRPC } from '../../messages'
import { Web3StateSettings } from '../../settings'
import type { Plugin } from '@masknet/plugin-infra'
import { isNativeTokenAddress } from '../../utils'
import { Providers } from './provider'
import { createTransferInstruction, getOrCreateAssociatedTokenAccount } from './spl-token'
import type { SolanaConnection as BaseConnection, SolanaWeb3ConnectionOptions } from './types'
import type { PartialRequired } from '@masknet/shared-base'

class Connection implements BaseConnection {
    private connections: Map<ChainId, SolConnection> = new Map()

    constructor(
        private chainId: ChainId,
        private account: string,
        private providerType: ProviderType,
        private context?: Plugin.Shared.SharedContext,
    ) {}

    private getOptions(
        initial?: SolanaWeb3ConnectionOptions,
        overrides?: Partial<SolanaWeb3ConnectionOptions>,
    ): PartialRequired<SolanaWeb3ConnectionOptions, 'account' | 'chainId' | 'providerType'> {
        return {
            account: this.account,
            chainId: this.chainId,
            providerType: this.providerType,
            ...initial,
            ...overrides,
        }
    }

    private _getWeb3Provider(initial?: SolanaWeb3ConnectionOptions) {
        const options = this.getOptions(initial)
        return Providers[options.providerType]
    }

    private async _attachRecentBlockHash(transaction: Transaction, initial?: SolanaWeb3ConnectionOptions) {
        const options = this.getOptions(initial)
        const connection =
            this.connections.get(options.chainId) ?? new SolConnection(NETWORK_ENDPOINTS[options.chainId])
        const blockHash = await connection.getRecentBlockhash()
        transaction.recentBlockhash = blockHash.blockhash
        return transaction
    }

    async getWeb3(initial?: SolanaWeb3ConnectionOptions) {
        const options = this.getOptions(initial)
        return this._getWeb3Provider(options).createWeb3(options)
    }

    getWeb3Provider(initial?: SolanaWeb3ConnectionOptions) {
        const options = this.getOptions(initial)
        return this._getWeb3Provider(options).createWeb3Provider(options)
    }

    async connect(initial?: SolanaWeb3ConnectionOptions): Promise<Account<ChainId>> {
        const options = this.getOptions(initial)
        return {
            account: '',
            chainId: ChainId.Mainnet,
            ...(await Web3StateSettings.value.Provider?.connect(options.chainId, options.providerType)),
        }
    }
    async disconnect(initial?: SolanaWeb3ConnectionOptions): Promise<void> {
        const options = this.getOptions(initial)
        await Web3StateSettings.value.Provider?.disconnect(options.providerType)
    }
    private async transferSol(recipient: string, amount: string, initial?: SolanaWeb3ConnectionOptions) {
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
        initial?: SolanaWeb3ConnectionOptions,
    ): Promise<string> {
        const options = this.getOptions(initial)
        if (!options.account) throw new Error('No payer provides.')
        const connection =
            this.connections.get(options.chainId) ?? new SolConnection(NETWORK_ENDPOINTS[options.chainId])

        const payerPubkey = new PublicKey(options.account)
        const recipientPubkey = new PublicKey(recipient)
        const mintPubkey = new PublicKey(address)
        const signTransaction = this.signTransaction.bind(this)
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
        const blockHash = await connection.getRecentBlockhash()
        transaction.feePayer = payerPubkey
        transaction.recentBlockhash = blockHash.blockhash

        const signature = await this.sendTransaction(transaction)
        return signature
    }
    approveFungibleToken(
        address: string,
        recipient: string,
        amount: string,
        initial?: SolanaWeb3ConnectionOptions,
    ): Promise<string> {
        throw new Error('Method not implemented.')
    }
    approveNonFungibleToken(
        address: string,
        recipient: string,
        tokenId: string,
        schema?: SchemaType,
        initial?: SolanaWeb3ConnectionOptions,
    ): Promise<string> {
        throw new Error('Method not implemented.')
    }
    approveAllNonFungibleTokens(
        address: string,
        recipient: string,
        approved: boolean,
        schema?: SchemaType,
        initial?: SolanaWeb3ConnectionOptions,
    ): Promise<string> {
        throw new Error('Method not implemented.')
    }
    async transferFungibleToken(
        address: string,
        recipient: string,
        amount: string,
        memo?: string,
        initial?: SolanaWeb3ConnectionOptions,
    ): Promise<string> {
        const options = this.getOptions(initial)
        if (isNativeTokenAddress(address)) {
            return this.transferSol(recipient, amount, options)
        }
        return this.transferSplToken(address, recipient, amount, options)
    }
    transferNonFungibleToken(
        address: string,
        recipient: string,
        mintAddress: string,
        amount: string,
        schema?: SchemaType,
        initial?: SolanaWeb3ConnectionOptions,
    ): Promise<string> {
        const options = this.getOptions(initial)
        return this.transferSplToken(mintAddress, recipient, amount, options)
    }
    getGasPrice(initial?: SolanaWeb3ConnectionOptions): Promise<string> {
        throw new Error('Method not implemented.')
    }
    getTokenSchema(address: string, initial?: SolanaWeb3ConnectionOptions): Promise<SchemaType> {
        throw new Error('Method not implemented.')
    }
    getNonFungibleTokenContract(
        address: string,
        schemaType?: SchemaType,
        initial?: SolanaWeb3ConnectionOptions,
    ): Promise<NonFungibleTokenContract<ChainId, SchemaType>> {
        throw new Error('Method not implemented.')
    }
    getNonFungibleTokenCollection(
        address: string,
        schemaType?: SchemaType,
        initial?: SolanaWeb3ConnectionOptions,
    ): Promise<NonFungibleTokenCollection<ChainId, SchemaType>> {
        throw new Error('Method not implemented.')
    }
    async switchChain(chainId: ChainId, initial?: SolanaWeb3ConnectionOptions) {
        const options = this.getOptions(initial)
        await Providers[options.providerType].switchChain(chainId)
    }
    getNativeToken(initial?: SolanaWeb3ConnectionOptions): Promise<FungibleToken<ChainId, SchemaType>> {
        const options = this.getOptions(initial)
        const token = createNativeToken(options.chainId)
        return Promise.resolve(token)
    }
    async getNativeTokenBalance(initial?: SolanaWeb3ConnectionOptions): Promise<string> {
        const options = this.getOptions(initial)
        if (!options.account) return '0'
        const connection = this.getWeb3Connection(options)
        const balance = await connection.getBalance(new PublicKey(options.account))
        return balance.toString()
    }
    async getFungibleTokenBalance(address: string, initial?: SolanaWeb3ConnectionOptions): Promise<string> {
        const options = this.getOptions(initial)
        if (!options.account) return '0'
        if (isNativeTokenAddress(address)) {
            return this.getNativeTokenBalance(options)
        }
        return SolanaRPC.getSplTokenBalance(options.chainId, options.account, address)
    }
    getNonFungibleTokenBalance(
        address: string,
        tokenId?: string,
        schemaType?: SchemaType,
        initial?: SolanaWeb3ConnectionOptions,
    ): Promise<string> {
        throw new Error('Method not implemented.')
    }
    async getFungibleTokensBalance(
        listOfAddress: string[],
        initial?: SolanaWeb3ConnectionOptions,
    ): Promise<Record<string, string>> {
        const options = this.getOptions(initial)
        if (!options.account) return {}
        const splTokens = await SolanaRPC.getSplTokenList(options.chainId, options.account)
        const records = splTokens.reduce(
            (map: Record<string, string>, asset) => ({ ...map, [asset.address]: asset.balance }),
            {},
        )
        if (listOfAddress.includes(SOL_ADDRESS)) {
            records[SOL_ADDRESS] = await this.getNativeTokenBalance(options)
        }
        return records
    }
    getNonFungibleTokensBalance(
        listOfAddress: string[],
        initial?: SolanaWeb3ConnectionOptions,
    ): Promise<Record<string, string>> {
        throw new Error('Method not implemented.')
    }
    getCode(address: string, initial?: SolanaWeb3ConnectionOptions): Promise<string> {
        throw new Error('Method not implemented.')
    }

    getWeb3Connection(initial?: SolanaWeb3ConnectionOptions) {
        const options = this.getOptions(initial)
        const connection =
            this.connections.get(options.chainId) ?? new SolConnection(NETWORK_ENDPOINTS[options.chainId])
        this.connections.set(options.chainId, connection)
        return connection
    }

    getAccount(initial?: SolanaWeb3ConnectionOptions) {
        const options = this.getOptions(initial)
        return Promise.resolve(options.account)
    }

    getAccountInfo(account: string, initial?: SolanaWeb3ConnectionOptions) {
        const options = this.getOptions(initial, {
            account,
        })
        return this.getWeb3Connection(options).getAccountInfo(decodeAddress(account))
    }

    getChainId(initial?: SolanaWeb3ConnectionOptions) {
        const options = this.getOptions(initial)
        return Promise.resolve(options.chainId)
    }

    async getBlock(no: number, initial?: SolanaWeb3ConnectionOptions): Promise<BlockResponse | null> {
        const options = this.getOptions(initial)
        return this.getWeb3Connection(options).getBlock(no)
    }

    async getBlockNumber(initial?: SolanaWeb3ConnectionOptions) {
        const options = this.getOptions(initial)
        return this.getWeb3Connection(options).getSlot()
    }

    async getBlockTimestamp(initial?: SolanaWeb3ConnectionOptions): Promise<number> {
        const options = this.getOptions(initial)
        const slot = await this.getBlockNumber(options)
        const response = await this.getWeb3Connection(options).getBlockTime(slot)
        return response ?? 0
    }

    async getBalance(account: string, initial?: SolanaWeb3ConnectionOptions) {
        const options = this.getOptions(initial)
        const balance = await this.getWeb3Connection(options).getBalance(decodeAddress(account))
        return balance.toFixed()
    }

    getTransaction(id: string, initial?: SolanaWeb3ConnectionOptions) {
        const options = this.getOptions(initial)
        return this.getWeb3Connection(options).getTransaction(id)
    }

    async getTransactionReceipt(id: string, initial?: SolanaWeb3ConnectionOptions) {
        return null
    }

    async getTransactionStatus(id: string, initial?: SolanaWeb3ConnectionOptions) {
        const options = this.getOptions(initial)
        const response = await this.getWeb3Connection(options).getSignatureStatus(id)
        if (response.value?.err) return TransactionStatusType.FAILED
        if (response.value?.confirmations && response.value.confirmations > 0) return TransactionStatusType.SUCCEED
        return TransactionStatusType.NOT_DEPEND
    }

    async signMessage(dataToSign: string, signType?: string, initial?: SolanaWeb3ConnectionOptions) {
        const options = this.getOptions(initial)
        return this._getWeb3Provider(options).signMessage(dataToSign)
    }

    async verifyMessage(
        dataToVerify: string,
        signature: string,
        signType?: string,
        initial?: SolanaWeb3ConnectionOptions,
    ): Promise<boolean> {
        const options = this.getOptions(initial)
        return this._getWeb3Provider(options).verifyMessage(dataToVerify, signature)
    }

    async signTransaction(transaction: Transaction, initial?: SolanaWeb3ConnectionOptions) {
        const options = this.getOptions(initial)
        return this._getWeb3Provider(options).signTransaction(transaction)
    }

    signTransactions(transactions: Transaction[], initial?: SolanaWeb3ConnectionOptions) {
        const options = this.getOptions(initial)
        return Promise.all(transactions.map((x) => this.signTransaction(x, options)))
    }

    callTransaction(transaction: Transaction, initial?: SolanaWeb3ConnectionOptions): Promise<string> {
        throw new Error('Method not implemented.')
    }

    async sendTransaction(transaction: Transaction, initial?: SolanaWeb3ConnectionOptions) {
        const options = this.getOptions(initial)
        const signedTransaction = await this.signTransaction(transaction)
        return sendAndConfirmRawTransaction(this.getWeb3Connection(options), signedTransaction.serialize())
    }

    sendSignedTransaction(signature: Transaction, initial?: SolanaWeb3ConnectionOptions) {
        const options = this.getOptions(initial)
        return sendAndConfirmRawTransaction(this.getWeb3Connection(options), signature.serialize())
    }

    async getTransactionNonce(account: string, initial?: SolanaWeb3ConnectionOptions): Promise<number> {
        const options = this.getOptions(initial, {
            account,
        })
        const response = await this.getWeb3Connection(options).getNonce(decodeAddress(account))
        return response?.nonce ? Number.parseInt(response.nonce, 10) : 0
    }

    async getFungibleToken(
        address: string,
        initial?: SolanaWeb3ConnectionOptions,
    ): Promise<FungibleToken<ChainId, SchemaType>> {
        const options = this.getOptions(initial)
        if (!address || isNativeTokenAddress(address)) {
            return this.getNativeToken()
        }
        const splTokens = await SolanaRPC.getAllSplTokens()
        const token = splTokens.find((x) => x.address === address)
        return (
            token ??
            ({
                address,
                chainId: options.chainId,
            } as FungibleToken<ChainId, SchemaType>)
        )
    }
    async getNonFungibleToken(
        address: string,
        tokenId: string,
        schemaType?: SchemaType,
        initial?: SolanaWeb3ConnectionOptions,
    ): Promise<NonFungibleToken<ChainId, SchemaType>> {
        const options = this.getOptions(initial)
        const asset = await MagicEden.getAsset(address, tokenId, options)
        return createNonFungibleToken(
            options.chainId,
            address,
            SchemaType.NonFungible,
            tokenId,
            asset?.ownerId,
            asset?.metadata,
            asset?.contract,
            asset?.collection,
        )
    }
    getNonFungibleTokenOwnership(
        address: string,
        tokenId: string,
        owner: string,
        schema?: SchemaType | undefined,
        initial?: SolanaWeb3ConnectionOptions,
    ): Promise<boolean> {
        throw new Error('Method not implemented.')
    }
    getNonFungibleTokenMetadata(
        address: string,
        tokenId: string,
        schemaType?: SchemaType,
        initial?: SolanaWeb3ConnectionOptions,
    ): Promise<NonFungibleTokenMetadata<ChainId>> {
        throw new Error('Method not implemented.')
    }
    requestTransaction(
        hash: string,
        config: Transaction,
        options?: ConnectionOptions<ChainId, ProviderType, Transaction> | undefined,
    ): Promise<void> {
        throw new Error('Method not implemented.')
    }
    cancelTransaction(
        hash: string,
        config: Transaction,
        options?: ConnectionOptions<ChainId, ProviderType, Transaction> | undefined,
    ): Promise<void> {
        throw new Error('Method not implemented.')
    }
}

export function createConnection(
    context: Plugin.Shared.SharedContext,
    options?: {
        chainId?: ChainId
        account?: string
        providerType?: ProviderType
    },
) {
    const { chainId = ChainId.Mainnet, account = '', providerType = ProviderType.Phantom } = options ?? {}

    return new Connection(chainId, account, providerType, context)
}
