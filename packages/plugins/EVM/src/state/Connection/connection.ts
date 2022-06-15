import { AbiItem, numberToHex, toHex, toNumber } from 'web3-utils'
import { first } from 'lodash-unified'
import urlcat from 'urlcat'
import type { RequestArguments, SignedTransaction, TransactionReceipt } from 'web3-core'
import type { ERC20 } from '@masknet/web3-contracts/types/ERC20'
import type { ERC20Bytes32 } from '@masknet/web3-contracts/types/ERC20Bytes32'
import type { ERC165 } from '@masknet/web3-contracts/types/ERC165'
import type { ERC721 } from '@masknet/web3-contracts/types/ERC721'
import type { ERC1155 } from '@masknet/web3-contracts/types/ERC1155'
import type { BalanceChecker } from '@masknet/web3-contracts/types/BalanceChecker'
import ERC20ABI from '@masknet/web3-contracts/abis/ERC20.json'
import ERC165ABI from '@masknet/web3-contracts/abis/ERC165.json'
import ERC20Bytes32ABI from '@masknet/web3-contracts/abis/ERC20Bytes32.json'
import ERC721ABI from '@masknet/web3-contracts/abis/ERC721.json'
import ERC1155ABI from '@masknet/web3-contracts/abis/ERC1155.json'
import BalanceCheckerABI from '@masknet/web3-contracts/abis/BalanceChecker.json'
import type { Plugin } from '@masknet/plugin-infra'
import {
    ChainId,
    EthereumMethodType,
    ProviderType,
    SchemaType,
    Block,
    Transaction,
    TransactionDetailed,
    createNativeToken,
    createContract,
    getTokenConstants,
    sendTransaction,
    createERC20Token,
    parseStringOrBytes32,
    createWeb3,
    createWeb3Provider,
    getEthereumConstants,
    isValidAddress,
    resolveIPFSLinkFromURL,
} from '@masknet/web3-shared-evm'
import {
    Account,
    ConnectionOptions,
    createNonFungibleToken,
    createNonFungibleTokenCollection,
    createNonFungibleTokenContract,
    createNonFungibleTokenMetadata,
    currySameAddress,
    FungibleToken,
    isSameAddress,
    NonFungibleToken,
    NonFungibleTokenCollection,
    NonFungibleTokenContract,
    NonFungibleTokenMetadata,
    TransactionStatusType,
} from '@masknet/web3-shared-base'
import type { BaseContract } from '@masknet/web3-contracts/types/types'
import { createContext, dispatch } from './composer'
import { Providers } from './provider'
import type { ERC1155Metadata, ERC721Metadata, EVM_Connection, EVM_Web3ConnectionOptions } from './types'
import { getReceiptStatus } from './utils'
import { Web3StateSettings } from '../../settings'
import { getSubscriptionCurrentValue } from '@masknet/shared-base'

const EMPTY_STRING = () => Promise.resolve('')
const ZERO = () => Promise.resolve(0)

export function isReadOnlyMethod(method: EthereumMethodType) {
    return [
        EthereumMethodType.ETH_GET_CODE,
        EthereumMethodType.ETH_GAS_PRICE,
        EthereumMethodType.ETH_BLOCK_NUMBER,
        EthereumMethodType.ETH_GET_BALANCE,
        EthereumMethodType.ETH_GET_BLOCK_BY_NUMBER,
        EthereumMethodType.ETH_GET_BLOCK_BY_HASH,
        EthereumMethodType.ETH_GET_TRANSACTION_BY_HASH,
        EthereumMethodType.ETH_GET_TRANSACTION_RECEIPT,
        EthereumMethodType.ETH_GET_TRANSACTION_COUNT,
        EthereumMethodType.ETH_GET_FILTER_CHANGES,
        EthereumMethodType.ETH_NEW_PENDING_TRANSACTION_FILTER,
        EthereumMethodType.ETH_ESTIMATE_GAS,
        EthereumMethodType.ETH_CALL,
        EthereumMethodType.ETH_GET_LOGS,
    ].includes(method)
}

