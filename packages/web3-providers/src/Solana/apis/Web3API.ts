import { memoize } from 'lodash-es'
import {
    type AddressType,
    type ChainId,
    SchemaType,
    type Transaction,
    type TransactionDetailed,
    type TransactionReceipt,
    type Block,
    type Web3Provider,
    type Web3,
    createClient,
    createNativeToken,
    isNativeTokenAddress,
    getNativeTokenAddress,
    decodeAddress,
    type TransactionSignature,
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
import { type Connection, PublicKey, type TransactionResponse, sendAndConfirmRawTransaction } from '@solana/web3.js'
import { MagicEdenAPI } from '../../MagicEden/index.js'
import { SolanaFungibleAPI } from '../../Solana/index.js'
import type { Web3BaseAPI } from '../../entry-types.js'

const createWeb3SDK = memoize(
    (chainId: ChainId) => createClient(chainId),
    (chainId) => chainId,
)

export class SolanaWeb3API
    implements
        Web3BaseAPI.Provider<
            ChainId,
            AddressType,
            SchemaType,
            Transaction,
            TransactionDetailed,
            TransactionReceipt,
            TransactionSignature,
            Block,
            Web3Provider,
            Web3
        >
{
    private MagicEden = new MagicEdenAPI()
    private SolanaFungible = new SolanaFungibleAPI()

    getWeb3(chainId: ChainId): Web3 {
        throw new Error('Method not implemented.')
    }
    getWeb3Provider(chainId: ChainId): Web3Provider {
        throw new Error('Method not implemented.')
    }
    getWeb3Connection(chainId: ChainId): Connection {
        return createWeb3SDK(chainId)
    }
    async getBalance(chainId: ChainId, address: string): Promise<string> {
        const balance = await this.getWeb3Connection(chainId).getBalance(decodeAddress(address))
        return balance.toFixed()
    }
    async getNativeTokenBalance(chainId: ChainId, owner: string): Promise<string> {
        if (!owner) return '0'
        const connection = this.getWeb3Connection(chainId)
        const balance = await connection.getBalance(new PublicKey(owner))
        return balance.toString()
    }
    async getFungibleTokenBalance(
        chainId: ChainId,
        address: string,
        owner: string,
        schema?: SchemaType | undefined,
    ): Promise<string> {
        if (!owner) return '0'
        if (isNativeTokenAddress(address)) {
            return this.getNativeTokenBalance(chainId, owner)
        }
        const { data: assets } = await this.SolanaFungible.getAssets(owner, {
            chainId,
        })
        const asset = assets.find((x) => isSameAddress(x.address, address))
        return asset?.balance ?? '0'
    }
    getNonFungibleTokenBalance(
        chainId: ChainId,
        address: string,
        tokenId: string | undefined,
        owner: string,
        schema?: SchemaType | undefined,
    ): Promise<string> {
        throw new Error('Method not implemented.')
    }
    async getFungibleTokensBalance(
        chainId: ChainId,
        listOfAddress: string[],
        owner: string,
    ): Promise<Record<string, string>> {
        if (!owner) return {}
        const { data: assets } = await this.SolanaFungible.getAssets(owner, {
            chainId,
        })
        const records = assets.reduce<Record<string, string>>(
            (map, asset) => ({ ...map, [asset.address]: asset.balance }),
            {},
        )
        const nativeTokenAddress = getNativeTokenAddress(chainId)
        if (listOfAddress.includes(nativeTokenAddress)) {
            records[nativeTokenAddress] = await this.getNativeTokenBalance(chainId, owner)
        }
        // In the token picker UI, if balance of a token is undefined, then it
        // will keep loading. We set it 0 to walk around that, since fetching is done.
        listOfAddress.forEach((address) => {
            records[address] = records[address] ?? '0'
        })
        return records
    }
    getNonFungibleTokensBalance(
        chainId: ChainId,
        listOfAddress: string[],
        owner: string,
    ): Promise<Record<string, string>> {
        throw new Error('Method not implemented.')
    }
    getGasPrice(chainId: ChainId): Promise<string> {
        throw new Error('Method not implemented.')
    }
    getCode(chainId: ChainId, address: string): Promise<string> {
        throw new Error('Method not implemented.')
    }
    getAddressType(chainId: ChainId, address: string): Promise<AddressType | undefined> {
        throw new Error('Method not implemented.')
    }
    getSchemaType(chainId: ChainId, address: string): Promise<SchemaType | undefined> {
        throw new Error('Method not implemented.')
    }
    async getBlock(chainId: ChainId, noOrId: string | number): Promise<Block | null> {
        return this.getWeb3Connection(chainId).getBlock(noOrId as number)
    }
    async getBlockNumber(chainId: ChainId): Promise<number> {
        return this.getWeb3Connection(chainId).getSlot()
    }
    async getBlockTimestamp(chainId: ChainId): Promise<number> {
        const slot = await this.getBlockNumber(chainId)
        const response = await this.getWeb3Connection(chainId).getBlockTime(slot)
        return response ?? 0
    }
    getTransaction(chainId: ChainId, hash: string): Promise<TransactionResponse | null> {
        return this.getWeb3Connection(chainId).getTransaction(hash)
    }
    async getTransactionReceipt(chainId: ChainId, hash: string): Promise<TransactionReceipt | null> {
        return null
    }
    async getTransactionStatus(chainId: ChainId, hash: string): Promise<TransactionStatusType> {
        const response = await this.getWeb3Connection(chainId).getSignatureStatus(hash)
        if (response.value?.err) return TransactionStatusType.FAILED
        if (response.value?.confirmations && response.value.confirmations > 0) return TransactionStatusType.SUCCEED
        return TransactionStatusType.NOT_DEPEND
    }
    async getTransactionNonce(chainId: ChainId, address: string): Promise<number> {
        const response = await this.getWeb3Connection(chainId).getNonce(decodeAddress(address))
        return response?.nonce ? Number.parseInt(response.nonce, 10) : 0
    }
    async getNativeToken(chainId: ChainId): Promise<FungibleToken<ChainId, SchemaType>> {
        return createNativeToken(chainId)
    }
    async getFungibleToken(chainId: ChainId, address: string): Promise<FungibleToken<ChainId, SchemaType>> {
        if (!address || isNativeTokenAddress(address)) {
            return this.getNativeToken(chainId)
        }
        const tokens = await this.SolanaFungible.getFungibleTokenList(chainId, [])
        const token = tokens.find((x) => isSameAddress(x.address, address))
        return (
            token ??
            ({
                address,
                chainId,
            } as FungibleToken<ChainId, SchemaType>)
        )
    }
    async getNonFungibleToken(
        chainId: ChainId,
        address: string,
        tokenId: string,
        schema?: SchemaType | undefined,
    ): Promise<NonFungibleToken<ChainId, SchemaType>> {
        const asset = await this.MagicEden.getAsset(address, tokenId, {
            chainId,
        })
        return createNonFungibleToken(
            chainId,
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
        chainId: ChainId,
        address: string,
        tokenId: string,
        schema?: SchemaType | undefined,
    ): Promise<string> {
        throw new Error('Method not implemented.')
    }
    getNonFungibleTokenOwnership(
        chainId: ChainId,
        address: string,
        tokenId: string,
        owner: string,
        schema?: SchemaType | undefined,
    ): Promise<boolean> {
        throw new Error('Method not implemented.')
    }
    getNonFungibleTokenMetadata(
        chainId: ChainId,
        address: string,
        tokenId?: string | undefined,
        schema?: SchemaType | undefined,
    ): Promise<NonFungibleTokenMetadata<ChainId>> {
        throw new Error('Method not implemented.')
    }
    getNonFungibleTokenContract(
        chainId: ChainId,
        address: string,
        schema?: SchemaType | undefined,
    ): Promise<NonFungibleTokenContract<ChainId, SchemaType>> {
        throw new Error('Method not implemented.')
    }
    getNonFungibleTokenCollection(
        chainId: ChainId,
        address: string,
        schema?: SchemaType | undefined,
    ): Promise<NonFungibleCollection<ChainId, SchemaType>> {
        throw new Error('Method not implemented.')
    }
    callTransaction(chainId: ChainId, transaction: Transaction): Promise<string> {
        throw new Error('Method not implemented.')
    }
    confirmTransaction(chainId: ChainId, hash: string, signal?: AbortSignal): Promise<TransactionReceipt> {
        throw new Error('Method not implemented.')
    }
    estimateTransaction(chainId: ChainId, transaction: Transaction, fallback?: number | undefined): Promise<string> {
        throw new Error('Method not implemented.')
    }
    sendSignedTransaction(chainId: ChainId, signed: TransactionSignature): Promise<string> {
        return sendAndConfirmRawTransaction(this.getWeb3Connection(chainId), signed.serialize())
    }
}
