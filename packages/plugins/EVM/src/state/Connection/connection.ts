import { first, identity, pickBy } from 'lodash-es'
import { toHex, type AbiItem } from 'web3-utils'
import type { RequestArguments } from 'web3-core'
import { delay } from '@masknet/kit'
import type { Plugin } from '@masknet/plugin-infra'
import type { ECKeyIdentifier, PartialRequired, Proof } from '@masknet/shared-base'
import type { ERC20 } from '@masknet/web3-contracts/types/ERC20.js'
import type { ERC721 } from '@masknet/web3-contracts/types/ERC721.js'
import type { ERC1155 } from '@masknet/web3-contracts/types/ERC1155.js'
import type { Wallet as WalletContract } from '@masknet/web3-contracts/types/Wallet.js'
import ERC20ABI from '@masknet/web3-contracts/abis/ERC20.json'
import ERC721ABI from '@masknet/web3-contracts/abis/ERC721.json'
import ERC1155ABI from '@masknet/web3-contracts/abis/ERC1155.json'
import WalletContractABI from '@masknet/web3-contracts/abis/Wallet.json'
import {
    ChainId,
    EthereumMethodType,
    ProviderType,
    SchemaType,
    type Transaction,
    createContract,
    createWeb3,
    createWeb3Provider,
    isNativeTokenAddress,
    type UserOperation,
    type AddressType,
    ContractTransaction,
    AccountTransaction,
    PayloadEditor,
    type TransactionReceipt,
} from '@masknet/web3-shared-evm'
import {
    type Account,
    type ConnectionOptions,
    type FungibleToken,
    type NonFungibleToken,
    type NonFungibleCollection,
    type NonFungibleTokenContract,
    TransactionStatusType,
} from '@masknet/web3-shared-base'
import { Web3 } from '@masknet/web3-providers'
import type { BaseContract } from '@masknet/web3-contracts/types/types.js'
import { Providers } from '../Provider/provider.js'
import { dispatch } from './composer.js'
import { createContext } from './context.js'
import type { EVM_Connection, EVM_ConnectionOptions } from './types.js'
import { Web3StateSettings } from '../../settings/index.js'

class Connection implements EVM_Connection {
    constructor(
        private chainId: ChainId,
        private account: string,
        private providerType: ProviderType,
        private context?: Plugin.Shared.SharedUIContext,
    ) {}

    private get Provider() {
        return Web3StateSettings.value.Provider
    }

    private get Transaction() {
        return Web3StateSettings.value.Transaction
    }

    private get TransactionWatcher() {
        return Web3StateSettings.value.TransactionWatcher
    }

    // Hijack RPC requests and process them with koa like middleware
    private get hijackedRequest() {
        return <T extends unknown>(requestArguments: RequestArguments, initial?: EVM_ConnectionOptions) => {
            return new Promise<T>(async (resolve, reject) => {
                const options = this.getOptions(initial)
                const context = createContext(this, requestArguments, options)

                try {
                    await dispatch(context, async () => {
                        if (!context.writeable) return
                        try {
                            switch (context.method) {
                                case EthereumMethodType.MASK_LOGIN:
                                    context.write(
                                        await this.Provider?.connect(
                                            options.providerType,
                                            options.chainId,
                                            options.account,
                                            options.owner
                                                ? {
                                                      account: options.owner,
                                                      identifier: options.identifier,
                                                  }
                                                : undefined,
                                            options.silent,
                                        ),
                                    )
                                    break
                                case EthereumMethodType.MASK_LOGOUT:
                                    context.write(await this.Provider?.disconnect(options.providerType))
                                    break
                                default: {
                                    const provider =
                                        Providers[
                                            PayloadEditor.fromPayload(context.request).readonly
                                                ? ProviderType.MaskWallet
                                                : options.providerType
                                        ]

                                    // chain switching silently
                                    if (context.method === EthereumMethodType.ETH_SEND_TRANSACTION) {
                                        if (options.providerType === ProviderType.MaskWallet) {
                                            await provider.switchChain(options.chainId)
                                            // the settings stay in the background, other pages need a delay to sync
                                            await delay(1500)
                                        }
                                        // make sure that the provider is connected before sending the transaction
                                        await this.Provider?.connect(options.providerType, options.chainId)
                                    }

                                    const web3Provider = provider.createWeb3Provider({
                                        account: options.account,
                                        chainId: options.chainId,
                                    })

                                    // send request and set result in the context
                                    context.write((await web3Provider.request(context.requestArguments)) as T)
                                    break
                                }
                            }
                        } catch (error) {
                            context.abort(error)
                        }
                    })
                } catch (error) {
                    context.abort(error)
                } finally {
                    if (context.error) reject(context.error)
                    else resolve(context.result as T)
                }
            })
        }
    }

