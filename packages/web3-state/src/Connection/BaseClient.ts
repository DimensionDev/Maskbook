import type { PartialRequired } from '@masknet/shared-base'
import type { Web3BaseAPI } from '@masknet/web3-providers/types'
import type { ConnectionOptions, TransactionStatusType } from '@masknet/web3-shared-base'

export class ConnectionBaseClient<
    ChainId,
    AddressType,
    SchemaType,
    ProviderType,
    Transaction,
    TransactionReceipt,
    Block,
    Web3,
> {
    constructor(
        protected chainId: ChainId,
        protected account: string,
        protected providerType: ProviderType,
        protected web3: Web3BaseAPI.Provider<
            ChainId,
            AddressType,
            SchemaType,
            Transaction,
            TransactionReceipt,
            Block,
            Web3
        >,
    ) {}

    protected getOptions(
        initial?: ConnectionOptions<ChainId, ProviderType, Transaction>,
        overrides?: Partial<ConnectionOptions<ChainId, ProviderType, Transaction>>,
    ): PartialRequired<ConnectionOptions<ChainId, ProviderType, Transaction>, 'account' | 'chainId' | 'providerType'> {
        return {
            account: this.account,
            chainId: this.chainId,
            providerType: this.providerType,
            ...initial,
            ...initial?.overrides,
            ...overrides?.overrides,
        }
    }

    async getGasPrice(initial?: ConnectionOptions<ChainId, ProviderType, Transaction>): Promise<string> {
        return this.web3.getGasPrice(this.getOptions(initial).chainId)
    }

    async getAddressType(
        address: string,
        initial?: ConnectionOptions<ChainId, ProviderType, Transaction>,
    ): Promise<AddressType | undefined> {
        return this.web3.getAddressType(this.getOptions(initial).chainId, address)
    }

    async getSchemaType(
        address: string,
        initial?: ConnectionOptions<ChainId, ProviderType, Transaction>,
    ): Promise<SchemaType | undefined> {
        return this.web3.getSchemaType(this.getOptions(initial).chainId, address)
    }

    getBlock(noOrId: number | string, initial?: ConnectionOptions<ChainId, ProviderType, Transaction>) {
        return this.web3.getBlock(this.getOptions(initial).chainId, noOrId)
    }

    getBlockNumber(initial?: ConnectionOptions<ChainId, ProviderType, Transaction>) {
        return this.web3.getBlockNumber(this.getOptions(initial).chainId)
    }

    async getBlockTimestamp(initial?: ConnectionOptions<ChainId, ProviderType, Transaction>): Promise<number> {
        return this.web3.getBlockTimestamp(this.getOptions(initial).chainId)
    }

    getBalance(address: string, initial?: ConnectionOptions<ChainId, ProviderType, Transaction>) {
        return this.web3.getBalance(this.getOptions(initial).chainId, address)
    }

    getCode(address: string, initial?: ConnectionOptions<ChainId, ProviderType, Transaction>) {
        return this.web3.getCode(this.getOptions(initial).chainId, address)
    }

    async getTransaction(hash: string, initial?: ConnectionOptions<ChainId, ProviderType, Transaction>) {
        return this.web3.getTransaction(this.getOptions(initial).chainId, hash)
    }

    getTransactionReceipt(hash: string, initial?: ConnectionOptions<ChainId, ProviderType, Transaction>) {
        return this.web3.getTransactionReceipt(this.getOptions(initial).chainId, hash)
    }

    async getTransactionStatus(
        hash: string,
        initial?: ConnectionOptions<ChainId, ProviderType, Transaction>,
    ): Promise<TransactionStatusType> {
        return this.web3.getTransactionStatus(this.getOptions(initial).chainId, hash)
    }

    async getTransactionNonce(address: string, initial?: ConnectionOptions<ChainId, ProviderType, Transaction>) {
        return this.web3.getTransactionNonce(this.getOptions(initial).chainId, address)
    }
}
