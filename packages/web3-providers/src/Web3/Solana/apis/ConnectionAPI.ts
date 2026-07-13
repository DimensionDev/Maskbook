import {
    AddressType,
    ChainId,
    type SchemaType,
    type Signature,
    type TransactionDetailed,
    type TransactionReceipt,
    isNativeTokenAddress,
    getNativeTokenAddress,
    decodeAddress,
    type TransactionSignature,
    type ProviderType,
    type Transaction,
    serializeTransaction,
    isValidChainId,
} from '@masknet/web3-shared-solana'
import { TransactionStatusType, type FungibleToken, isSameAddress } from '@masknet/web3-shared-base'
import { EMPTY_OBJECT, NetworkPluginID, type Account } from '@masknet/shared-base'
import defer * as SolanaWeb3 from '@solana/web3.js'
import type { BaseConnection } from '../../Base/apis/Connection.js'
import { SolanaWeb3API } from './Web3API.js'
import { SolanaTransferAPI } from './TransferAPI.js'
import { SolanaConnectionOptionsAPI } from './ConnectionOptionsAPI.js'
import { SolanaChainResolver } from './ResolverAPI.js'
import { SolanaFungible } from './FungibleTokenAPI.js'
import type { SolanaConnectionOptions } from '../types/index.js'
import { solana } from '../../../Manager/registry.js'
import { createConnectionCreator } from '../../Base/apis/ConnectionCreator.js'

export class SolanaConnectionAPI
    implements
        BaseConnection<
            ChainId,
            AddressType,
            SchemaType,
            ProviderType,
            Signature,
            Transaction,
            TransactionReceipt,
            TransactionDetailed,
            TransactionSignature
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

    getAccount(initial?: SolanaConnectionOptions  ): Promise<string> {
        const options = this.ConnectionOptions.fill(initial)
        return Promise.resolve(options.account)
    }

    getChainId(initial?: SolanaConnectionOptions  ): Promise<ChainId> {
        const options = this.ConnectionOptions.fill(initial)
        return Promise.resolve(options.chainId)
    }

    createAccount(): Account<ChainId> {
        const { publicKey, secretKey } = SolanaWeb3.Keypair.generate()

        return {
            account: publicKey.toBase58(),
            privateKey: Buffer.from(secretKey).toString('hex'),
            chainId: ChainId.Mainnet,
        }
    }

    async switchChain(chainId: ChainId, initial?: SolanaConnectionOptions) {
        await this.Web3.getProviderInstance(initial).switchChain(chainId)
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

    async getFungibleTokensBalance(
        listOfAddress: string[],
        initial?: SolanaConnectionOptions,
    ): Promise<Record<string, string>> {
        const options = this.ConnectionOptions.fill(initial)
        if (!options.account) return EMPTY_OBJECT
        const { data: assets } = await SolanaFungible.getAssets(options.account, {
            chainId: options.chainId,
        })
        const records = Object.fromEntries(assets.map((asset) => [asset.address, asset.balance]))
        const nativeTokenAddress = getNativeTokenAddress(options.chainId)
        if (listOfAddress.includes(nativeTokenAddress)) {
            records[nativeTokenAddress] = await this.getNativeTokenBalance(options)
        }
        // In the token picker UI, if balance of a token is undefined, then it
        // will keep loading. We set it 0 to walk around that, since fetching is done.
        listOfAddress.forEach((address) => {
            records[address] ??= '0'
        })
        return records
    }

    getGasPrice(): Promise<string> {
        throw new Error('Method not implemented.')
    }

    getAddressType(): Promise<AddressType | undefined> {
        return Promise.resolve(AddressType.Default)
    }

    async getBlockNumber(initial?: SolanaConnectionOptions) {
        return this.Web3.getConnection(initial).getSlot()
    }

    getTransaction(id: string, initial?: SolanaConnectionOptions): Promise<TransactionDetailed | null> {
        return this.Web3.getConnection(initial).getTransaction(id)
    }

    async getTransactionReceipt(): Promise<null> {
        return null
    }

    async getTransactionStatus(id: string, initial?: SolanaConnectionOptions): Promise<TransactionStatusType> {
        const response = await this.Web3.getConnection(initial).getSignatureStatus(id)
        if (response.value?.err) return TransactionStatusType.FAILED
        if (response.value?.confirmations && response.value.confirmations > 0) return TransactionStatusType.SUCCEED
        return TransactionStatusType.NOT_DEPEND
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
        const tokens = await SolanaFungible.getFungibleTokenList(options.chainId)
        const token = tokens.find((x) => isSameAddress(x.address, address))
        return (
            token ??
            ({
                address,
                chainId: options.chainId,
            } as FungibleToken<ChainId, SchemaType>)
        )
    }

    async sendTransaction(transaction: Transaction, initial?: SolanaConnectionOptions) {
        const signedTransaction = await this.signTransaction(transaction)
        const raw = serializeTransaction(signedTransaction)
        return SolanaWeb3.sendAndConfirmRawTransaction(this.Web3.getConnection(initial), raw as Buffer)
    }

    async signMessage(type: string, message: string, initial?: SolanaConnectionOptions) {
        return this.Web3.getProviderInstance(initial).signMessage(message)
    }

    async signTransaction(transaction: Transaction, initial?: SolanaConnectionOptions) {
        return this.Web3.getProviderInstance(initial).signTransaction(transaction)
    }

    signTransactions(transactions: Transaction[], initial?: SolanaConnectionOptions) {
        return this.Web3.getProviderInstance(initial).signTransactions(transactions)
    }
}

export const createSolanaConnection = createConnectionCreator(
    NetworkPluginID.PLUGIN_SOLANA,
    (initial) => new SolanaConnectionAPI(initial),
    isValidChainId,
    new SolanaConnectionOptionsAPI(),
)

export const SOLWeb3 = createSolanaConnection()!