    private getOptions(
        initial?: EVM_ConnectionOptions,
        overrides?: Partial<EVM_ConnectionOptions>,
    ): PartialRequired<EVM_ConnectionOptions, 'account' | 'chainId' | 'providerType'> {
        return {
            account: this.account,
            chainId: this.chainId,
            providerType: this.providerType,
            ...pickBy(initial, identity),
            overrides: {
                from: initial?.account ?? this.account,
                chainId: initial?.chainId ?? this.chainId,
                ...pickBy(initial?.overrides, identity),
                ...pickBy(overrides?.overrides, identity),
            },
        }
    }

    private getWeb3Contract<T extends BaseContract>(address: string, ABI: AbiItem[], initial?: EVM_ConnectionOptions) {
        const options = this.getOptions(initial)
        const web3 = this.getWeb3(options)
        return createContract<T>(web3, address, ABI)
    }

    private getERC20Contract(address: string, initial?: EVM_ConnectionOptions) {
        const options = this.getOptions(initial)
        return this.getWeb3Contract<ERC20>(address, ERC20ABI as AbiItem[], options)
    }

    private getERC721Contract(address: string, initial?: EVM_ConnectionOptions) {
        const options = this.getOptions(initial)
        return this.getWeb3Contract<ERC721>(address, ERC721ABI as AbiItem[], options)
    }

    private getERC1155Contract(address: string, initial?: EVM_ConnectionOptions) {
        const options = this.getOptions(initial)
        return this.getWeb3Contract<ERC1155>(address, ERC1155ABI as AbiItem[], options)
    }

    private getWalletContract(address: string, initial?: EVM_ConnectionOptions) {
        const options = this.getOptions(initial)
        return this.getWeb3Contract<WalletContract>(address, WalletContractABI as AbiItem[], options)
    }

    getWeb3(initial?: EVM_ConnectionOptions) {
        return createWeb3(
            createWeb3Provider((requestArguments: RequestArguments) =>
                this.hijackedRequest(requestArguments, this.getOptions(initial)),
            ),
        )
    }

    getWeb3Provider(initial?: EVM_ConnectionOptions) {
        return createWeb3Provider((requestArguments: RequestArguments) =>
            this.hijackedRequest(requestArguments, this.getOptions(initial)),
        )
    }

