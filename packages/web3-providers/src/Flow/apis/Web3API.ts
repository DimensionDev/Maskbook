import { first, memoize } from 'lodash-es'
import getUnixTime from 'date-fns/getUnixTime'
import { unreachable } from '@masknet/kit'
import {
    AddressType,
    type SchemaType,
    type ChainId,
    type Web3,
    type Web3Provider,
    type Transaction,
    type TransactionDetailed,
    type TransactionReceipt,
    type Block,
    createClient,
    createNativeToken,
    isNativeTokenAddress,
    type TransactionQuery,
    type TransactionSignature,
    TransactionStatusCode,
    type BlockHeader,
} from '@masknet/web3-shared-flow'
import {
    type FungibleToken,
    type NonFungibleToken,
    type NonFungibleTokenMetadata,
    type NonFungibleTokenContract,
    type NonFungibleCollection,
    TransactionStatusType,
} from '@masknet/web3-shared-base'
import type { Web3BaseAPI } from '../../entry-types.js'

const createWeb3SDK = memoize(
    (chainId: ChainId) => createClient(chainId),
    (chainId) => chainId,
)

export class FlowWeb3API
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
    getWeb3(chainId: ChainId) {
        return createWeb3SDK(chainId)
    }
    getWeb3Provider(chainId: ChainId): Web3Provider {
        throw new Error('Method not implemented.')
    }
    async getBalance(chainId: ChainId, address: string): Promise<string> {
        const web3 = this.getWeb3(chainId)
        const account = await web3.send([web3.getAccount(address)]).then(web3.decode)
        return account.balance.toFixed()
    }
    getNativeTokenBalance(chainId: ChainId, owner: string): Promise<string> {
        throw new Error('Method not implemented.')
    }
    getFungibleTokenBalance(
        chainId: ChainId,
        address: string,
        owner: string,
        schema?: SchemaType | undefined,
    ): Promise<string> {
        if (!address || isNativeTokenAddress(address)) return this.getNativeTokenBalance(chainId, owner)

        // TODO
        return Promise.resolve('0')
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
    getFungibleTokensBalance(
        chainId: ChainId,
        listOfAddress: string[],
        owner: string,
    ): Promise<Record<string, string>> {
        throw new Error('Method not implemented.')
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
    async getAddressType(chainId: ChainId, address: string): Promise<AddressType | undefined> {
        return AddressType.Default
    }
    getSchemaType(chainId: ChainId, address: string): Promise<SchemaType | undefined> {
        throw new Error('Method not implemented.')
    }
    getBlock(chainId: ChainId, noOrId: string | number): Promise<Block | null> {
        const web3 = this.getWeb3(chainId)
        return web3.send([web3.getBlock(), web3.atBlockHeight(noOrId as number)]).then(web3.decode)
    }
    async getBlockNumber(chainId: ChainId): Promise<number> {
        const web3 = this.getWeb3(chainId)
        const blockHeader = await web3.send([web3.getBlockHeader()]).then(web3.decode)
        return blockHeader.height
    }
    async getBlockTimestamp(chainId: ChainId): Promise<number> {
        const web3 = this.getWeb3(chainId)
        const blockHeader: BlockHeader = await web3.send([web3.getBlockHeader()]).then(web3.decode)
        return getUnixTime(new Date(blockHeader.timestamp as unknown as string))
    }
    async getTransaction(chainId: ChainId, hash: string): Promise<TransactionDetailed | null> {
        const web3 = this.getWeb3(chainId)
        return web3.getTransaction(hash)
    }
    async getTransactionReceipt(chainId: ChainId, hash: string): Promise<TransactionReceipt | null> {
        return null
    }
    async getTransactionStatus(chainId: ChainId, hash: string): Promise<TransactionStatusType> {
        const web3 = this.getWeb3(chainId)
        const { status } = web3.getTransactionStatus(hash)
        const status_ = status as TransactionStatusCode
        switch (status_) {
            case TransactionStatusCode.UNKNOWN:
                return TransactionStatusType.NOT_DEPEND
            case TransactionStatusCode.PENDING:
            case TransactionStatusCode.FINALIZED:
            case TransactionStatusCode.EXECUTED:
                return TransactionStatusType.NOT_DEPEND
            case TransactionStatusCode.SEALED:
                return TransactionStatusType.NOT_DEPEND
            case TransactionStatusCode.EXPIRED:
                return TransactionStatusType.FAILED
            default:
                unreachable(status_)
        }
    }
    async getTransactionNonce(chainId: ChainId, address: string): Promise<number> {
        const web3 = this.getWeb3(chainId)
        const account = web3.getAccount(address)
        const key = first(account.keys)
        return key?.sequenceNumber ?? 0
    }
    getNativeToken(chainId: ChainId): Promise<FungibleToken<ChainId, SchemaType>> {
        const token = createNativeToken(chainId)
        return Promise.resolve(token)
    }
    getFungibleToken(chainId: ChainId, address: string): Promise<FungibleToken<ChainId, SchemaType>> {
        if (!address || isNativeTokenAddress(address)) {
            return this.getNativeToken(chainId)
        }
        throw new Error('Method not implemented.')
    }
    getNonFungibleToken(
        chainId: ChainId,
        address: string,
        tokenId: string,
        schema?: SchemaType | undefined,
    ): Promise<NonFungibleToken<ChainId, SchemaType>> {
        throw new Error('Method not implemented.')
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

    callTransaction(chainId: ChainId, transaction: TransactionQuery): Promise<string> {
        const web3 = this.getWeb3(chainId)
        return web3.query(transaction)
    }
    confirmTransaction(chainId: ChainId, hash: string, signal?: AbortSignal): Promise<TransactionReceipt> {
        throw new Error('Method not implemented.')
    }
    estimateTransaction(chainId: ChainId, transaction: Transaction, fallback?: number | undefined): Promise<string> {
        throw new Error('Method not implemented.')
    }
    sendSignedTransaction(chainId: ChainId, signed: string): Promise<string> {
        throw new Error('Method not implemented.')
    }
}
