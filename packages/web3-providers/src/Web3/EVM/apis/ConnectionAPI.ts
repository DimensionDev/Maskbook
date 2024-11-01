import * as web3_utils from /* webpackDefer: true */ 'web3-utils'
import { delay } from '@masknet/kit'
import { NetworkPluginID } from '@masknet/shared-base'
import type { Account, ECKeyIdentifier, Proof, UpdatableWallet, Wallet } from '@masknet/shared-base'
import {
    type AddressType,
    type ChainId,
    SchemaType,
    type Transaction,
    type TransactionDetailed,
    type TransactionReceipt,
    type Block,
    type TransactionSignature,
    type ProviderType,
    type Signature,
    type UserOperation,
    type Web3,
    EthereumMethodType,
    AccountTransaction,
    getAverageBlockDelay,
    isNativeTokenAddress,
    ContractTransaction,
    isValidChainId,
} from '@masknet/web3-shared-evm'
import { TransactionStatusType } from '@masknet/web3-shared-base'
import { evm } from '../../../Manager/registry.js'
import { EVMRequestAPI } from './RequestAPI.js'
import { EVMContractAPI } from './ContractAPI.js'
import { EVMConnectionReadonlyAPI } from './ConnectionReadonlyAPI.js'
import { ConnectionOptionsAPI } from './ConnectionOptionsAPI.js'
import type { BaseConnection } from '../../Base/apis/Connection.js'
import { EVMWalletProviders } from '../providers/index.js'
import type { EVMConnectionOptions } from '../types/index.js'
import { createConnectionCreator } from '../../Base/apis/ConnectionCreator.js'