    async connect(initial?: EVM_ConnectionOptions): Promise<Account<ChainId>> {
        return this.hijackedRequest<Account<ChainId>>(
            {
                method: EthereumMethodType.MASK_LOGIN,
                params: [],
            },
            this.getOptions(initial),
        )
    }
    async disconnect(initial?: EVM_ConnectionOptions): Promise<void> {
        await this.hijackedRequest<void>(
            {
                method: EthereumMethodType.MASK_LOGOUT,
                params: [],
            },
            this.getOptions(initial),
        )
    }
    async approveFungibleToken(
        address: string,
        recipient: string,
        amount: string,
        initial?: EVM_ConnectionOptions,
    ): Promise<string> {
        const options = this.getOptions(initial)

        // Native
        if (!address || isNativeTokenAddress(address)) throw new Error('Invalid token address.')

        // ERC20
        return new ContractTransaction(this.getERC20Contract(address, options)).send(
            (x) => x?.methods.approve(recipient, toHex(amount)),
            options.overrides,
        )
    }
    async approveNonFungibleToken(
        address: string,
        recipient: string,
        tokenId: string,
        schema: SchemaType,
        initial?: EVM_ConnectionOptions,
    ): Promise<string> {
        // Do not use `approve()`, since it is buggy.
        // https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/ERC721.sol
        throw new Error('Method not implemented.')
    }
    async approveAllNonFungibleTokens(
        address: string,
        recipient: string,
        approved: boolean,
        schema?: SchemaType,
        initial?: EVM_ConnectionOptions,
    ): Promise<string> {
        const options = this.getOptions(initial)

        // Native
        if (!address || isNativeTokenAddress(address)) throw new Error('Invalid token address.')

        // ERC721 & ERC1155
        return new ContractTransaction(this.getERC721Contract(address, options)).send(
            (x) => x?.methods.setApprovalForAll(recipient, approved),
            options.overrides,
        )
    }
    async transferFungibleToken(
        address: string,
        recipient: string,
        amount: string,
        memo?: string,
        initial?: EVM_ConnectionOptions,
    ): Promise<string> {
        const options = this.getOptions(initial)

        // Native
        if (!address || isNativeTokenAddress(address)) {
            const tx: Transaction = {
                from: options.account,
                to: recipient,
                value: toHex(amount),
                data: memo ? toHex(memo) : undefined,
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
        return new ContractTransaction(this.getERC20Contract(address, options)).send(
            (x) => x?.methods.transfer(recipient, toHex(amount)),
            options.overrides,
        )
    }
    async transferNonFungibleToken(
        address: string,
        tokenId: string,
        recipient: string,
        amount?: string,
        schema?: SchemaType,
        initial?: EVM_ConnectionOptions,
    ): Promise<string> {
        const options = this.getOptions(initial)
        const actualSchema = schema ?? (await this.getSchemaType(address, options))

        // ERC1155
        if (actualSchema === SchemaType.ERC1155) {
            return new ContractTransaction(this.getERC1155Contract(address, options)).send(
                (x) => x?.methods.safeTransferFrom(options.account, recipient, tokenId, amount ?? '', '0x'),
                options.overrides,
            )
        }

        // ERC721
        return new ContractTransaction(this.getERC721Contract(address, options)).send(
            (x) => x?.methods.transferFrom(options.account, recipient, tokenId),
            options.overrides,
        )
    }

    async getGasPrice(initial?: EVM_ConnectionOptions): Promise<string> {
        const options = this.getOptions(initial)
        return Web3.getGasPrice(options.chainId)
    }
    async getAddressType(address: string, initial?: EVM_ConnectionOptions): Promise<AddressType | undefined> {
        const options = this.getOptions(initial)
        return Web3.getAddressType(options.chainId, address)
    }
    async getSchemaType(address: string, initial?: EVM_ConnectionOptions): Promise<SchemaType | undefined> {
        const options = this.getOptions(initial)
        return Web3.getSchemaType(options.chainId, address)
    }
    async getNonFungibleToken(
        address: string,
        tokenId: string,
        schema?: SchemaType,
        initial?: EVM_ConnectionOptions,
    ): Promise<NonFungibleToken<ChainId, SchemaType>> {
        const options = this.getOptions(initial)
        return Web3.getNonFungibleToken(options.chainId, address, tokenId, schema)
    }

    async getNonFungibleTokenOwner(
        address: string,
        tokenId: string,
        schema?: SchemaType,
        initial?: EVM_ConnectionOptions,
    ) {
        const options = this.getOptions(initial)
        return Web3.getNonFungibleTokenOwner(options.chainId, address, tokenId, schema)
    }

    async getNonFungibleTokenOwnership(
        address: string,
        tokenId: string,
        owner: string,
        schema?: SchemaType,
        initial?: EVM_ConnectionOptions,
    ) {
        const options = this.getOptions(initial)
        return Web3.getNonFungibleTokenOwnership(options.chainId, address, tokenId, owner, schema)
    }
    async getNonFungibleTokenMetadata(
        address: string,
        tokenId: string | undefined,
        schema?: SchemaType,
        initial?: EVM_ConnectionOptions,
    ) {
        const options = this.getOptions(initial)
        return Web3.getNonFungibleTokenMetadata(options.chainId, address, tokenId, schema)
    }
    async getNonFungibleTokenContract(
        address: string,
        schema?: SchemaType,
        initial?: EVM_ConnectionOptions,
    ): Promise<NonFungibleTokenContract<ChainId, SchemaType>> {
        const options = this.getOptions(initial)
        return Web3.getNonFungibleTokenContract(options.chainId, address, schema)
    }
    async getNonFungibleTokenCollection(
        address: string,
        schema?: SchemaType,
        initial?: EVM_ConnectionOptions,
    ): Promise<NonFungibleCollection<ChainId, SchemaType>> {
        const options = this.getOptions(initial)
        return Web3.getNonFungibleTokenCollection(options.chainId, address, schema)
    }
    async switchChain(chainId: ChainId, initial?: EVM_ConnectionOptions): Promise<void> {
        const options = this.getOptions(initial)
        await Providers[options.providerType].switchChain(chainId)
    }
    async getNativeTokenBalance(initial?: EVM_ConnectionOptions): Promise<string> {
        const options = this.getOptions(initial)
        return Web3.getNativeTokenBalance(options.chainId, options.account)
    }
    async getFungibleTokenBalance(
        address: string,
        schema?: SchemaType,
        initial?: EVM_ConnectionOptions,
    ): Promise<string> {
        const options = this.getOptions(initial)
        return Web3.getFungibleTokenBalance(options.chainId, address, options.account, schema)
    }
    async getNonFungibleTokenBalance(
        address: string,
        tokenId: string | undefined,
        schema?: SchemaType,
        initial?: EVM_ConnectionOptions,
    ): Promise<string> {
        const options = this.getOptions(initial)
        return Web3.getNonFungibleTokenBalance(options.chainId, address, tokenId, options.account, schema)
    }
    async getFungibleTokensBalance(
        listOfAddress: string[],
        initial?: EVM_ConnectionOptions,
    ): Promise<Record<string, string>> {
        const options = this.getOptions(initial)
        return Web3.getFungibleTokensBalance(options.chainId, listOfAddress, options.account)
    }

    async getNonFungibleTokensBalance(
        listOfAddress: string[],
        initial?: EVM_ConnectionOptions,
    ): Promise<Record<string, string>> {
        const options = this.getOptions(initial)
        return Web3.getNonFungibleTokensBalance(options.chainId, listOfAddress, options.account)
    }

    getNativeToken(initial?: EVM_ConnectionOptions): Promise<FungibleToken<ChainId, SchemaType>> {
        const options = this.getOptions(initial)
        return Web3.getNativeToken(options.chainId)
    }

    async getFungibleToken(
        address: string,
        initial?: EVM_ConnectionOptions,
    ): Promise<FungibleToken<ChainId, SchemaType>> {
        const options = this.getOptions(initial)
        return Web3.getFungibleToken(options.chainId, address)
    }

    async getAccount(initial?: EVM_ConnectionOptions) {
        const options = this.getOptions(initial)
        const accounts = await this.hijackedRequest<string[]>(
            {
                method: EthereumMethodType.ETH_ACCOUNTS,
            },
            options,
        )
        return first(accounts) ?? ''
    }

    async getChainId(initial?: EVM_ConnectionOptions) {
        const options = this.getOptions(initial)
        const chainId = await this.hijackedRequest<string>(
            {
                method: EthereumMethodType.ETH_CHAIN_ID,
            },
            options,
        )
        return Number.parseInt(chainId, 16)
    }

    getBlock(noOrId: number | string, initial?: EVM_ConnectionOptions) {
        const options = this.getOptions(initial)
        return Web3.getBlock(options.chainId, noOrId)
    }

    getBlockNumber(initial?: EVM_ConnectionOptions) {
        const options = this.getOptions(initial)
        return Web3.getBlockNumber(options.chainId)
    }

    async getBlockTimestamp(initial?: EVM_ConnectionOptions): Promise<number> {
        const options = this.getOptions(initial)
        return Web3.getBlockTimestamp(options.chainId)
    }

    getBalance(address: string, initial?: EVM_ConnectionOptions) {
        const options = this.getOptions(initial)
        return Web3.getBalance(options.chainId, address)
    }

    getCode(address: string, initial?: EVM_ConnectionOptions) {
        const options = this.getOptions(initial)
        return Web3.getCode(options.chainId, address)
    }

    async getTransaction(hash: string, initial?: EVM_ConnectionOptions) {
        const options = this.getOptions(initial)
        return Web3.getTransaction(options.chainId, hash)
    }

    async estimateTransaction(transaction: Transaction, fallback = 21000, initial?: EVM_ConnectionOptions) {
        try {
            const options = this.getOptions(initial)
            return this.hijackedRequest<string>(
                {
                    method: EthereumMethodType.ETH_ESTIMATE_GAS,
                    params: [
                        new AccountTransaction({
                            from: options.account,
                            ...transaction,
                        }).fill(options.overrides),
                    ],
                },
                options,
            )
        } catch {
            return toHex(fallback)
        }
    }

    getTransactionReceipt(hash: string, initial?: EVM_ConnectionOptions) {
        const options = this.getOptions(initial)
        return Web3.getTransactionReceipt(options.chainId, hash)
    }

    async getTransactionStatus(hash: string, initial?: EVM_ConnectionOptions): Promise<TransactionStatusType> {
        const options = this.getOptions(initial)
        return Web3.getTransactionStatus(options.chainId, hash)
    }

    async getTransactionNonce(address: string, initial?: EVM_ConnectionOptions) {
        const options = this.getOptions(initial)
        return Web3.getTransactionNonce(options.chainId, address)
    }

    signMessage(
        type: 'message' | 'typedData' | Omit<string, 'message' | 'typedData'>,
        message: string,
        initial?: EVM_ConnectionOptions,
    ) {
        const options = this.getOptions(initial)
        if (!options.account) throw new Error('Unknown account.')

        switch (type) {
            case 'message':
                return this.hijackedRequest<string>(
                    {
                        method: EthereumMethodType.PERSONAL_SIGN,
                        params: [message, options.account, ''].filter((x) => typeof x !== 'undefined'),
                    },
                    options,
                )
            case 'typedData':
                return this.hijackedRequest<string>(
                    {
                        method: EthereumMethodType.ETH_SIGN_TYPED_DATA,
                        params: [options.account, message],
                    },
                    options,
                )
            default:
                throw new Error(`Unknown sign type: ${type}.`)
        }
    }

    async verifyMessage(
        type: string,
        message: string,
        signature: string,
        initial?: ConnectionOptions<ChainId, ProviderType, Transaction>,
    ) {
        const options = this.getOptions(initial)
        const web3 = this.getWeb3(options)
        const dataToSign = await web3.eth.personal.ecRecover(message, signature)
        return dataToSign === message
    }

    async signTransaction(transaction: Transaction, initial?: EVM_ConnectionOptions) {
        const options = this.getOptions(initial)
        return this.hijackedRequest<string>(
            {
                method: EthereumMethodType.ETH_SIGN_TRANSACTION,
                params: [transaction],
            },
            options,
        )
    }

    signTransactions(transactions: Transaction[], initial?: EVM_ConnectionOptions) {
        return Promise.all(transactions.map((x) => this.signTransaction(x, initial)))
    }

    supportedChainIds(initial?: ConnectionOptions<ChainId, ProviderType, Transaction> | undefined) {
        const options = this.getOptions(initial)
        return this.hijackedRequest<ChainId[]>(
            {
                method: EthereumMethodType.ETH_SUPPORTED_CHAIN_IDS,
                params: [],
            },
            options,
        )
    }

    supportedEntryPoints(initial?: ConnectionOptions<ChainId, ProviderType, Transaction> | undefined) {
        const options = this.getOptions(initial)
        return this.hijackedRequest<string[]>(
            {
                method: EthereumMethodType.ETH_SUPPORTED_ENTRY_POINTS,
                params: [],
            },
            options,
        )
    }

    async callUserOperation(
        owner: string,
        operation: UserOperation,
        initial?: ConnectionOptions<ChainId, ProviderType, Transaction> | undefined,
    ) {
        const options = this.getOptions(initial)
        return this.hijackedRequest<string>(
            {
                method: EthereumMethodType.ETH_CALL_USER_OPERATION,
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

    async sendUserOperation(
        owner: string,
        operation: UserOperation,
        initial?: ConnectionOptions<ChainId, ProviderType, Transaction> | undefined,
    ) {
        const options = this.getOptions(initial)
        return this.hijackedRequest<string>(
            {
                method: EthereumMethodType.ETH_SEND_USER_OPERATION,
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

    async transfer(
        recipient: string,
        amount: string,
        initial?: ConnectionOptions<ChainId, ProviderType, Transaction> | undefined,
    ) {
        const options = this.getOptions(initial)
        const contract = this.getWalletContract(options.account, options)
        if (!contract) throw new Error('Failed to create contract.')

        const tx = {
            from: options.account,
            to: options.account,
            data: contract.methods.transfer(recipient, amount).encodeABI(),
        }

        return this.hijackedRequest<string>(
            {
                method: EthereumMethodType.ETH_SEND_TRANSACTION,
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

    async changeOwner(recipient: string, initial?: ConnectionOptions<ChainId, ProviderType, Transaction> | undefined) {
        const options = this.getOptions(initial)
        const contract = this.getWalletContract(options.account, options)
        if (!contract) throw new Error('Failed to create contract.')

        const tx = {
            from: options.account,
            to: options.account,
            data: contract.methods.changeOwner(recipient).encodeABI(),
        }

        return this.hijackedRequest<string>(
            {
                method: EthereumMethodType.ETH_SEND_TRANSACTION,
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

    async fund(proof: Proof, initial?: ConnectionOptions<ChainId, ProviderType, Transaction> | undefined) {
        const options = this.getOptions(initial)
        return this.hijackedRequest<string>(
            {
                method: EthereumMethodType.MASK_FUND,
                params: [proof],
            },
            options,
        )
    }

    async deploy(
        owner: string,
        identifier?: ECKeyIdentifier,
        initial?: ConnectionOptions<ChainId, ProviderType, Transaction> | undefined,
    ) {
        const options = this.getOptions(initial)
        return this.hijackedRequest<string>(
            {
                method: EthereumMethodType.MASK_DEPLOY,
                params: [owner, identifier],
            },
            options,
        )
    }

    callTransaction(transaction: Transaction, initial?: EVM_ConnectionOptions) {
        const options = this.getOptions(initial)
        return Web3.callTransaction(options.chainId, transaction, options.overrides)
    }
    async sendTransaction(transaction: Transaction, initial?: EVM_ConnectionOptions) {
        const options = this.getOptions(initial)

        // send a transaction which will add into the internal transaction list and start to watch it for confirmation
        const hash = await this.hijackedRequest<string>(
            {
                method: EthereumMethodType.ETH_SEND_TRANSACTION,
                params: [new AccountTransaction(transaction).fill(options.overrides)],
            },
            options,
        )

        return new Promise<string>((resolve, reject) => {
            if (!this.Transaction || !this.TransactionWatcher) reject(new Error('No context found.'))

            const onProgress = async (
                chainId: ChainId,
                id: string,
                status: TransactionStatusType,
                transaction?: Transaction,
            ) => {
                if (status === TransactionStatusType.NOT_DEPEND) return
                if (!transaction?.from) return
                const transactions = await this.Transaction?.getTransactions?.(chainId, transaction.from)
                const currentTransaction = transactions?.find((x) => {
                    const hashes = Object.keys(x.candidates)
                    return hashes.includes(hash) && hashes.includes(id)
                })
                if (currentTransaction) resolve(currentTransaction.indexId)
            }
            this.TransactionWatcher?.emitter.on('progress', onProgress)
        })
    }

    sendSignedTransaction(signature: string, initial?: EVM_ConnectionOptions) {
        const options = this.getOptions(initial)
        return Web3.sendSignedTransaction(options.chainId, signature)
    }

    confirmTransaction(hash: string, initial?: EVM_ConnectionOptions): Promise<TransactionReceipt> {
        const options = this.getOptions(initial)
        return Web3.confirmTransaction(options.chainId, hash, options.signal)
    }

    replaceTransaction(hash: string, transaction: Transaction, initial?: EVM_ConnectionOptions) {
        const options = this.getOptions(initial)
        return this.hijackedRequest<void>(
            {
                method: EthereumMethodType.MASK_REPLACE_TRANSACTION,
                params: [hash, transaction],
            },
            options,
        )
    }

    cancelTransaction(hash: string, transaction: Transaction, initial?: EVM_ConnectionOptions) {
        const options = this.getOptions(initial)
        return this.hijackedRequest<void>(
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
            options,
        )
    }
}

/**
 * Build connection with provider.
 * @param providerType
 * @returns
 */
export function createConnection(
    context?: Plugin.Shared.SharedUIContext,
    options?: {
        chainId?: ChainId
        account?: string
        providerType?: ProviderType
    },
) {
    const { chainId = ChainId.Mainnet, account = '', providerType = ProviderType.MaskWallet } = options ?? {}

    return new Connection(chainId, account, providerType, context)
}
