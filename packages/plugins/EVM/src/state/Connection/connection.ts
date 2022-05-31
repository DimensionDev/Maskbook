import { first } from 'lodash-unified'
import Web3 from 'web3'
import { AbiItem, numberToHex, toHex } from 'web3-utils'
import type { RequestArguments, SignedTransaction, TransactionReceipt } from 'web3-core'
import type { ERC20 } from '@masknet/web3-contracts/types/ERC20'
import type { ERC20Bytes32 } from '@masknet/web3-contracts/types/ERC20Bytes32'
import type { ERC165 } from '@masknet/web3-contracts/types/ERC165'
import type { ERC721 } from '@masknet/web3-contracts/types/ERC721'
import type { BalanceChecker } from '@masknet/web3-contracts/types/BalanceChecker'
import ERC20ABI from '@masknet/web3-contracts/abis/ERC20.json'
import ERC20Bytes32ABI from '@masknet/web3-contracts/abis/ERC20Bytes32.json'
import ERC721ABI from '@masknet/web3-contracts/abis/ERC721.json'
import BalanceCheckerABI from '@masknet/web3-contracts/abis/BalanceChecker.json'
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
    createERC721Token,
    createERC721Contract,
    createERC721Metadata,
    createERC721Collection,
    createWeb3Provider,
    getEthereumConstants,
} from '@masknet/web3-shared-evm'
import {
    Account,
    ConnectionOptions,
    FungibleToken,
    isSameAddress,
    NonFungibleToken,
    NonFungibleTokenCollection,
    NonFungibleTokenContract,
    TransactionStatusType,
} from '@masknet/web3-shared-base'
import { createContext, dispatch } from './composer'
import { Providers } from './provider'
import type { EVM_Connection, EVM_Web3ConnectionOptions } from './types'
import { getReceiptStatus } from './utils'
import { Web3StateSettings } from '../../settings'
import type { BaseContract } from '@masknet/web3-contracts/types/types'

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

class Connection implements EVM_Connection {
    constructor(private chainId: ChainId, private account: string, private providerType: ProviderType) {}