export class ConnectionAPI
    extends EVMConnectionReadonlyAPI
    implements
        BaseConnection<
            ChainId,
            AddressType,
            SchemaType,
            ProviderType,
            Signature,
            UserOperation,
            Transaction,
            TransactionReceipt,
            TransactionDetailed,
            TransactionSignature,
            Block,
            Web3
        >
{
    protected override Request = new EVMRequestAPI(this.options)
    protected override Contract = new EVMContractAPI(this.options)
    protected override ConnectionOptions = new ConnectionOptionsAPI(this.options)

    override async addWallet(wallet: UpdatableWallet, initial?: EVMConnectionOptions): Promise<void> {
        await this.Request.request<void>(
            {
                method: EthereumMethodType.MASK_ADD_WALLET,
                params: [wallet],
            },
            initial,
        )
    }

    override async updateWallet(
        address: string,
        wallet: Partial<UpdatableWallet>,
        initial?: EVMConnectionOptions,
    ): Promise<void> {
        await this.Request.request<void>(
            {
                method: EthereumMethodType.MASK_UPDATE_WALLET,
                params: [address, wallet],
            },
            initial,
        )
    }

    override async renameWallet(address: string, name: string, initial?: EVMConnectionOptions): Promise<void> {
        await this.Request.request<void>(
            {
                method: EthereumMethodType.MASK_RENAME_WALLET,
                params: [address, name],
            },
            initial,
        )
    }

    override async removeWallet(
        address: string,
        password?: string | undefined,
        initial?: EVMConnectionOptions,
    ): Promise<void> {
        await this.Request.request<void>(
            {
                method: EthereumMethodType.MASK_REMOVE_WALLET,
                params: [address, password],
            },
            initial,
        )
    }

    override async resetAllWallets(initial?: EVMConnectionOptions): Promise<void> {
        await this.Request.request<void>(
            {
                method: EthereumMethodType.MASK_RESET_ALL_WALLETS,
                params: [],
            },
            initial,
        )
    }

    override async updateWallets(wallets: Wallet[], initial?: EVMConnectionOptions): Promise<void> {
        await this.Request.request<void>(
            {
                method: EthereumMethodType.MASK_UPDATE_WALLETS,
                params: wallets,
            },
            initial,
        )
    }

    override async removeWallets(wallets: Wallet[], initial?: EVMConnectionOptions): Promise<void> {
        await this.Request.request<void>(
            {
                method: EthereumMethodType.MASK_REMOVE_WALLETS,
                params: wallets,
            },
            initial,
        )
    }

    override async approveFungibleToken(
        address: string,
        recipient: string,
        amount: string,
        initial?: EVMConnectionOptions,
    ): Promise<string> {
        const options = this.ConnectionOptions.fill(initial)

        // Native
        if (!address || isNativeTokenAddress(address)) throw new Error('Invalid token address.')

        // ERC20
        return new ContractTransaction(this.Contract.getERC20Contract(address, options)).send(
            (x) => x?.methods.approve(recipient, web3_utils.toHex(amount)),
            options.overrides,
        )
    }

    override async approveAllNonFungibleTokens(
        address: string,
        recipient: string,
        approved: boolean,
        schema?: SchemaType,
        initial?: EVMConnectionOptions,
    ): Promise<string> {
        const options = this.ConnectionOptions.fill(initial)

        // Native
        if (!address || isNativeTokenAddress(address)) throw new Error('Invalid token address.')

        // ERC721 & ERC1155
        return new ContractTransaction(this.Contract.getERC721Contract(address, options)).send(
            (x) => x?.methods.setApprovalForAll(recipient, approved),
            options.overrides,
        )
    }

    override async transferFungibleToken(
        address: string,
        recipient: string,
        amount: string,
        memo?: string,
        initial?: EVMConnectionOptions,
    ): Promise<string> {
        const options = this.ConnectionOptions.fill(initial)

        // Native
        if (!address || isNativeTokenAddress(address)) {
            const tx: Transaction = {
                from: options.account,
                to: recipient,
                value: web3_utils.toHex(amount),
                data: memo ? web3_utils.toHex(memo) : undefined,
            }
            return this.sendTransaction(
                {
                    ...tx,
                    gas: await this.estimateTransaction(tx, 50000, options),
                },
                options,
            )
        }

        // ERC20
        return new ContractTransaction(this.Contract.getERC20Contract(address, options)).send(
            (x) => x?.methods.transfer(recipient, web3_utils.toHex(amount)),
            options.overrides,
        )
    }

    override async transferNonFungibleToken(
        address: string,
        tokenId: string,
        recipient: string,
        amount?: string,
        schema?: SchemaType,
        initial?: EVMConnectionOptions,
    ): Promise<string> {
        const options = this.ConnectionOptions.fill(initial)
        const actualSchema = schema ?? (await this.getSchemaType(address, options))

        // ERC1155
        if (actualSchema === SchemaType.ERC1155) {
            return new ContractTransaction(this.Contract.getERC1155Contract(address, options)).send(
                (x) => x?.methods.safeTransferFrom(options.account, recipient, tokenId, amount ?? '', '0x'),
                options.overrides,
            )
        }

        // ERC721
        return new ContractTransaction(this.Contract.getERC721Contract(address, options)).send(
            (x) => x?.methods.transferFrom(options.account, recipient, tokenId),
            options.overrides,
        )
    }

    override signMessage(
        type: 'message' | 'typedData' | Omit<string, 'message' | 'typedData'>,
        message: string,
        initial?: EVMConnectionOptions,
    ) {
        const options = this.ConnectionOptions.fill(initial)
        if (!options.account) throw new Error('Unknown account.')

        switch (type) {
            case 'message':
                return this.Request.request<string>(
                    {
                        method: EthereumMethodType.personal_sign,
                        params: [message, options.account, ''].filter((x) => typeof x !== 'undefined'),
                    },
                    options,
                )
            case 'typedData':
                return this.Request.request<string>(
                    {
                        method: EthereumMethodType.eth_signTypedData_v4,
                        params: [options.account, message],
                    },
                    options,
                )
            default:
                throw new Error(`Unknown sign type: ${type}.`)
        }
    }

    override async signTransaction(transaction: Transaction, initial?: EVMConnectionOptions) {
        return this.Request.request<string>(
            {
                method: EthereumMethodType.eth_signTransaction,
                params: [transaction],
            },
            initial,
        )
    }

    override signTransactions(transactions: Transaction[], initial?: EVMConnectionOptions) {
        return Promise.all(transactions.map((x) => this.signTransaction(x, initial)))
    }

    override supportedChainIds(initial?: EVMConnectionOptions) {
        return this.Request.request<ChainId[]>(
            {
                method: EthereumMethodType.eth_supportedChainIds,
                params: [],
            },
            initial,
        )
    }

    override async callUserOperation(owner: string, operation: UserOperation, initial?: EVMConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)
        return this.Request.request<string>(
            {
                method: EthereumMethodType.eth_callUserOperation,
                params: [
                    owner,
                    {
                        ...operation,
                        sender: options.account,
                    },
                ],
            },
            options,
        )
    }

    override async sendUserOperation(owner: string, operation: UserOperation, initial?: EVMConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)
        return this.Request.request<string>(
            {
                method: EthereumMethodType.eth_sendUserOperation,
                params: [
                    owner,
                    {
                        ...operation,
                        sender: operation.sender || options.account,
                    },
                ],
            },
            options,
        )
    }

    override async transfer(recipient: string, amount: string, initial?: EVMConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)
        const contract = this.Contract.getWalletContract(options.account, options)
        if (!contract) throw new Error('Failed to create contract.')

        const tx = {
            from: options.account,
            to: options.account,
            data: contract.methods.transfer(recipient, amount).encodeABI(),
        }

        return this.Request.request<string>(
            {
                method: EthereumMethodType.eth_sendTransaction,
                params: [
                    {
                        ...tx,
                        gas: await this.estimateTransaction(tx, 50000, options),
                    },
                ],
            },
            options,
        )
    }

    override async changeOwner(recipient: string, initial?: EVMConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)
        const contract = this.Contract.getWalletContract(options.account, options)
        if (!contract) throw new Error('Failed to create contract.')

        const tx = {
            from: options.account,
            to: options.account,
            data: contract.methods.changeOwner(recipient).encodeABI(),
        }

        return this.Request.request<string>(
            {
                method: EthereumMethodType.eth_sendTransaction,
                params: [
                    {
                        ...tx,
                        gas: await this.estimateTransaction(tx, 50000, options),
                    },
                ],
            },
            options,
        )
    }

    override async fund(proof: Proof, initial?: EVMConnectionOptions) {
        return this.Request.request<string>(
            {
                method: EthereumMethodType.MASK_FUND,
                params: [proof],
            },
            initial,
        )
    }

    override async deploy(owner: string, identifier?: ECKeyIdentifier, initial?: EVMConnectionOptions) {
        return this.Request.request<string>(
            {
                method: EthereumMethodType.MASK_DEPLOY,
                params: [owner, identifier],
            },
            initial,
        )
    }

    override async connect(initial?: EVMConnectionOptions): Promise<Account<ChainId>> {
        return this.Request.request<Account<ChainId>>(
            {
                method: EthereumMethodType.MASK_LOGIN,
                params: [],
            },
            initial,
        )
    }

    override async disconnect(initial?: EVMConnectionOptions): Promise<void> {
        await this.Request.request<void>(
            {
                method: EthereumMethodType.MASK_LOGOUT,
                params: [],
            },
            initial,
        )
    }

    override async switchChain(chainId: ChainId, initial?: EVMConnectionOptions): Promise<void> {
        const options = this.ConnectionOptions.fill(initial)
        await EVMWalletProviders[options.providerType].switchChain(chainId)
    }

    override async sendTransaction(transaction: Transaction, initial?: EVMConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)

        // send a transaction which will add into the internal transaction list and start to watch it for confirmation
        const hash = await this.Request.request<string>(
            {
                method: EthereumMethodType.eth_sendTransaction,
                params: [new AccountTransaction(transaction).fill(options.overrides)],
            },
            options,
        )

        return new Promise<string>((resolve, reject) => {
            const { Transaction, TransactionWatcher } = evm.state!
            if (!Transaction || !TransactionWatcher) {
                reject(new Error('No context found.'))
                return
            }

            const onProgress = async (
                chainId: ChainId,
                id: string,
                status: TransactionStatusType,
                transaction?: Transaction,
            ) => {
                if (status === TransactionStatusType.NOT_DEPEND) return
                if (!transaction?.from) return
                const transactions = await Transaction.getTransactions?.(chainId, transaction.from)
                const currentTransaction = transactions?.find((x) => {
                    const hashes = Object.keys(x.candidates)
                    return hashes.includes(hash) && hashes.includes(id)
                })
                if (currentTransaction) resolve(currentTransaction.indexId)
            }
            TransactionWatcher.emitter.on('progress', onProgress)
        })
    }

    override async confirmTransaction(hash: string, initial?: EVMConnectionOptions): Promise<TransactionReceipt> {
        const options = this.ConnectionOptions.fill(initial)
        const times = 49
        const interval = getAverageBlockDelay(options.chainId)

        for (let i = 0; i < times; i += 1) {
            if (options.signal?.aborted) throw new Error(options.signal.reason)

            try {
                const receipt = await this.getTransactionReceipt(hash, options)
                if (!receipt) throw new Error('Not confirm yet.')

                // the transaction has been confirmed
                return receipt
            } catch {
                await delay(interval)
                continue
            }
        }

        // insufficient try times
        throw new Error('Not confirm yet')
    }

    override replaceTransaction(hash: string, transaction: Transaction, initial?: EVMConnectionOptions) {
        return this.Request.request<void>(
            {
                method: EthereumMethodType.MASK_REPLACE_TRANSACTION,
                params: [hash, transaction],
            },
            initial,
        )
    }

    override cancelTransaction(hash: string, transaction: Transaction, initial?: EVMConnectionOptions) {
        return this.Request.request<void>(
            {
                method: EthereumMethodType.MASK_REPLACE_TRANSACTION,
                params: [
                    hash,
                    {
                        ...transaction,
                        to: transaction.from,
                        data: '0x0',
                        value: '0x0',
                    },
                ],
            },
            initial,
        )
    }
}

export const createConnection = createConnectionCreator(
    NetworkPluginID.PLUGIN_EVM,
    (initial) => new ConnectionAPI(initial),
    isValidChainId,
    new ConnectionOptionsAPI(),
)
export const EVMWeb3 = createConnection()!
