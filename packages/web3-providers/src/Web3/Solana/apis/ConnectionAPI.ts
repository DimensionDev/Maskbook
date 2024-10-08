import {
    AddressType,
    ChainId,
    SchemaType,
    type Signature,
    type Transaction,
    type TransactionDetailed,
    type TransactionReceipt,
    type Block,
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
import * as SolanaWeb3 from /* webpackDefer: true */ '@solana/web3.js'
import type { BlockResponse } from '@solana/web3.js'
import type { BaseConnection } from '../../Base/apis/Connection.js'
import { SolanaWeb3API } from './Web3API.js'
import { SolanaTransferAPI } from './TransferAPI.js'
import { SolanaConnectionOptionsAPI } from './ConnectionOptionsAPI.js'
import { SolanaChainResolver } from './ResolverAPI.js'
import { SolanaFungible } from './FungibleTokenAPI.js'
import type { SolanaConnectionOptions } from '../types/index.js'
import { solana } from '../../../Manager/registry.js'

export class SolanaConnectionAPI
    implements
        BaseConnection<
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
            Web3
        >
{
    constructor(options?: SolanaConnectionOptions) {
        this.Web3 = new SolanaWeb3API(options)
        this.Transfer = new SolanaTransferAPI(options)
        this.ConnectionOptions = new SolanaConnectionOptionsAPI(options)
    }

    private Web3
    private Transfer
    private ConnectionOptions

    getAccount(initial?: SolanaConnectionOptions | undefined): Promise<string> {
        const options = this.ConnectionOptions.fill(initial)
        return Promise.resolve(options.account)
    }

    getChainId(initial?: SolanaConnectionOptions | undefined): Promise<ChainId> {
        const options = this.ConnectionOptions.fill(initial)
        return Promise.resolve(options.chainId)
    }

    createAccount(initial?: SolanaConnectionOptions): Account<ChainId> {
        throw new Error('Method not implemented.')
    }

    async switchChain(chainId: ChainId, initial?: SolanaConnectionOptions) {
        await this.Web3.getProviderInstance(initial).switchChain(chainId)
    }

    approveFungibleToken(
        address: string,
        recipient: string,
        amount: string,
        initial?: SolanaConnectionOptions | undefined,
    ): Promise<string> {
        throw new Error('Method not implemented.')
    }

    approveAllNonFungibleTokens(
        address: string,
        recipient: string,
        approved: boolean,
        schema?: SchemaType | undefined,
        initial?: SolanaConnectionOptions | undefined,
    ): Promise<string> {
        throw new Error('Method not implemented.')
    }

    async transferFungibleToken(
        address: string,
        recipient: string,
        amount: string,
        memo?: string,
        initial?: SolanaConnectionOptions,
    ): Promise<string> {
        return isNativeTokenAddress(address) ?
                this.Transfer.transferSol(recipient, amount, initial)
            :   this.Transfer.transferSplToken(address, recipient, amount, initial)
    }

    transferNonFungibleToken(
        address: string,
        tokenId: string,
        recipient: string,
        amount: string,
        schema?: SchemaType,
        initial?: SolanaConnectionOptions,
    ): Promise<string> {
        return this.Transfer.transferSplToken(address, recipient, amount, initial)
    }

    async connect(initial?: SolanaConnectionOptions): Promise<Account<ChainId>> {
        const options = this.ConnectionOptions.fill(initial)
        return {
            account: '',
            chainId: ChainId.Mainnet,
            ...(await solana.state?.Provider?.connect(options.providerType, options.chainId)),
        }
    }

    async disconnect(initial?: SolanaConnectionOptions): Promise<void> {
        const options = this.ConnectionOptions.fill(initial)
        await solana.state?.Provider?.disconnect(options.providerType)
    }

    getWeb3(initial?: SolanaConnectionOptions): never {
        throw new Error('Method not implemented.')
    }

    async getBalance(account: string, initial?: SolanaConnectionOptions) {
        const balance = await this.Web3.getConnection(initial).getBalance(decodeAddress(account))
        return balance.toFixed()
    }

    async getNativeTokenBalance(initial?: SolanaConnectionOptions): Promise<string> {
        const options = this.ConnectionOptions.fill(initial)
        if (!options.account) return '0'
        const balance = await this.Web3.getConnection(options).getBalance(new SolanaWeb3.PublicKey(options.account))
        return balance.toString()
    }

    async getFungibleTokenBalance(
        address: string,
        schema?: SchemaType,
        initial?: SolanaConnectionOptions,
    ): Promise<string> {
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
        initial?: SolanaConnectionOptions,
    ): Promise<string> {
        throw new Error('Method not implemented.')
    }

    async getFungibleTokensBalance(
        listOfAddress: string[],
        initial?: SolanaConnectionOptions,
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

    getNonFungibleTokensBalance(
        listOfAddress: string[],
        initial?: SolanaConnectionOptions,
    ): Promise<Record<string, string>> {
        throw new Error('Method not implemented.')
    }

    getGasPrice(initial?: SolanaConnectionOptions): Promise<string> {
        throw new Error('Method not implemented.')
    }

    getCode(address: string, initial?: SolanaConnectionOptions): Promise<string> {
        throw new Error('Method not implemented.')
    }

    getAddressType(address: string, initial?: SolanaConnectionOptions): Promise<AddressType | undefined> {
        return Promise.resolve(AddressType.Default)
    }

    getSchemaType(address: string, initial?: SolanaConnectionOptions): Promise<SchemaType> {
        throw new Error('Method not implemented.')
    }

    async getBlock(no: number, initial?: SolanaConnectionOptions): Promise<BlockResponse | null> {
        return this.Web3.getConnection(initial).getBlock(no as number)
    }

    async getBlockNumber(initial?: SolanaConnectionOptions) {
        return this.Web3.getConnection(initial).getSlot()
    }

    async getBlockTimestamp(initial?: SolanaConnectionOptions): Promise<number> {
        const slot = await this.getBlockNumber(initial)
        const response = await this.Web3.getConnection(initial).getBlockTime(slot)
        return response ?? 0
    }

    getTransaction(id: string, initial?: SolanaConnectionOptions): Promise<TransactionDetailed | null> {
        return this.Web3.getConnection(initial).getTransaction(id)
    }

    async getTransactionReceipt(id: string, initial?: SolanaConnectionOptions): Promise<TransactionReceipt | null> {
        return null
    }

    async getTransactionStatus(id: string, initial?: SolanaConnectionOptions): Promise<TransactionStatusType> {
        const response = await this.Web3.getConnection(initial).getSignatureStatus(id)
        if (response.value?.err) return TransactionStatusType.FAILED
        if (response.value?.confirmations && response.value.confirmations > 0) return TransactionStatusType.SUCCEED
        return TransactionStatusType.NOT_DEPEND
    }

    async getTransactionNonce(account: string, initial?: SolanaConnectionOptions): Promise<number> {
        const response = await this.Web3.getConnection(initial).getNonce(decodeAddress(account))
        return response?.nonce ? Number.parseInt(response.nonce, 10) : 0
    }

    async getNativeToken(initial?: SolanaConnectionOptions): Promise<FungibleToken<ChainId, SchemaType>> {
        const options = this.ConnectionOptions.fill(initial)
        return SolanaChainResolver.nativeCurrency(options.chainId)
    }

    async getFungibleToken(
        address: string,
        initial?: SolanaConnectionOptions,
    ): Promise<FungibleToken<ChainId, SchemaType>> {
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
        initial?: SolanaConnectionOptions,
    ): Promise<NonFungibleToken<ChainId, SchemaType>> {
        throw new Error('Method not implemented.')
    }

    getNonFungibleTokenOwner(
        address: string,
        tokenId: string,
        schema?: SchemaType,
        initial?: SolanaConnectionOptions,
    ): Promise<string> {
        throw new Error('Method not implemented.')
    }

    getNonFungibleTokenOwnership(
        address: string,
        tokenId: string,
        owner: string,
        schema?: SchemaType | undefined,
        initial?: SolanaConnectionOptions,
    ): Promise<boolean> {
        throw new Error('Method not implemented.')
    }

    getNonFungibleTokenMetadata(
        address: string,
        tokenId: string,
        schema?: SchemaType,
        initial?: SolanaConnectionOptions,
    ): Promise<NonFungibleTokenMetadata<ChainId>> {
        throw new Error('Method not implemented.')
    }

    getNonFungibleTokenContract(
        address: string,
        schema?: SchemaType,
        initial?: SolanaConnectionOptions,
    ): Promise<NonFungibleTokenContract<ChainId, SchemaType>> {
        throw new Error('Method not implemented.')
    }

    getNonFungibleTokenCollection(
        address: string,
        schema?: SchemaType,
        initial?: SolanaConnectionOptions,
    ): Promise<NonFungibleCollection<ChainId, SchemaType>> {
        throw new Error('Method not implemented.')
    }

    callTransaction(transaction: Transaction, initial?: SolanaConnectionOptions): Promise<string> {
        throw new Error('Method not implemented.')
    }

    confirmTransaction(id: string, initial?: SolanaConnectionOptions): Promise<TransactionReceipt> {
        throw new Error('Method not implemented.')
    }

    estimateTransaction(
        transaction: Transaction,
        fallback?: number,
        initial?: SolanaConnectionOptions,
    ): Promise<string> {
        throw new Error('Method not implemented.')
    }

    async sendTransaction(transaction: Transaction, initial?: SolanaConnectionOptions) {
        const signedTransaction = await this.signTransaction(transaction)
        return SolanaWeb3.sendAndConfirmRawTransaction(this.Web3.getConnection(initial), signedTransaction.serialize())
    }

    sendSignedTransaction(signature: TransactionSignature, initial?: SolanaConnectionOptions): Promise<string> {
        return SolanaWeb3.sendAndConfirmRawTransaction(this.Web3.getConnection(initial), signature.serialize())
    }

    replaceTransaction(hash: string, config: Transaction, options?: SolanaConnectionOptions): Promise<void> {
        throw new Error('Method not implemented.')
    }

    cancelTransaction(hash: string, config: Transaction, options?: SolanaConnectionOptions): Promise<void> {
        throw new Error('Method not implemented.')
    }

    async signMessage(type: string, message: string, initial?: SolanaConnectionOptions) {
        return this.Web3.getProviderInstance(initial).signMessage(message)
    }

    async signTransaction(transaction: Transaction, initial?: SolanaConnectionOptions) {
        return this.Web3.getProviderInstance(initial).signTransaction(transaction)
    }

    signTransactions(transactions: Transaction[], initial?: SolanaConnectionOptions) {
        return Promise.all(transactions.map((x) => this.signTransaction(x, initial)))
    }
}