    // Hijack RPC requests and process them with koa like middleware
    private get hijackedRequest() {
        return <T extends unknown>(requestArguments: RequestArguments, options?: EVM_Web3ConnectionOptions) => {
            return new Promise<T>(async (resolve, reject) => {
                const context = createContext(this, requestArguments, {
                    account: this.account,
                    chainId: this.chainId,
                    providerType: this.providerType,
                    popupsWindow: true,
                    ...options,
                })

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
                                            options?.popupsWindow,
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
                                        isReadOnlyMethod(context.method) ? ProviderType.MaskWallet : this.providerType
                                    ].createWeb3Provider(this.chainId)

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

    getWeb3(options?: EVM_Web3ConnectionOptions) {
        const web3 = new Web3(
            createWeb3Provider((requestArguments: RequestArguments) => this.hijackedRequest(requestArguments, options)),
        )
        return Promise.resolve(web3)
    }

    getWeb3Provider(options?: EVM_Web3ConnectionOptions) {
        const web3Provider = createWeb3Provider((requestArguments: RequestArguments) =>
            this.hijackedRequest(requestArguments, options),
        )
        return Promise.resolve(web3Provider)
    }

    async connect(options?: EVM_Web3ConnectionOptions): Promise<Account<ChainId>> {
        return this.hijackedRequest<Account<ChainId>>(
            {
                method: EthereumMethodType.MASK_LOGIN,
                params: [],
            },
            options,
        )
    }
    async disconnect(options?: EVM_Web3ConnectionOptions): Promise<void> {
        await this.hijackedRequest<void>(
            {
                method: EthereumMethodType.MASK_LOGOUT,
                params: [],
            },
            options,
        )
    }
    async transferFungibleToken(
        address: string,
        recipient: string,
        amount: string,
        memo?: string,
        options?: EVM_Web3ConnectionOptions,
    ): Promise<string> {
        // Native
        if (!address || isNativeTokenAddress(this.chainId, address)) {
            const tx = {
                from: this.account,
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
        const contract = await this.getWeb3Contract<ERC20>(address, ERC20ABI as AbiItem[], options)
        const tx = contract?.methods.transfer(recipient, toHex(amount))
        return sendTransaction(contract, tx)
    }
    async transferNonFungibleToken(
        address: string,
        recipient: string,
        tokenId: string,
        amount: string,
        options?: EVM_Web3ConnectionOptions,
    ): Promise<string> {
        // ERC721
        const contract = await this.getWeb3Contract<ERC721>(address, ERC721ABI as AbiItem[], options)
        const tx = contract?.methods.transferFrom(this.account, recipient, tokenId)
        return sendTransaction(contract, tx)
    }

    async getGasPrice(options?: EVM_Web3ConnectionOptions): Promise<string> {
        return this.hijackedRequest<string>(
            {
                method: EthereumMethodType.ETH_GAS_PRICE,
            },
            options,
        )
    }
    async getSchemaType(address: string, options?: EVM_Web3ConnectionOptions): Promise<SchemaType | undefined> {
        const ERC165_INTERFACE_ID = '0x01ffc9a7'
        const ERC721_ENUMERABLE_INTERFACE_ID = '0x780e9d63'
        const ERC1155_ENUMERABLE_INTERFACE_ID = '0xd9b67a26'

        const erc165Contract = await this.getWeb3Contract<ERC165>(address, ERC20ABI as AbiItem[], options)

        const isERC165 = await erc165Contract?.methods
            .supportsInterface(ERC165_INTERFACE_ID)
            .call({ from: this.account })

        const isERC721 = await erc165Contract?.methods
            .supportsInterface(ERC721_ENUMERABLE_INTERFACE_ID)
            .call({ from: this.account })
        if (isERC165 && isERC721) return SchemaType.ERC721

        const isERC1155 = await erc165Contract?.methods
            .supportsInterface(ERC1155_ENUMERABLE_INTERFACE_ID)
            .call({ from: this.account })
        if (isERC165 && isERC1155) return SchemaType.ERC1155

        const isERC20 = (await this.getCode(address, options)) !== '0x'
        if (isERC20) return SchemaType.ERC20

        return
    }
    async getNonFungibleTokenContract(
        address: string,
        id: string,
        options?: EVM_Web3ConnectionOptions,
    ): Promise<NonFungibleTokenContract<ChainId, SchemaType>> {
        // ERC721
        const contract = await this.getWeb3Contract<ERC721>(address, ERC721ABI as AbiItem[], options)
        const results = await Promise.allSettled([
            contract?.methods.name().call() ?? EMPTY_STRING,
            contract?.methods.symbol().call() ?? EMPTY_STRING,
            contract?.methods.ownerOf(id).call() ?? EMPTY_STRING,
            contract?.methods.balanceOf(address).call() ?? EMPTY_STRING,
        ])
        const [name, symbol, owner, balance] = results.map((result) =>
            result.status === 'fulfilled' ? result.value : '',
        ) as string[]
        return createERC721Contract(
            this.chainId,
            address,
            name ?? 'Unknown Token',
            symbol ?? 'UNKNOWN',
            owner,
            balance as unknown as number,
        )
    }
    async getNonFungibleTokenCollection(
        address: string,
        options?: EVM_Web3ConnectionOptions,
    ): Promise<NonFungibleTokenCollection<ChainId>> {
        // ERC721
        const contract = await this.getWeb3Contract<ERC721>(address, ERC721ABI as AbiItem[], options)
        const results = await Promise.allSettled([contract?.methods.name().call() ?? EMPTY_STRING])
        const [name] = results.map((result) => (result.status === 'fulfilled' ? result.value : '')) as string[]
        return createERC721Collection(this.chainId, address, name ?? 'Unknown Token', '')
    }
    async switchChain(options?: EVM_Web3ConnectionOptions): Promise<void> {
        throw new Error('Method not implemented.')
    }

    getNativeTokenBalance(options?: EVM_Web3ConnectionOptions): Promise<string> {
        return this.getBalance(this.account, options)
    }
    async getFungibleTokenBalance(address: string, options?: EVM_Web3ConnectionOptions): Promise<string> {
        // Native
        if (!address || isNativeTokenAddress(this.chainId, address)) return this.getNativeTokenBalance(options)

        // ERC20
        const contract = await this.getWeb3Contract<ERC20>(address, ERC20ABI as AbiItem[], options)
        return contract?.methods.balanceOf(this.account).call() ?? '0'
    }
    async getNonFungibleTokenBalance(address: string, options?: EVM_Web3ConnectionOptions): Promise<string> {
        const contract = await this.getWeb3Contract<ERC721>(address, ERC721ABI as AbiItem[], options)
        return contract?.methods.balanceOf(this.account).call() ?? '0'
    }

    async getFungibleTokensBalance(
        listOfAddress: string[],
        options?: EVM_Web3ConnectionOptions,
    ): Promise<Record<string, string>> {
        if (!listOfAddress.length) return {}

        const { BALANCE_CHECKER_ADDRESS } = getEthereumConstants(this.chainId)
        const contract = await this.getWeb3Contract<BalanceChecker>(
            BALANCE_CHECKER_ADDRESS ?? '',
            BalanceCheckerABI as AbiItem[],
            options,
        )
        const result = await contract?.methods.balances([this.account], listOfAddress).call({
            // cannot check the sender's balance in the same contract
            from: undefined,
            chainId: numberToHex(options?.chainId ?? this.chainId),
        })

        if (result?.length !== listOfAddress.length) return {}
        return Object.fromEntries(listOfAddress.map<[string, string]>((x, i) => [x, result[i]]))
    }

    async getNonFungibleTokensBalance(
        listOfAddress: string[],
        options?: EVM_Web3ConnectionOptions,
    ): Promise<Record<string, string>> {
        if (!listOfAddress.length) return {}

        const { BALANCE_CHECKER_ADDRESS } = getEthereumConstants(this.chainId)
        const contract = await this.getWeb3Contract<BalanceChecker>(
            BALANCE_CHECKER_ADDRESS ?? '',
            BalanceCheckerABI as AbiItem[],
            options,
        )
        const result = await contract?.methods.balances([this.account], listOfAddress).call({
            // cannot check the sender's balance in the same contract
            from: undefined,
            chainId: numberToHex(options?.chainId ?? this.chainId),
        })

        if (result?.length !== listOfAddress.length) return {}
        return Object.fromEntries(listOfAddress.map<[string, string]>((x, i) => [x, result[i]]))
    }

    getNativeToken(options?: EVM_Web3ConnectionOptions): Promise<FungibleToken<ChainId, SchemaType>> {
        const token = createNativeToken(options?.chainId ?? this.chainId)
        if (!token) throw new Error('Failed to create native token.')
        return Promise.resolve(token)
    }

    async getFungibleToken(
        address: string,
        options?: EVM_Web3ConnectionOptions,
    ): Promise<FungibleToken<ChainId, SchemaType>> {
        // Native
        if (!address || isNativeTokenAddress(this.chainId, address)) return this.getNativeToken(options)

        // ERC20
        const contract = await this.getWeb3Contract<ERC20>(address, ERC20ABI as AbiItem[], options)
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
            this.chainId,
            address,
            parseStringOrBytes32(name, nameBytes32, 'Unknown Token'),
            parseStringOrBytes32(symbol, symbolBytes32, 'UNKNOWN'),
            typeof decimals === 'string' ? Number.parseInt(decimals ? decimals : '0', 10) : decimals,
        )
    }

    async getNonFungibleToken(
        address: string,
        id: string,
        options?: EVM_Web3ConnectionOptions,
    ): Promise<NonFungibleToken<ChainId, SchemaType>> {
        // ERC721
        const contract = await this.getWeb3Contract<ERC721>(address, ERC721ABI as AbiItem[], options)
        const results = await Promise.allSettled([
            contract?.methods.name().call() ?? EMPTY_STRING,
            contract?.methods.symbol().call() ?? EMPTY_STRING,
            contract?.methods.ownerOf(id).call() ?? EMPTY_STRING,
            contract?.methods.balanceOf(address).call() ?? EMPTY_STRING,
        ])
        const [name, symbol, owner, balance] = results.map((result) =>
            result.status === 'fulfilled' ? result.value : '',
        ) as string[]
        return createERC721Token(
            this.chainId,
            address,
            id,
            createERC721Metadata(this.chainId, name ?? 'Unknown Token', symbol ?? 'UNKNOWN'),
            createERC721Contract(
                this.chainId,
                address,
                name ?? 'Unknown Token',
                symbol ?? 'UNKNOWN',
                owner,
                balance as unknown as number,
            ),
            createERC721Collection(this.chainId, name ?? 'Unknown Token', ''),
        )
    }

    async getWeb3Contract<T extends BaseContract>(
        address: string,
        ABI: AbiItem[],
        options?: EVM_Web3ConnectionOptions,
    ) {
        const web3 = await this.getWeb3(options)
        return createContract<T>(web3, address, ABI)
    }

    async getAccount(options?: EVM_Web3ConnectionOptions) {
        const accounts = await this.hijackedRequest<string[]>(
            {
                method: EthereumMethodType.ETH_ACCOUNTS,
            },
            options,
        )
        return first(accounts) ?? ''
    }

    async getChainId(options?: EVM_Web3ConnectionOptions) {
        const chainId = await this.hijackedRequest<string>(
            {
                method: EthereumMethodType.ETH_CHAIN_ID,
            },
            options,
        )
        return Number.parseInt(chainId, 16)
    }

    getBlock(noOrId: number | string, options?: EVM_Web3ConnectionOptions) {
        return this.hijackedRequest<Block>(
            {
                method: EthereumMethodType.ETH_GET_BLOCK_BY_NUMBER,
                params: [typeof noOrId === 'number' ? toHex(noOrId) : noOrId, false],
            },
            options,
        )
    }

    getBlockNumber(options?: EVM_Web3ConnectionOptions) {
        return this.hijackedRequest<number>(
            {
                method: EthereumMethodType.ETH_BLOCK_NUMBER,
            },
            options,
        )
    }

    async getBlockTimestamp(options?: EVM_Web3ConnectionOptions): Promise<number> {
        const blockNumber = await this.getBlockNumber(options)
        const block = await this.getBlock(blockNumber)
        return Number.parseInt(block.timestamp, 16)
    }

    getBalance(address: string, options?: EVM_Web3ConnectionOptions) {
        return this.hijackedRequest<string>(
            {
                method: EthereumMethodType.ETH_GET_BALANCE,
                params: [address, 'latest'],
            },
            options,
        )
    }

    getCode(address: string, options?: EVM_Web3ConnectionOptions) {
        return this.hijackedRequest<string>(
            {
                method: EthereumMethodType.ETH_GET_CODE,
                params: [address, 'latest'],
            },
            options,
        )
    }

    async getTransaction(hash: string, options?: EVM_Web3ConnectionOptions) {
        return this.hijackedRequest<TransactionDetailed>(
            {
                method: EthereumMethodType.ETH_GET_TRANSACTION_BY_HASH,
                params: [hash],
            },
            options,
        )
    }

    async estimateTransaction(transaction: Transaction, fallback = 21000, options?: EVM_Web3ConnectionOptions) {
        try {
            return this.hijackedRequest<string>(
                {
                    method: EthereumMethodType.ETH_ESTIMATE_GAS,
                    params: [
                        {
                            from: this.account,
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

    getTransactionReceipt(hash: string, options?: EVM_Web3ConnectionOptions) {
        return this.hijackedRequest<TransactionReceipt | null>(
            {
                method: EthereumMethodType.ETH_GET_TRANSACTION_RECEIPT,
                params: [hash],
            },
            options,
        )
    }

    async getTransactionStatus(id: string, options?: EVM_Web3ConnectionOptions): Promise<TransactionStatusType> {
        return getReceiptStatus(await this.getTransactionReceipt(id, options))
    }

    async getTransactionNonce(address: string, options?: EVM_Web3ConnectionOptions) {
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
        signType?: 'personaSign' | 'typedDataSign' | Omit<string, 'personaSign' | 'typedDataSign'>,
        options?: EVM_Web3ConnectionOptions,
    ) {
        if (!options?.account) throw new Error('Unknown account.')

        switch (signType) {
            case 'personaSign':
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
        options?: ConnectionOptions<ChainId, ProviderType, Transaction>,
    ) {
        const web3 = await this.getWeb3(options)
        const dataToSign = await web3.eth.personal.ecRecover(dataToVerify, signature)
        return dataToSign === dataToVerify
    }

    async signTransaction(transaction: Transaction, options?: EVM_Web3ConnectionOptions) {
        const signed = await this.hijackedRequest<SignedTransaction>(
            {
                method: EthereumMethodType.ETH_SIGN_TRANSACTION,
                params: [transaction],
            },
            options,
        )
        return signed.rawTransaction ?? ''
    }

    signTransactions(transactions: Transaction[], options?: EVM_Web3ConnectionOptions) {
        return Promise.all(transactions.map((x) => this.signTransaction(x)))
    }

    callTransaction(transaction: Transaction, options?: EVM_Web3ConnectionOptions) {
        return this.hijackedRequest<string>(
            {
                method: EthereumMethodType.ETH_CALL,
                params: [transaction, 'latest'],
            },
            options,
        )
    }
    sendTransaction(transaction: Transaction, options?: EVM_Web3ConnectionOptions) {
        return this.hijackedRequest<string>(
            {
                method: EthereumMethodType.ETH_SEND_TRANSACTION,
                params: [transaction],
            },
            options,
        )
    }

    sendSignedTransaction(signature: string, options?: EVM_Web3ConnectionOptions) {
        return this.hijackedRequest<string>(
            {
                method: EthereumMethodType.ETH_SEND_RAW_TRANSACTION,
                params: [signature],
            },
            options,
        )
    }

    replaceRequest(hash: string, transaction: Transaction, options?: EVM_Web3ConnectionOptions) {
        return this.hijackedRequest<void>(
            {
                method: EthereumMethodType.MASK_REPLACE_TRANSACTION,
                params: [hash, transaction],
            },
            options,
        )
    }

    cancelRequest(hash: string, transaction: Transaction, options?: EVM_Web3ConnectionOptions) {
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
export function createConnection(chainId = ChainId.Mainnet, account = '', providerType = ProviderType.MaskWallet) {
    return new Connection(chainId, account, providerType)
}