function isNativeTokenAddress(chainId: ChainId, address: string) {
    if (!address) return false
    return isSameAddress(address, getTokenConstants(chainId).NATIVE_TOKEN_ADDRESS)
}

async function fetchJSON<T extends unknown>(
    input: RequestInfo,
    init?: RequestInit | undefined,
    options?: {
        fetch?: (input: RequestInfo, init?: RequestInit | undefined) => Promise<Response>
    },
) {
    const fetch_ = options?.fetch ?? globalThis.fetch
    const response = await fetch_(input, init)
    if (!response.ok) throw new Error('Failed to fetch.')
    return response.json() as Promise<T>
}

class Connection implements EVM_Connection {
    constructor(
        private chainId: ChainId,
        private account: string,
        private providerType: ProviderType,
        private context?: Plugin.Shared.SharedContext,
    ) {}

    // Hijack RPC requests and process them with koa like middleware
    private get hijackedRequest() {
        return <T extends unknown>(requestArguments: RequestArguments, initial?: EVM_Web3ConnectionOptions) => {
            return new Promise<T>(async (resolve, reject) => {
                const context = createContext(this, requestArguments, this.getOptions(initial))

                try {
                    await dispatch(context, async () => {
                        if (!context.writeable) return
                        try {
                            switch (context.method) {
                                case EthereumMethodType.MASK_LOGIN:
                                    context.write(
                                        await Web3StateSettings.value.Provider?.connect(
                                            context.chainId,
                                            context.providerType,
                                        ),
                                    )
                                    break
                                case EthereumMethodType.MASK_LOGOUT:
                                    context.write(
                                        await Web3StateSettings.value.Provider?.disconnect(context.providerType),
                                    )
                                    break
                                default:
                                    const web3Provider = await Providers[
                                        isReadOnlyMethod(context.method)
                                            ? ProviderType.MaskWallet
                                            : context.providerType
                                    ].createWeb3Provider({
                                        account: context.account,
                                        chainId: context.chainId,
                                    })

                                    // send request and set result in the context
                                    context.write((await web3Provider.request(context.requestArguments)) as T)
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

    private getOptions(initial?: EVM_Web3ConnectionOptions): Omit<Required<EVM_Web3ConnectionOptions>, 'overrides'> & Pick<EVM_Web3ConnectionOptions, 'overrides'> {
        return {
            account: this.account,
            chainId: this.chainId,
            providerType: this.providerType,
            ...initial,
        }
    }

    getWeb3(initial?: EVM_Web3ConnectionOptions) {
        const web3 = createWeb3(
            createWeb3Provider((requestArguments: RequestArguments) => this.hijackedRequest(requestArguments, this.getOptions(initial))),
        )
        return Promise.resolve(web3)
    }

    getWeb3Provider(initial?: EVM_Web3ConnectionOptions) {
        const web3Provider = createWeb3Provider((requestArguments: RequestArguments) =>
            this.hijackedRequest(requestArguments, this.getOptions(initial)),
        )
        return Promise.resolve(web3Provider)
    }

    async connect(initial?: EVM_Web3ConnectionOptions): Promise<Account<ChainId>> {
        return this.hijackedRequest<Account<ChainId>>(
            {
                method: EthereumMethodType.MASK_LOGIN,
                params: [],
            },
            this.getOptions(initial),
        )
    }
    async disconnect(initial?: EVM_Web3ConnectionOptions): Promise<void> {
        await this.hijackedRequest<void>(
            {
                method: EthereumMethodType.MASK_LOGOUT,
                params: [],
            },
            this.getOptions(initial),
        )
    }
    async transferFungibleToken(
        address: string,
        recipient: string,
        amount: string,
        memo?: string,
        initial?: EVM_Web3ConnectionOptions,
    ): Promise<string> {
        const options = this.getOptions(initial)
        // Native
        if (!address || isNativeTokenAddress(options.chainId, address)) {
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
                    ...options.overrides,
                },
                options,
            )
        }

        // ERC20
        const contract = await this.getERC20Contract(address, options)
        const tx = contract?.methods.transfer(recipient, toHex(amount))
        return sendTransaction(contract, tx, options.overrides)
    }
    async transferNonFungibleToken(
        address: string,
        recipient: string,
        tokenId: string,
        amount?: string,
        schema?: SchemaType,
        initial?: EVM_Web3ConnectionOptions,
    ): Promise<string> {
        const options = this.getOptions(initial)
        const actualSchema = schema ?? (await this.getSchemaType(address, options))

        // ERC1155
        if (actualSchema === SchemaType.ERC1155) {
            const contract = await this.getERC1155Contract(address, options)
            const tx = contract?.methods.safeTransferFrom(options.account, recipient, tokenId, amount ?? '', '0x')
            return sendTransaction(contract, tx, options?.overrides)
        }

        // ERC721
        const contract = await this.getERC721Contract(address, options)
        const tx = contract?.methods.transferFrom(options.account, recipient, tokenId)
        return sendTransaction(contract, tx, options?.overrides)
    }

    async getGasPrice(initial?: EVM_Web3ConnectionOptions): Promise<string> {
        return this.hijackedRequest<string>(
            {
                method: EthereumMethodType.ETH_GAS_PRICE,
            },
            this.getOptions(initial),
        )
    }
    async getSchemaType(address: string, initial?: EVM_Web3ConnectionOptions): Promise<SchemaType | undefined> {
        const options = this.getOptions(initial)
        const ERC165_INTERFACE_ID = '0x01ffc9a7'
        const ERC721_ENUMERABLE_INTERFACE_ID = '0x780e9d63'
        const ERC1155_ENUMERABLE_INTERFACE_ID = '0xd9b67a26'

        const account = options?.account ?? this.account
        const erc165Contract = await this.getWeb3Contract<ERC165>(address, ERC165ABI as AbiItem[], options)

        const isERC165 = await erc165Contract?.methods.supportsInterface(ERC165_INTERFACE_ID).call({ from: account })

        const isERC721 = await erc165Contract?.methods
            .supportsInterface(ERC721_ENUMERABLE_INTERFACE_ID)
            .call({ from: account })
        if (isERC165 && isERC721) return SchemaType.ERC721

        const isERC1155 = await erc165Contract?.methods
            .supportsInterface(ERC1155_ENUMERABLE_INTERFACE_ID)
            .call({ from: account })
        if (isERC165 && isERC1155) return SchemaType.ERC1155

        const isERC20 = (await this.getCode(address, options)) !== '0x'
        if (isERC20) return SchemaType.ERC20

        return
    }
    async getNonFungibleToken(
        address: string,
        tokenId: string,
        schema?: SchemaType,
        initial?: EVM_Web3ConnectionOptions,
    ): Promise<NonFungibleToken<ChainId, SchemaType>> {
        const options = this.getOptions(initial)
        const actualSchema = schema ?? (await this.getSchemaType(address, options))
        const allSettled = await Promise.allSettled([
            this.getNonFungibleTokenMetadata(address, tokenId, schema, options),
            this.getNonFungibleTokenContract(address, schema, options),
        ])
        const [metadata, contract] = allSettled.map((x) => (x.status === 'fulfilled' ? x.value : undefined)) as [
            NonFungibleTokenMetadata<ChainId>,
            NonFungibleTokenContract<ChainId, SchemaType>,
        ]

        let ownerId: string | undefined

        if (actualSchema !== SchemaType.ERC1155) {
            const contract = await this.getERC721Contract(address, options)
            try {
                ownerId = await contract?.methods.ownerOf(tokenId).call()
            } catch {}
        }

        return createNonFungibleToken<ChainId, SchemaType>(
            options.chainId,
            address,
            actualSchema ?? SchemaType.ERC721,
            tokenId,
            ownerId,
            metadata,
            contract,
        )
    }

    async getNonFungibleTokenOwnership(
        address: string,
        owner: string,
        tokenId: string,
        schema?: SchemaType,
        initial?: EVM_Web3ConnectionOptions,
    ) {
        const options = this.getOptions(initial)
        const actualSchema = schema ?? (await this.getSchemaType(address, options))

        // ERC1155
        if (actualSchema === SchemaType.ERC1155) {
            const contract = await this.getERC1155Contract(address, options)
            // the owner has at least 1 token
            return toNumber((await contract?.methods.balanceOf(owner, tokenId).call()) ?? 0) > 0 ?? false
        }

        // ERC721
        const contract = await this.getERC721Contract(address, options)
        return isSameAddress(await contract?.methods.ownerOf(tokenId).call(), owner)
    }
    async getNonFungibleTokenMetadata(
        address: string,
        tokenId?: string,
        schema?: SchemaType,
        initial?: EVM_Web3ConnectionOptions,
    ) {
        const processURI = (uri: string) => {
            // e.g,
            // address: 0x495f947276749ce646f68ac8c248420045cb7b5e
            // token id: 33445046430196205871873533938903624085962860434195770982901962545689408831489
            if (uri.startsWith('https://api.opensea.io/') && tokenId) return uri.replace('0x{id}', tokenId)

            // add cors header
            if (!uri.startsWith('ipfs://'))
                return urlcat('https://cors.r2d2.to/?:url', {
                    url: uri,
                })

            return uri
        }
        const options = this.getOptions(initial)
        const actualSchema = schema ?? (await this.getSchemaType(address, options))

        // ERC1155
        if (actualSchema === SchemaType.ERC1155) {
            const contract = await this.getERC1155Contract(address, options)
            const uri = await contract?.methods.uri(tokenId ?? '').call()
            if (!uri) throw new Error('Failed to read metadata uri.')

            const response = await fetchJSON<ERC1155Metadata>(processURI(uri), undefined, {
                fetch: this.context?.fetch,
            })
            return createNonFungibleTokenMetadata(
                options.chainId,
                response.name,
                '',
                response.description,
                undefined,
                resolveIPFSLinkFromURL(response.image),
                resolveIPFSLinkFromURL(response.image),
            )
        }

        // ERC721
        const contract = await this.getERC721Contract(address, options)
        const uri = await contract?.methods.tokenURI(tokenId ?? '').call()
        if (!uri) throw new Error('Failed to read metadata uri.')
        const response = await fetchJSON<ERC721Metadata>(processURI(uri), undefined, {
            fetch: this.context?.fetch,
        })
        return createNonFungibleTokenMetadata(
            options.chainId,
            response.name,
            '',
            response.description,
            undefined,
            resolveIPFSLinkFromURL(response.image),
            resolveIPFSLinkFromURL(response.image),
        )
    }
    async getNonFungibleTokenContract(
        address: string,
        schema?: SchemaType,
        initial?: EVM_Web3ConnectionOptions,
    ): Promise<NonFungibleTokenContract<ChainId, SchemaType>> {
        const options = this.getOptions(initial)
        const actualSchema = schema ?? (await this.getSchemaType(address, options))

        // ERC1155
        if (actualSchema === SchemaType.ERC1155) {
            const contractERC721 = await this.getERC721Contract(address, options)
            const results = await Promise.allSettled([
                contractERC721?.methods.name().call() ?? EMPTY_STRING,
                contractERC721?.methods.symbol().call() ?? EMPTY_STRING,
            ])

            const [name, symbol] = results.map((result) =>
                result.status === 'fulfilled' ? result.value : '',
            ) as string[]

            return createNonFungibleTokenContract(
                options.chainId,
                SchemaType.ERC1155,
                address,
                name ?? 'Unknown Token',
                symbol ?? 'UNKNOWN',
            )
        }

        // ERC721
        const contract = await this.getERC721Contract(address, options)
        const results = await Promise.allSettled([
            contract?.methods.name().call() ?? EMPTY_STRING,
            contract?.methods.symbol().call() ?? EMPTY_STRING,
        ])

        const [name, symbol] = results.map((result) => (result.status === 'fulfilled' ? result.value : '')) as string[]

        return createNonFungibleTokenContract<ChainId, SchemaType.ERC721>(
            options.chainId,
            SchemaType.ERC721,
            address,
            name ?? 'Unknown Token',
            symbol ?? 'UNKNOWN',
        )
    }
    async getNonFungibleTokenCollection(
        address: string,
        schema?: SchemaType,
        initial?: EVM_Web3ConnectionOptions,
    ): Promise<NonFungibleTokenCollection<ChainId>> {
        const options = this.getOptions(initial)
        const actualSchema = schema ?? (await this.getSchemaType(address, options))

        // ERC1155
        if (actualSchema === SchemaType.ERC1155) {
            throw new Error('Not implemented')
        }

        // ERC721
        const contract = await this.getERC721Contract(address, options)
        const results = await Promise.allSettled([contract?.methods.name().call() ?? EMPTY_STRING])
        const [name] = results.map((result) => (result.status === 'fulfilled' ? result.value : '')) as string[]
        return createNonFungibleTokenCollection(options.chainId, address, name ?? 'Unknown Token', '')
    }
    async switchChain(initial?: EVM_Web3ConnectionOptions): Promise<void> {
        const options = this.getOptions(initial)
        await Providers[options?.providerType ?? this.providerType].switchChain(options?.chainId)
    }
    async getNativeTokenBalance(initial?: EVM_Web3ConnectionOptions): Promise<string> {
        const options = this.getOptions(initial)
        if (!isValidAddress(options.account)) return '0'
        return this.getBalance(options.account, options)
    }
    async getFungibleTokenBalance(address: string, initial?: EVM_Web3ConnectionOptions): Promise<string> {
        const options = this.getOptions(initial)

        // Native
        if (!address || isNativeTokenAddress(options.chainId, address)) return this.getNativeTokenBalance(options)

        // ERC20
        const contract = await this.getERC20Contract(address, options)
        return contract?.methods.balanceOf(options.account).call() ?? '0'
    }
    async getNonFungibleTokenBalance(
        address: string,
        tokenId?: string,
        schema?: SchemaType,
        initial?: EVM_Web3ConnectionOptions,
    ): Promise<string> {
        const options = this.getOptions(initial)
        const actualSchema = schema ?? (await this.getSchemaType(address, options))

        // ERC1155
        if (actualSchema === SchemaType.ERC1155) {
            const contract = await this.getERC1155Contract(address, options)
            return contract?.methods?.balanceOf(options.account, tokenId ?? '').call() ?? '0'
        }

        // ERC721
        const contract = await this.getERC721Contract(address, options)
        return contract?.methods.balanceOf(options.account).call() ?? '0'
    }
    async getFungibleTokensBalance(
        listOfAddress: string[],
        initial?: EVM_Web3ConnectionOptions,
    ): Promise<Record<string, string>> {
        if (!listOfAddress.length) return {}

        const options = this.getOptions(initial)
        const { NATIVE_TOKEN_ADDRESS = '' } = getTokenConstants(options.chainId)
        const { BALANCE_CHECKER_ADDRESS } = getEthereumConstants(options.chainId)
        const entities: Array<[string, string]> = []

        if (listOfAddress.some(currySameAddress(NATIVE_TOKEN_ADDRESS))) {
            entities.push([NATIVE_TOKEN_ADDRESS, await this.getBalance(this.account, options)])
        }

        const listOfNonNativeAddress = listOfAddress.filter((x) => !isSameAddress(NATIVE_TOKEN_ADDRESS, x))

        if (listOfNonNativeAddress.length) {
            const contract = await this.getWeb3Contract<BalanceChecker>(
                BALANCE_CHECKER_ADDRESS ?? '',
                BalanceCheckerABI as AbiItem[],
                options,
            )
            const balances = await contract?.methods.balances([options.account], listOfNonNativeAddress).call({
                // cannot check the sender's balance in the same contract
                from: undefined,
                chainId: numberToHex(options.account),
            })

            listOfNonNativeAddress.forEach((x, i) => {
                entities.push([x, balances?.[i] ?? '0'])
            })
        }
        return Object.fromEntries(entities)
    }

    async getNonFungibleTokensBalance(
        listOfAddress: string[],
        initial?: EVM_Web3ConnectionOptions,
    ): Promise<Record<string, string>> {
        if (!listOfAddress.length) return {}

        const options = this.getOptions(initial)
        const { BALANCE_CHECKER_ADDRESS } = getEthereumConstants(this.chainId)
        const contract = await this.getWeb3Contract<BalanceChecker>(
            BALANCE_CHECKER_ADDRESS ?? '',
            BalanceCheckerABI as AbiItem[],
            options,
        )
        const result = await contract?.methods.balances([options.account], listOfAddress).call({
            // cannot check the sender's balance in the same contract
            from: undefined,
            chainId: numberToHex(options?.chainId ?? this.chainId),
        })

        if (result?.length !== listOfAddress.length) return {}
        return Object.fromEntries(listOfAddress.map<[string, string]>((x, i) => [x, result[i]]))
    }

    getNativeToken(initial?: EVM_Web3ConnectionOptions): Promise<FungibleToken<ChainId, SchemaType>> {
        const options = this.getOptions(initial)
        const token = createNativeToken(options.chainId)
        if (!token) throw new Error('Failed to create native token.')
        return Promise.resolve(token)
    }

    async getFungibleToken(
        address: string,
        initial?: EVM_Web3ConnectionOptions,
    ): Promise<FungibleToken<ChainId, SchemaType>> {
        const options = this.getOptions(initial)

        // Native
        if (!address || isNativeTokenAddress(options.chainId, address))
            return this.getNativeToken(options)

        // ERC20
        const contract = await this.getERC20Contract(address, options)
        const bytes32Contract = await this.getWeb3Contract<ERC20Bytes32>(address, ERC20Bytes32ABI as AbiItem[], options)
        const results = await Promise.allSettled([
            contract?.methods.name().call() ?? EMPTY_STRING,
            bytes32Contract?.methods.name().call() ?? EMPTY_STRING,
            contract?.methods.symbol().call() ?? EMPTY_STRING,
            bytes32Contract?.methods.symbol().call() ?? EMPTY_STRING,
            contract?.methods.decimals().call() ?? ZERO,
        ])
        const [name, nameBytes32, symbol, symbolBytes32, decimals] = results.map((result) =>
            result.status === 'fulfilled' ? result.value : '',
        ) as string[]
        return createERC20Token(
            options?.chainId ?? this.chainId,
            address,
            parseStringOrBytes32(name, nameBytes32, 'Unknown Token'),
            parseStringOrBytes32(symbol, symbolBytes32, 'UNKNOWN'),
            typeof decimals === 'string' ? Number.parseInt(decimals ? decimals : '0', 10) : decimals,
        )
    }

    async getWeb3Contract<T extends BaseContract>(
        address: string,
        ABI: AbiItem[],
        initial?: EVM_Web3ConnectionOptions,
    ) {
        const options = this.getOptions(initial)
        const web3 = await this.getWeb3(options)
        return createContract<T>(web3, address, ABI)
    }

    async getERC20Contract(address: string, initial?: EVM_Web3ConnectionOptions) {
        const options = this.getOptions(initial)
        return this.getWeb3Contract<ERC20>(address, ERC20ABI as AbiItem[], options)
    }

    async getERC721Contract(address: string, initial?: EVM_Web3ConnectionOptions) {
        const options = this.getOptions(initial)
        return this.getWeb3Contract<ERC721>(address, ERC721ABI as AbiItem[], options)
    }

    async getERC1155Contract(address: string, initial?: EVM_Web3ConnectionOptions) {
        const options = this.getOptions(initial)
        return this.getWeb3Contract<ERC1155>(address, ERC1155ABI as AbiItem[], options)
    }

    async getAccount(initial?: EVM_Web3ConnectionOptions) {
        const options = this.getOptions(initial)
        const accounts = await this.hijackedRequest<string[]>(
            {
                method: EthereumMethodType.ETH_ACCOUNTS,
            },
            options,
        )
        return first(accounts) ?? ''
    }

    async getChainId(initial?: EVM_Web3ConnectionOptions) {
        const options = this.getOptions(initial)
        const chainId = await this.hijackedRequest<string>(
            {
                method: EthereumMethodType.ETH_CHAIN_ID,
            },
            options,
        )
        return Number.parseInt(chainId, 16)
    }

    getBlock(noOrId: number | string, initial?: EVM_Web3ConnectionOptions) {
        const options = this.getOptions(initial)
        return this.hijackedRequest<Block>(
            {
                method: EthereumMethodType.ETH_GET_BLOCK_BY_NUMBER,
                params: [typeof noOrId === 'number' ? toHex(noOrId) : noOrId, false],
            },
            options,
        )
    }

    getBlockNumber(initial?: EVM_Web3ConnectionOptions) {
        const options = this.getOptions(initial)
        return this.hijackedRequest<number>(
            {
                method: EthereumMethodType.ETH_BLOCK_NUMBER,
            },
            options,
        )
    }

    async getBlockTimestamp(initial?: EVM_Web3ConnectionOptions): Promise<number> {
        const options = this.getOptions(initial)
        const blockNumber = await this.getBlockNumber(options)
        const block = await this.getBlock(blockNumber)
        return Number.parseInt(block.timestamp, 16)
    }

    getBalance(address: string, initial?: EVM_Web3ConnectionOptions) {
        const options = this.getOptions(initial)
        return this.hijackedRequest<string>(
            {
                method: EthereumMethodType.ETH_GET_BALANCE,
                params: [address, 'latest'],
            },
            options,
        )
    }

    getCode(address: string, initial?: EVM_Web3ConnectionOptions) {
        const options = this.getOptions(initial)
        return this.hijackedRequest<string>(
            {
                method: EthereumMethodType.ETH_GET_CODE,
                params: [address, 'latest'],
            },
            options,
        )
    }

    async getTransaction(hash: string, initial?: EVM_Web3ConnectionOptions) {
        const options = this.getOptions(initial)
        return this.hijackedRequest<TransactionDetailed>(
            {
                method: EthereumMethodType.ETH_GET_TRANSACTION_BY_HASH,
                params: [hash],
            },
            options,
        )
    }

    async estimateTransaction(transaction: Transaction, fallback = 21000, initial?: EVM_Web3ConnectionOptions) {
        try {
            const options = this.getOptions(initial)
            return this.hijackedRequest<string>(
                {
                    method: EthereumMethodType.ETH_ESTIMATE_GAS,
                    params: [
                        {
                            from: options.account,
                            ...transaction,
                        },
                    ],
                },
                options,
            )
        } catch {
            return toHex(fallback)
        }
    }

    getTransactionReceipt(hash: string, initial?: EVM_Web3ConnectionOptions) {
        const options = this.getOptions(initial)
        return this.hijackedRequest<TransactionReceipt | null>(
            {
                method: EthereumMethodType.ETH_GET_TRANSACTION_RECEIPT,
                params: [hash],
            },
            options,
        )
    }

    async getTransactionStatus(id: string, initial?: EVM_Web3ConnectionOptions): Promise<TransactionStatusType> {
        const options = this.getOptions(initial)
        return getReceiptStatus(await this.getTransactionReceipt(id, options))
    }

    async getTransactionNonce(address: string, initial?: EVM_Web3ConnectionOptions) {
        const options = this.getOptions(initial)
        const count = await this.hijackedRequest<string>(
            {
                method: EthereumMethodType.ETH_GET_TRANSACTION_COUNT,
                params: [address, 'latest'],
            },
            options,
        )
        return Number.parseInt(count, 16) || 0
    }

    signMessage(
        dataToSign: string,
        signType?: 'personalSign' | 'typedDataSign' | Omit<string, 'personalSign' | 'typedDataSign'>,
        initial?: EVM_Web3ConnectionOptions,
    ) {
        const options = this.getOptions(initial)
        if (!options.account) throw new Error('Unknown account.')

        switch (signType) {
            case 'personalSign':
                return this.hijackedRequest<string>(
                    {
                        method: EthereumMethodType.PERSONAL_SIGN,
                        params: [dataToSign, options.account, ''].filter((x) => typeof x !== 'undefined'),
                    },
                    options,
                )
            case 'typedDataSign':
                return this.hijackedRequest<string>(
                    {
                        method: EthereumMethodType.ETH_SIGN_TYPED_DATA,
                        params: [options.account, dataToSign],
                    },
                    options,
                )
            default:
                throw new Error(`Unknown sign type: ${signType}.`)
        }
    }

    async verifyMessage(
        dataToVerify: string,
        signature: string,
        signType?: string,
        initial?: ConnectionOptions<ChainId, ProviderType, Transaction>,
    ) {
        const options = this.getOptions(initial)
        const web3 = await this.getWeb3(options)
        const dataToSign = await web3.eth.personal.ecRecover(dataToVerify, signature)
        return dataToSign === dataToVerify
    }

    async signTransaction(transaction: Transaction, initial?: EVM_Web3ConnectionOptions) {
        const options = this.getOptions(initial)
        const signed = await this.hijackedRequest<SignedTransaction>(
            {
                method: EthereumMethodType.ETH_SIGN_TRANSACTION,
                params: [transaction],
            },
            options,
        )
        return signed.rawTransaction ?? ''
    }

    signTransactions(transactions: Transaction[], initial?: EVM_Web3ConnectionOptions) {
        return Promise.all(transactions.map((x) => this.signTransaction(x, initial)))
    }

    callTransaction(transaction: Transaction, initial?: EVM_Web3ConnectionOptions) {
        const options = this.getOptions(initial)
        return this.hijackedRequest<string>(
            {
                method: EthereumMethodType.ETH_CALL,
                params: [
                    {
                        ...transaction,
                        ...options?.overrides,
                    },
                    'latest',
                ],
            },
            options,
        )
    }
    async sendTransaction(transaction: Transaction, initial?: EVM_Web3ConnectionOptions) {
        const options = this.getOptions(initial)
        // send a transaction which will add into the internal transaction list and start to watch it for confirmation
        const hash = await this.hijackedRequest<string>(
            {
                method: EthereumMethodType.ETH_SEND_TRANSACTION,
                params: [
                    {
                        ...transaction,
                        ...options?.overrides,
                    },
                ],
            },
            options,
        )

        return new Promise<string>((resolve, reject) => {
            const { Transaction, TransactionWatcher } = Web3StateSettings.value
            if (!Transaction || !TransactionWatcher) reject(new Error('No context found.'))

            const onProgress = async (id: string, status: TransactionStatusType, transaction?: Transaction) => {
                if (status === TransactionStatusType.NOT_DEPEND) return
                const transactions = await getSubscriptionCurrentValue(() => Transaction?.transactions)
                const currentTransaction = transactions?.find((x) => {
                    const hashes = Object.keys(x.candidates)
                    return hashes.includes(hash) && hashes.includes(id)
                })
                if (currentTransaction) resolve(currentTransaction.indexId)
            }
            TransactionWatcher?.emitter.on('progress', onProgress)
        })
    }

    sendSignedTransaction(signature: string, initial?: EVM_Web3ConnectionOptions) {
        const options = this.getOptions(initial)
        return this.hijackedRequest<string>(
            {
                method: EthereumMethodType.ETH_SEND_RAW_TRANSACTION,
                params: [signature],
            },
            options,
        )
    }

    replaceRequest(hash: string, transaction: Transaction, initial?: EVM_Web3ConnectionOptions) {
        const options = this.getOptions(initial)
        return this.hijackedRequest<void>(
            {
                method: EthereumMethodType.MASK_REPLACE_TRANSACTION,
                params: [hash, transaction],
            },
            options,
        )
    }

    cancelRequest(hash: string, transaction: Transaction, initial?: EVM_Web3ConnectionOptions) {
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
    context?: Plugin.Shared.SharedContext,
    options?: {
        chainId?: ChainId
        account?: string
        providerType?: ProviderType
    },
) {
    const { chainId = ChainId.Mainnet, account = '', providerType = ProviderType.MaskWallet } = options ?? {}

    return new Connection(chainId, account, providerType, context)
}
