import {
    AddressType,
    ChainId,
    SchemaType,
    type Signature,
    type Transaction,
    type TransactionDetailed,
    type TransactionReceipt,
    type Block,
    type Web3Provider,
    type Web3,
    isNativeTokenAddress,
    getNativeTokenAddress,
    decodeAddress,
    type TransactionSignature,
    type ProviderType,
    type Operation,
} from '@masknet/web3-shared-solana'
import {
    TransactionStatusType,
    type FungibleToken,
    type NonFungibleToken,
    type NonFungibleTokenMetadata,
    type NonFungibleTokenContract,
    type NonFungibleCollection,
    isSameAddress,
    createNonFungibleToken,
} from '@masknet/web3-shared-base'
import { EMPTY_OBJECT, type Account } from '@masknet/shared-base'
import { PublicKey, sendAndConfirmRawTransaction, type BlockResponse } from '@solana/web3.js'
import type { ConnectionAPI_Base } from '../../Base/apis/ConnectionAPI.js'
import { MagicEden } from '../../../MagicEden/index.js'
import { SolanaWeb3API } from './Web3API.js'
import { SolanaTransferAPI } from './TransferAPI.js'
import { SolanaConnectionOptionsAPI } from './ConnectionOptionsAPI.js'
import { SolanaChainResolver } from './ResolverAPI.js'
import { SolanaWeb3StateRef } from './Web3StateAPI.js'
import { SolanaFungible } from './FungibleTokenAPI.js'
import type { ConnectionOptions } from '../types/index.js'

