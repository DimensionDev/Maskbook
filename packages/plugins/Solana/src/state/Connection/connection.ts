import {
    Account,
    ConnectionOptions,
    FungibleToken,
    NonFungibleToken,
    NonFungibleTokenCollection,
    NonFungibleTokenContract,
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
import { isNativeTokenAddress } from '../../utils'
import { Providers } from './provider'
import { createTransferInstruction, getOrCreateAssociatedTokenAccount } from './spl-token'
import type { SolanaConnection as BaseConnection, SolanaWeb3ConnectionOptions } from './types'

class Connection implements BaseConnection {
    private connections: Map<ChainId, SolConnection> = new Map()

    constructor(private chainId: ChainId, private account: string, private providerType: ProviderType) {}

    private _getWeb3Provider(options?: SolanaWeb3ConnectionOptions) {
        return Providers[options?.providerType ?? this.providerType]
    }

    private async _attachRecentBlockHash(transaction: Transaction, options?: SolanaWeb3ConnectionOptions) {
        const chainId = options?.chainId ?? ChainId.Mainnet
        const connection = this.connections.get(chainId) ?? new SolConnection(NETWORK_ENDPOINTS[chainId])
        const blockHash = await connection.getRecentBlockhash()
        transaction.recentBlockhash = blockHash.blockhash
        return transaction
    }

    async getWeb3(options?: SolanaWeb3ConnectionOptions) {
        return this._getWeb3Provider(options).createWeb3({
            account: options?.account ?? this.account,
            chainId: options?.chainId ?? this.chainId,
        })
    }

    getWeb3Provider(options?: SolanaWeb3ConnectionOptions) {
        return this._getWeb3Provider(options).createWeb3Provider({
            account: options?.account ?? this.account,
            chainId: options?.chainId ?? this.chainId,
        })
    }

    async connect(options?: SolanaWeb3ConnectionOptions): Promise<Account<ChainId>> {
        return {
            account: '',
            chainId: ChainId.Mainnet,
            ...(await Web3StateSettings.value.Provider?.connect(
                options?.chainId ?? this.chainId,
                options?.providerType ?? this.providerType,
            )),
        }
    }
    async disconnect(options?: SolanaWeb3ConnectionOptions): Promise<void> {
        await Web3StateSettings.value.Provider?.disconnect(options?.providerType ?? this.providerType)
    }
    private async transferSol(recipient: string, amount: string, options?: SolanaWeb3ConnectionOptions) {
        if (!options?.account) throw new Error('No payer provides.')
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
        this._attachRecentBlockHash(transaction)

        return this.sendTransaction(transaction)
    }
    private async transferSplToken(
        address: string,
        recipient: string,
        amount: string,
        options?: SolanaWeb3ConnectionOptions,
    ): Promise<string> {
        if (!options?.account) throw new Error('No payer provides.')
        const chainId = options.chainId ?? ChainId.Mainnet
        const connection = this.connections.get(chainId) ?? new SolConnection(NETWORK_ENDPOINTS[chainId])

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
    async transferFungibleToken(
        address: string,
        recipient: string,
        amount: string,
        memo?: string,
        options?: SolanaWeb3ConnectionOptions,
    ): Promise<string> {
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
        options?: SolanaWeb3ConnectionOptions,
    ): Promise<string> {
        return this.transferSplToken(mintAddress, recipient, amount, options)
    }
    getGasPrice(options?: SolanaWeb3ConnectionOptions): Promise<string> {
        throw new Error('Method not implemented.')
    }
    getSchemaType(address: string, options?: SolanaWeb3ConnectionOptions): Promise<SchemaType> {
        throw new Error('Method not implemented.')
    }
    getNonFungibleTokenContract(
        address: string,
        options?: SolanaWeb3ConnectionOptions,
    ): Promise<NonFungibleTokenContract<ChainId, SchemaType>> {
        throw new Error('Method not implemented.')
    }
    getNonFungibleTokenCollection(
        address: string,
        options?: SolanaWeb3ConnectionOptions,
    ): Promise<NonFungibleTokenCollection<ChainId>> {
        throw new Error('Method not implemented.')
    }
    async switchChain(options?: SolanaWeb3ConnectionOptions) {
        await Providers[options?.providerType ?? this.providerType].switchChain(options?.chainId)
    }
    getNativeToken(options?: SolanaWeb3ConnectionOptions): Promise<FungibleToken<ChainId, SchemaType>> {
        const token = createNativeToken(options?.chainId ?? ChainId.Mainnet)
        return Promise.resolve(token)
    }
    async getNativeTokenBalance(options?: SolanaWeb3ConnectionOptions): Promise<string> {
        if (!options?.account) return '0'
        const sol = await SolanaRPC.getSolAsset(options?.chainId ?? ChainId.Mainnet, options.account)
        return sol.balance
    }
    async getFungibleTokenBalance(address: string, options?: SolanaWeb3ConnectionOptions): Promise<string> {
        if (!options?.account) return '0'
        if (isNativeTokenAddress(address)) {
            return this.getNativeTokenBalance(options)
        }
        return SolanaRPC.getSplTokenBalance(options?.chainId ?? ChainId.Mainnet, options.account, address)
    }
    getNonFungibleTokenBalance(address: string, options?: SolanaWeb3ConnectionOptions): Promise<string> {
        throw new Error('Method not implemented.')
    }
    async getFungibleTokensBalance(
        listOfAddress: string[],
        options?: SolanaWeb3ConnectionOptions,
    ): Promise<Record<string, string>> {
        if (!options?.chainId || !options.account) return {}
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
        options?: SolanaWeb3ConnectionOptions,
    ): Promise<Record<string, string>> {
        throw new Error('Method not implemented.')
    }
    getCode(address: string, options?: SolanaWeb3ConnectionOptions): Promise<string> {
        throw new Error('Method not implemented.')
    }

    getWeb3Connection(options?: SolanaWeb3ConnectionOptions) {
        const chainId = options?.chainId ?? this.chainId
        const connection = this.connections.get(chainId) ?? new SolConnection(NETWORK_ENDPOINTS[chainId])
        this.connections.set(chainId, connection)
        return connection
    }

    getAccount(options?: SolanaWeb3ConnectionOptions) {
        return Promise.resolve(options?.account ?? this.account)
    }

    getAccountInfo(account: string, options?: SolanaWeb3ConnectionOptions) {
        return this.getWeb3Connection(options).getAccountInfo(decodeAddress(account))
    }

    getChainId(options?: SolanaWeb3ConnectionOptions) {
        return Promise.resolve(options?.chainId ?? this.chainId)
    }

    async getBlock(no: number, options?: SolanaWeb3ConnectionOptions): Promise<BlockResponse | null> {
        return this.getWeb3Connection(options).getBlock(no)
    }

    async getBlockNumber(options?: SolanaWeb3ConnectionOptions) {
        return this.getWeb3Connection(options).getSlot()
    }

    async getBlockTimestamp(options?: SolanaWeb3ConnectionOptions): Promise<number> {
        const slot = await this.getBlockNumber(options)
        const response = await this.getWeb3Connection(options).getBlockTime(slot)
        return response ?? 0
    }

    async getBalance(account: string, options?: SolanaWeb3ConnectionOptions) {
        const balance = await this.getWeb3Connection(options).getBalance(decodeAddress(account))
        return balance.toFixed()
    }

    getTransaction(id: string, options?: SolanaWeb3ConnectionOptions) {
        return this.getWeb3Connection(options).getTransaction(id)
    }

    async getTransactionReceipt(id: string, options?: SolanaWeb3ConnectionOptions) {
        return null
    }

    async getTransactionStatus(id: string, options?: SolanaWeb3ConnectionOptions) {
        const response = await this.getWeb3Connection(options).getSignatureStatus(id)
        if (response.value?.err) return TransactionStatusType.FAILED
        if (response.value?.confirmations && response.value.confirmations > 0) return TransactionStatusType.SUCCEED
        return TransactionStatusType.NOT_DEPEND
    }

    async signMessage(dataToSign: string, signType?: string, options?: SolanaWeb3ConnectionOptions) {
        return this._getWeb3Provider(options).signMessage(dataToSign)
    }

    async verifyMessage(
        dataToVerify: string,
        signature: string,
        signType?: string,
        options?: SolanaWeb3ConnectionOptions,
    ): Promise<boolean> {
        return this._getWeb3Provider(options).verifyMessage(dataToVerify, signature)
    }

    async signTransaction(transaction: Transaction, options?: SolanaWeb3ConnectionOptions) {
        return this._getWeb3Provider(options).signTransaction(transaction)
    }

    signTransactions(transactions: Transaction[], options?: SolanaWeb3ConnectionOptions) {
        return Promise.all(transactions.map((x) => this.signTransaction(x)))
    }

    callTransaction(transaction: Transaction, options?: SolanaWeb3ConnectionOptions): Promise<string> {
        throw new Error('Method not implemented.')
    }

    async sendTransaction(transaction: Transaction, options?: SolanaWeb3ConnectionOptions) {
        const signedTransaction = await this.signTransaction(transaction)
        return sendAndConfirmRawTransaction(this.getWeb3Connection(options), signedTransaction.serialize())
    }

    sendSignedTransaction(signature: Transaction, options?: SolanaWeb3ConnectionOptions) {
        return sendAndConfirmRawTransaction(this.getWeb3Connection(options), signature.serialize())
    }

    async getTransactionNonce(account: string, options?: SolanaWeb3ConnectionOptions): Promise<number> {
        const response = await this.getWeb3Connection(options).getNonce(decodeAddress(account))
        return response?.nonce ? Number.parseInt(response.nonce, 10) : 0
    }

    async getFungibleToken(
        address: string,
        options?: SolanaWeb3ConnectionOptions,
    ): Promise<FungibleToken<ChainId, SchemaType>> {
        if (!address || isNativeTokenAddress(address)) {
            return this.getNativeToken()
        }
        const splTokens = await SolanaRPC.getAllSplTokens()
        const token = splTokens.find((x) => x.address === address)
        return (
            token ??
            ({
                address,
                chainId: options?.chainId,
            } as FungibleToken<ChainId, SchemaType>)
        )
    }
    getNonFungibleToken(
        address: string,
        id: string,
        options?: SolanaWeb3ConnectionOptions,
    ): Promise<NonFungibleToken<ChainId, SchemaType>> {
        throw new Error('Method not implemented.')
    }
    replaceRequest(
        hash: string,
        config: Transaction,
        options?: ConnectionOptions<ChainId, ProviderType, Transaction> | undefined,
    ): Promise<void> {
        throw new Error('Method not implemented.')
    }
    cancelRequest(
        hash: string,
        config: Transaction,
        options?: ConnectionOptions<ChainId, ProviderType, Transaction> | undefined,
    ): Promise<void> {
        throw new Error('Method not implemented.')
    }
}

export function createConnection(chainId = ChainId.Mainnet, account = '', providerType = ProviderType.Phantom) {
    return new Connection(chainId, account, providerType)
}