export class SolanaConnectionAPI
    implements
        ConnectionAPI_Base<
            ChainId,
            AddressType,
            SchemaType,
            ProviderType,
            Signature,
            Operation,
            Transaction,
            TransactionReceipt,
            TransactionDetailed,
            TransactionSignature,
            Block,
            Web3,
            Web3Provider
        >
{
    constructor(options?: ConnectionOptions) {
        this.Web3 = new SolanaWeb3API(options)
        this.Transfer = new SolanaTransferAPI(options)
        this.ConnectionOptions = new SolanaConnectionOptionsAPI(options)
    }
    private Web3
    private Transfer
    private ConnectionOptions
    getAccount(initial?: ConnectionOptions | undefined): Promise<string> {
        const options = this.ConnectionOptions.fill(initial)
        return Promise.resolve(options.account)
    }

    getChainId(initial?: ConnectionOptions | undefined): Promise<ChainId> {
        const options = this.ConnectionOptions.fill(initial)
        return Promise.resolve(options.chainId)
    }

    createAccount(initial?: ConnectionOptions): Account<ChainId> {
        throw new Error('Method not implemented.')
    }

    async switchChain(chainId: ChainId, initial?: ConnectionOptions) {
        await this.Web3.getProviderInstance(initial).switchChain(chainId)
    }

    approveFungibleToken(
        address: string,
        recipient: string,
        amount: string,
        initial?: ConnectionOptions | undefined,
    ): Promise<string> {
        throw new Error('Method not implemented.')
    }

    approveNonFungibleToken(
        address: string,
        recipient: string,
        tokenId: string,
        schema?: SchemaType | undefined,
        initial?: ConnectionOptions | undefined,
    ): Promise<string> {
        throw new Error('Method not implemented.')
    }

    approveAllNonFungibleTokens(
        address: string,
        recipient: string,
        approved: boolean,
        schema?: SchemaType | undefined,
        initial?: ConnectionOptions | undefined,
    ): Promise<string> {
        throw new Error('Method not implemented.')
    }

    async transferFungibleToken(
        address: string,
        recipient: string,
        amount: string,
        memo?: string,
        initial?: ConnectionOptions,
    ): Promise<string> {
        return isNativeTokenAddress(address)
            ? this.Transfer.transferSol(recipient, amount, initial)
            : this.Transfer.transferSplToken(address, recipient, amount, initial)
    }

    transferNonFungibleToken(
        address: string,
        tokenId: string,
        recipient: string,
        amount: string,
        schema?: SchemaType,
        initial?: ConnectionOptions,
    ): Promise<string> {
        return this.Transfer.transferSplToken(address, recipient, amount, initial)
    }

    async connect(initial?: ConnectionOptions): Promise<Account<ChainId>> {
        const options = this.ConnectionOptions.fill(initial)
        return {
            account: '',
            chainId: ChainId.Mainnet,
            ...(await SolanaWeb3StateRef.value?.Provider?.connect(options.providerType, options.chainId)),
        }
    }

    async disconnect(initial?: ConnectionOptions): Promise<void> {
        const options = this.ConnectionOptions.fill(initial)
        await SolanaWeb3StateRef.value?.Provider?.disconnect(options.providerType)
    }

    getWeb3(initial?: ConnectionOptions) {
        return this.Web3.getWeb3(initial)
    }

    getWeb3Provider(initial?: ConnectionOptions) {
        return this.Web3.getWeb3Provider(initial)
    }

    async getBalance(account: string, initial?: ConnectionOptions) {
        const balance = await this.Web3.getWeb3Connection(initial).getBalance(decodeAddress(account))
        return balance.toFixed()
    }

    async getNativeTokenBalance(initial?: ConnectionOptions): Promise<string> {
        const options = this.ConnectionOptions.fill(initial)
        if (!options.account) return '0'
        const balance = await this.Web3.getWeb3Connection(options).getBalance(new PublicKey(options.account))
        return balance.toString()
    }

    async getFungibleTokenBalance(address: string, schema?: SchemaType, initial?: ConnectionOptions): Promise<string> {
        const options = this.ConnectionOptions.fill(initial)
        if (!options.account) return '0'
        if (isNativeTokenAddress(address)) return this.getNativeTokenBalance(options)
        const { data: assets } = await SolanaFungible.getAssets(options.account, options)
        const asset = assets.find((x) => isSameAddress(x.address, address))
        return asset?.balance ?? '0'
    }

    getNonFungibleTokenBalance(
        address: string,
        tokenId?: string,
        schema?: SchemaType,
        initial?: ConnectionOptions,
    ): Promise<string> {
        throw new Error('Method not implemented.')
    }

    async getFungibleTokensBalance(
        listOfAddress: string[],
        initial?: ConnectionOptions,
    ): Promise<Record<string, string>> {
        const options = this.ConnectionOptions.fill(initial)
        if (!options.account) return EMPTY_OBJECT
        const { data: assets } = await SolanaFungible.getAssets(options.account, {
            chainId: options.chainId,
        })
        const records = assets.reduce<Record<string, string>>(
            (map, asset) => ({ ...map, [asset.address]: asset.balance }),
            {},
        )
        const nativeTokenAddress = getNativeTokenAddress(options.chainId)
        if (listOfAddress.includes(nativeTokenAddress)) {
            records[nativeTokenAddress] = await this.getNativeTokenBalance(options)
        }
        // In the token picker UI, if balance of a token is undefined, then it
        // will keep loading. We set it 0 to walk around that, since fetching is done.
        listOfAddress.forEach((address) => {
            records[address] = records[address] ?? '0'
        })
        return records
    }

    getNonFungibleTokensBalance(listOfAddress: string[], initial?: ConnectionOptions): Promise<Record<string, string>> {
        throw new Error('Method not implemented.')
    }

    getGasPrice(initial?: ConnectionOptions): Promise<string> {
        throw new Error('Method not implemented.')
    }

    getCode(address: string, initial?: ConnectionOptions): Promise<string> {
        throw new Error('Method not implemented.')
    }

    getAddressType(address: string, initial?: ConnectionOptions): Promise<AddressType | undefined> {
        return Promise.resolve(AddressType.Default)
    }

    getSchemaType(address: string, initial?: ConnectionOptions): Promise<SchemaType> {
        throw new Error('Method not implemented.')
    }

    async getBlock(no: number, initial?: ConnectionOptions): Promise<BlockResponse | null> {
        return this.Web3.getWeb3Connection(initial).getBlock(no as number)
    }

    async getBlockNumber(initial?: ConnectionOptions) {
        return this.Web3.getWeb3Connection(initial).getSlot()
    }

    async getBlockTimestamp(initial?: ConnectionOptions): Promise<number> {
        const slot = await this.getBlockNumber(initial)
        const response = await this.Web3.getWeb3Connection(initial).getBlockTime(slot)
        return response ?? 0
    }

    getTransaction(id: string, initial?: ConnectionOptions): Promise<TransactionDetailed | null> {
        return this.Web3.getWeb3Connection(initial).getTransaction(id)
    }

    async getTransactionReceipt(id: string, initial?: ConnectionOptions): Promise<TransactionReceipt | null> {
        return null
    }

    async getTransactionStatus(id: string, initial?: ConnectionOptions): Promise<TransactionStatusType> {
        const response = await this.Web3.getWeb3Connection(initial).getSignatureStatus(id)
        if (response.value?.err) return TransactionStatusType.FAILED
        if (response.value?.confirmations && response.value.confirmations > 0) return TransactionStatusType.SUCCEED
        return TransactionStatusType.NOT_DEPEND
    }

    async getTransactionNonce(account: string, initial?: ConnectionOptions): Promise<number> {
        const response = await this.Web3.getWeb3Connection(initial).getNonce(decodeAddress(account))
        return response?.nonce ? Number.parseInt(response.nonce, 10) : 0
    }

    async getNativeToken(initial?: ConnectionOptions): Promise<FungibleToken<ChainId, SchemaType>> {
        const options = this.ConnectionOptions.fill(initial)
        return SolanaChainResolver.nativeCurrency(options.chainId)
    }

    async getFungibleToken(address: string, initial?: ConnectionOptions): Promise<FungibleToken<ChainId, SchemaType>> {
        const options = this.ConnectionOptions.fill(initial)
        if (!address || isNativeTokenAddress(address)) return this.getNativeToken(options)
        const tokens = await SolanaFungible.getFungibleTokenList(options.chainId, [])
        const token = tokens.find((x) => isSameAddress(x.address, address))
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
        schema?: SchemaType,
        initial?: ConnectionOptions,
    ): Promise<NonFungibleToken<ChainId, SchemaType>> {
        const options = this.ConnectionOptions.fill(initial)
        const asset = await MagicEden.getAsset(address, tokenId, {
            chainId: options.chainId,
        })
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

    getNonFungibleTokenOwner(
        address: string,
        tokenId: string,
        schema?: SchemaType,
        initial?: ConnectionOptions,
    ): Promise<string> {
        throw new Error('Method not implemented.')
    }

    getNonFungibleTokenOwnership(
        address: string,
        tokenId: string,
        owner: string,
        schema?: SchemaType | undefined,
        initial?: ConnectionOptions,
    ): Promise<boolean> {
        throw new Error('Method not implemented.')
    }

    getNonFungibleTokenMetadata(
        address: string,
        tokenId: string,
        schema?: SchemaType,
        initial?: ConnectionOptions,
    ): Promise<NonFungibleTokenMetadata<ChainId>> {
        throw new Error('Method not implemented.')
    }

    getNonFungibleTokenContract(
        address: string,
        schema?: SchemaType,
        initial?: ConnectionOptions,
    ): Promise<NonFungibleTokenContract<ChainId, SchemaType>> {
        throw new Error('Method not implemented.')
    }

    getNonFungibleTokenCollection(
        address: string,
        schema?: SchemaType,
        initial?: ConnectionOptions,
    ): Promise<NonFungibleCollection<ChainId, SchemaType>> {
        throw new Error('Method not implemented.')
    }

    callTransaction(transaction: Transaction, initial?: ConnectionOptions): Promise<string> {
        throw new Error('Method not implemented.')
    }

    confirmTransaction(id: string, initial?: ConnectionOptions): Promise<TransactionReceipt> {
        throw new Error('Method not implemented.')
    }

    estimateTransaction(transaction: Transaction, fallback?: number, initial?: ConnectionOptions): Promise<string> {
        throw new Error('Method not implemented.')
    }

    async sendTransaction(transaction: Transaction, initial?: ConnectionOptions) {
        const signedTransaction = await this.signTransaction(transaction)
        return sendAndConfirmRawTransaction(this.Web3.getWeb3Connection(initial), signedTransaction.serialize())
    }

    sendSignedTransaction(signature: TransactionSignature, initial?: ConnectionOptions): Promise<string> {
        return sendAndConfirmRawTransaction(this.Web3.getWeb3Connection(initial), signature.serialize())
    }

    replaceTransaction(hash: string, config: Transaction, options?: ConnectionOptions): Promise<void> {
        throw new Error('Method not implemented.')
    }
    cancelTransaction(hash: string, config: Transaction, options?: ConnectionOptions): Promise<void> {
        throw new Error('Method not implemented.')
    }

    async signMessage(type: string, message: string, initial?: ConnectionOptions) {
        return this.Web3.getProviderInstance(initial).signMessage(message)
    }

    async verifyMessage(
        type: string,
        message: string,
        signature: string,
        initial?: ConnectionOptions,
    ): Promise<boolean> {
        return this.Web3.getProviderInstance(initial).verifyMessage(message, signature)
    }

    async signTransaction(transaction: Transaction, initial?: ConnectionOptions) {
        return this.Web3.getProviderInstance(initial).signTransaction(transaction)
    }

    signTransactions(transactions: Transaction[], initial?: ConnectionOptions) {
        return Promise.all(transactions.map((x) => this.signTransaction(x, initial)))
    }
}
