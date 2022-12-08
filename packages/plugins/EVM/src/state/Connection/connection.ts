import { first } from 'lodash-es'
import { AbiItem, numberToHex, toHex, toNumber } from 'web3-utils'
import type { RequestArguments, SignedTransaction, TransactionReceipt } from 'web3-core'
import { delay } from '@masknet/kit'
import type { Plugin } from '@masknet/plugin-infra'
import { getSubscriptionCurrentValue, PartialRequired } from '@masknet/shared-base'
import type { ERC20 } from '@masknet/web3-contracts/types/ERC20.js'
import type { ERC20Bytes32 } from '@masknet/web3-contracts/types/ERC20Bytes32.js'
import type { ERC165 } from '@masknet/web3-contracts/types/ERC165.js'
import type { ERC721 } from '@masknet/web3-contracts/types/ERC721.js'
import type { ERC1155 } from '@masknet/web3-contracts/types/ERC1155.js'
import type { BalanceChecker } from '@masknet/web3-contracts/types/BalanceChecker.js'
import ERC20ABI from '@masknet/web3-contracts/abis/ERC20.json'
import ERC165ABI from '@masknet/web3-contracts/abis/ERC165.json'
import ERC20Bytes32ABI from '@masknet/web3-contracts/abis/ERC20Bytes32.json'
import ERC721ABI from '@masknet/web3-contracts/abis/ERC721.json'
import ERC1155ABI from '@masknet/web3-contracts/abis/ERC1155.json'
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
    getTokenConstant,
    createERC20Token,
    parseStringOrBytes32,
    createWeb3,
    createWeb3Provider,
    getEthereumConstant,
    isValidAddress,
    isNativeTokenAddress,
    UserOperation,
    AddressType,
    ContractTransaction,
    AccountTransaction,
    PayloadEditor,
} from '@masknet/web3-shared-evm'
import {
    Account,
    ConnectionOptions,
    createNonFungibleToken,
    createNonFungibleTokenCollection,
    createNonFungibleTokenContract,
    createNonFungibleTokenMetadata,
    FungibleToken,
    isSameAddress,
    NonFungibleToken,
    NonFungibleCollection,
    NonFungibleTokenContract,
    NonFungibleTokenMetadata,
    TransactionStatusType,
    resolveIPFS_URL,
    resolveCrossOriginURL,
} from '@masknet/web3-shared-base'
import { fetchJSON } from '@masknet/web3-providers/helpers'
import type { BaseContract } from '@masknet/web3-contracts/types/types.js'
import { createContext, dispatch } from './composer.js'
import { Providers } from './provider.js'
import type { ERC1155Metadata, ERC721Metadata, EVM_Connection, EVM_Web3ConnectionOptions } from './types.js'
import { getReceiptStatus } from './utils.js'
import { Web3StateSettings } from '../../settings/index.js'

const EMPTY_STRING = Promise.resolve('')
const ZERO = Promise.resolve(0)

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
        return <T extends unknown>(requestArguments: RequestArguments, initial?: EVM_Web3ConnectionOptions) => {
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
                                            options.chainId,
                                            options.providerType,
                                            options.account,
                                        ),
                                    )
                                    break
                                case EthereumMethodType.MASK_LOGOUT:
                                    context.write(await this.Provider?.disconnect(options.providerType))
                                    break
                                case EthereumMethodType.ETH_SUPPORTED_ENTRY_POINTS:
                                case EthereumMethodType.SC_WALLET_DEPLOY:
                                    break
                                default: {
                                    const provider =
                                        Providers[
                                            PayloadEditor.fromPayload(context.request).readonly
                                                ? ProviderType.MaskWallet
                                                : options.providerType
                                        ]

                                    if (context.method === EthereumMethodType.ETH_SEND_TRANSACTION) {
                                        if (options.providerType === ProviderType.MaskWallet) {
                                            await provider.switchChain(options.chainId)
                                            // the settings stay in the background, other pages need a delay to sync
                                            await delay(1500)
                                        }
                                        // make sure that the provider is connected before sending the transaction
                                        await this.Provider?.connect(options.chainId, options.providerType)
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
        initial?: EVM_Web3ConnectionOptions,
        overrides?: Partial<EVM_Web3ConnectionOptions>,
    ): PartialRequired<EVM_Web3ConnectionOptions, 'account' | 'chainId' | 'providerType'> {
        return {
            account: this.account,
            chainId: this.chainId,
            providerType: this.providerType,
            ...initial,
            overrides: {
                from: this.account,
                chainId: this.chainId,
                ...initial?.overrides,
                ...overrides?.overrides,
            },
        }
    }

    getWeb3(initial?: EVM_Web3ConnectionOptions) {
        return createWeb3(
            createWeb3Provider((requestArguments: RequestArguments) =>
                this.hijackedRequest(requestArguments, this.getOptions(initial)),
            ),
        )
    }

    getWeb3Provider(initial?: EVM_Web3ConnectionOptions) {
        return createWeb3Provider((requestArguments: RequestArguments) =>
            this.hijackedRequest(requestArguments, this.getOptions(initial)),
        )
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
    async approveFungibleToken(
        address: string,
        recipient: string,
        amount: string,
        initial?: EVM_Web3ConnectionOptions,
    ): Promise<string> {
        const options = this.getOptions(initial)

        // Native
        if (!address || isNativeTokenAddress(address)) throw new Error('Invalid token address.')

        // ERC20
        return new ContractTransaction(await this.getERC20Contract(address, options)).send(
            (x) => x?.methods.approve(recipient, toHex(amount)),
            options.overrides,
        )
    }
    async approveNonFungibleToken(
        address: string,
        recipient: string,
        tokenId: string,
        schema: SchemaType,
        initial?: EVM_Web3ConnectionOptions,
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
        initial?: EVM_Web3ConnectionOptions,
    ): Promise<string> {
        const options = this.getOptions(initial)

        // Native
        if (!address || isNativeTokenAddress(address)) throw new Error('Invalid token address.')

        // ERC721 & ERC1155
        return new ContractTransaction(await this.getERC721Contract(address, options)).send(
            (x) => x?.methods.setApprovalForAll(recipient, approved),
            options.overrides,
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
        return new ContractTransaction(await this.getERC20Contract(address, options)).send(
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
        initial?: EVM_Web3ConnectionOptions,
    ): Promise<string> {
        const options = this.getOptions(initial)
        const actualSchema = schema ?? (await this.getSchemaType(address, options))

        // ERC1155
        if (actualSchema === SchemaType.ERC1155) {
            return new ContractTransaction(await this.getERC1155Contract(address, options)).send(
                (x) => x?.methods.safeTransferFrom(options.account, recipient, tokenId, amount ?? '', '0x'),
                options.overrides,
            )
        }

        // ERC721
        return new ContractTransaction(await this.getERC721Contract(address, options)).send(
            (x) => x?.methods.transferFrom(options.account, recipient, tokenId),
            options.overrides,
        )
    }

    async getGasPrice(initial?: EVM_Web3ConnectionOptions): Promise<string> {
        return this.hijackedRequest<string>(
            {
                method: EthereumMethodType.ETH_GAS_PRICE,
            },
            this.getOptions(initial),
        )
    }
    async getAddressType(address: string, initial?: EVM_Web3ConnectionOptions): Promise<AddressType | undefined> {
        if (!isValidAddress(address)) return
        const code = await this.getCode(address, initial)
        return code === '0x' ? AddressType.ExternalOwned : AddressType.Contract
    }
    async getSchemaType(address: string, initial?: EVM_Web3ConnectionOptions): Promise<SchemaType | undefined> {
        const options = this.getOptions(initial)
        const ERC165_INTERFACE_ID = '0x01ffc9a7'
        const EIP5516_INTERFACE_ID = '0x8314f22b'
        const EIP5192_INTERFACE_ID = '0xb45a3c0e'
        const ERC721_INTERFACE_ID = '0x80ac58cd'
        const ERC1155_INTERFACE_ID = '0xd9b67a26'

        try {
            const erc165Contract = await this.getWeb3Contract<ERC165>(address, ERC165ABI as AbiItem[], options)

            const [isERC165, isERC721] = await Promise.all([
                erc165Contract?.methods.supportsInterface(ERC165_INTERFACE_ID).call({ from: options.account }),
                erc165Contract?.methods.supportsInterface(ERC721_INTERFACE_ID).call({ from: options.account }),
            ])

            if (isERC165 && isERC721) return SchemaType.ERC721

            const isERC1155 = await erc165Contract?.methods
                .supportsInterface(ERC1155_INTERFACE_ID)
                .call({ from: options.account })
            if (isERC165 && isERC1155) return SchemaType.ERC1155

            const [isEIP5516, isEIP5192] = await Promise.all([
                erc165Contract?.methods.supportsInterface(EIP5516_INTERFACE_ID).call({ from: options.account }),
                erc165Contract?.methods.supportsInterface(EIP5192_INTERFACE_ID).call({ from: options.account }),
            ])

            if (isEIP5516 || isEIP5192) return SchemaType.SBT

            const isERC20 = (await this.getCode(address, options)) !== '0x'
            if (isERC20) return SchemaType.ERC20

            return
        } catch {
            return
        }
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

    async getNonFungibleTokenOwner(
        address: string,
        tokenId: string,
        schema?: SchemaType,
        initial?: EVM_Web3ConnectionOptions,
    ) {
        const options = this.getOptions(initial)
        const actualSchema = schema ?? (await this.getSchemaType(address, options))

        // ERC1155
        if (actualSchema === SchemaType.ERC1155) return ''

        // ERC721
        const contract = await this.getERC721Contract(address, options)
        return (await contract?.methods.ownerOf(tokenId).call()) ?? ''
    }

    async getNonFungibleTokenOwnership(
        address: string,
        tokenId: string,
        owner: string,
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
            if (!uri.startsWith('ipfs://')) return resolveCrossOriginURL(resolveIPFS_URL(uri))!

            return uri
        }
        const options = this.getOptions(initial)
        const actualSchema = schema ?? (await this.getSchemaType(address, options))

        // ERC1155
        if (actualSchema === SchemaType.ERC1155) {
            const contract = await this.getERC1155Contract(address, options)
            const uri = await contract?.methods.uri(tokenId ?? '').call()
            if (!uri) throw new Error('Failed to read metadata uri.')

            const response = await fetchJSON<ERC1155Metadata>(processURI(uri))
            return createNonFungibleTokenMetadata(
                options.chainId,
                response.name,
                '',
                response.description,
                undefined,
                resolveIPFS_URL(response.image),
                resolveIPFS_URL(response.image),
            )
        }

        // ERC721
        const contract = await this.getERC721Contract(address, options)
        const uri = await contract?.methods.tokenURI(tokenId ?? '').call()
        if (!uri) throw new Error('Failed to read metadata uri.')
        const response = await fetchJSON<ERC721Metadata>(processURI(uri))
        return createNonFungibleTokenMetadata(
            options.chainId,
            response.name,
            '',
            response.description,
            undefined,
            resolveIPFS_URL(response.image),
            resolveIPFS_URL(response.image),
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
    ): Promise<NonFungibleCollection<ChainId, SchemaType>> {
        const options = this.getOptions(initial)
        const actualSchema = schema ?? (await this.getSchemaType(address, options))

        // ERC1155
        if (actualSchema === SchemaType.ERC1155) {
            throw new Error('Not implemented yet.')
        }

        // ERC721
        const contract = await this.getERC721Contract(address, options)
        const results = await Promise.allSettled([contract?.methods.name().call() ?? EMPTY_STRING])
        const [name] = results.map((result) => (result.status === 'fulfilled' ? result.value : '')) as string[]
        return createNonFungibleTokenCollection(options.chainId, address, name ?? 'Unknown Token', '')
    }
    async switchChain(chainId: ChainId, initial?: EVM_Web3ConnectionOptions): Promise<void> {
        const options = this.getOptions(initial)
        await Providers[options.providerType].switchChain(chainId)
    }
    async getNativeTokenBalance(initial?: EVM_Web3ConnectionOptions): Promise<string> {
        const options = this.getOptions(initial)
        if (!isValidAddress(options.account)) return '0'
        return this.getBalance(options.account, options)
    }
    async getFungibleTokenBalance(address: string, initial?: EVM_Web3ConnectionOptions): Promise<string> {
        const options = this.getOptions(initial)

        // Native
        if (!address || isNativeTokenAddress(address)) return this.getNativeTokenBalance(options)

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
        const NATIVE_TOKEN_ADDRESS = getTokenConstant(options.chainId, 'NATIVE_TOKEN_ADDRESS')
        const BALANCE_CHECKER_ADDRESS = getEthereumConstant(options.chainId, 'BALANCE_CHECKER_ADDRESS')
        const entities: Array<[string, string]> = []

        if (listOfAddress.some(isNativeTokenAddress)) {
            entities.push([NATIVE_TOKEN_ADDRESS ?? '', await this.getBalance(options.account, options)])
        }

        const listOfNonNativeAddress = listOfAddress.filter((x) => !isNativeTokenAddress(x))

        if (listOfNonNativeAddress.length) {
            const contract = await this.getWeb3Contract<BalanceChecker>(
                BALANCE_CHECKER_ADDRESS ?? '',
                BalanceCheckerABI as AbiItem[],
                options,
            )
            const balances = await contract?.methods.balances([options.account], listOfNonNativeAddress).call({
                // cannot check the sender's balance in the same contract
                from: undefined,
                chainId: numberToHex(options.chainId),
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
        const BALANCE_CHECKER_ADDRESS = getEthereumConstant(options.chainId, 'BALANCE_CHECKER_ADDRESS')
        const contract = await this.getWeb3Contract<BalanceChecker>(
            BALANCE_CHECKER_ADDRESS ?? '',
            BalanceCheckerABI as AbiItem[],
            options,
        )
        const result = await contract?.methods.balances([options.account], listOfAddress).call({
            // cannot check the sender's balance in the same contract
            from: undefined,
            chainId: numberToHex(options.chainId),
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
        if (!address || isNativeTokenAddress(address)) return this.getNativeToken(options)

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
            options.chainId,
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
                            value: transaction.value ? toHex(transaction.value) : undefined,
                            // rpc hack, alchemy rpc must pass gas parameter
                            gas: options.chainId === ChainId.Astar ? '0x135168' : undefined,
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

    async transferContractWallet(
        recipient: string,
        initial?: ConnectionOptions<ChainId, ProviderType, Transaction> | undefined,
    ) {
        const options = this.getOptions(initial)
        return this.hijackedRequest<string>(
            {
                method: EthereumMethodType.SC_WALLET_CHANGE_OWNER,
                params: [recipient],
            },
            options,
        )
    }

    async deployContractWallet(
        owner: string,
        initial?: ConnectionOptions<ChainId, ProviderType, Transaction> | undefined,
    ) {
        const options = this.getOptions(initial)
        return this.hijackedRequest<string>(
            {
                method: EthereumMethodType.SC_WALLET_DEPLOY,
                params: [owner],
            },
            options,
        )
    }

    callTransaction(transaction: Transaction, initial?: EVM_Web3ConnectionOptions) {
        const options = this.getOptions(initial)
        return this.hijackedRequest<string>(
            {
                method: EthereumMethodType.ETH_CALL,
                params: [new AccountTransaction(transaction).fill(options.overrides), 'latest'],
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
                params: [new AccountTransaction(transaction).fill(options.overrides)],
            },
            options,
        )

        return new Promise<string>((resolve, reject) => {
            if (!this.Transaction || !this.TransactionWatcher) reject(new Error('No context found.'))

            const onProgress = async (id: string, status: TransactionStatusType, transaction?: Transaction) => {
                if (status === TransactionStatusType.NOT_DEPEND) return
                const transactions = await getSubscriptionCurrentValue(() => this.Transaction?.transactions)
                const currentTransaction = transactions?.find((x) => {
                    const hashes = Object.keys(x.candidates)
                    return hashes.includes(hash) && hashes.includes(id)
                })
                if (currentTransaction) resolve(currentTransaction.indexId)
            }
            this.TransactionWatcher?.emitter.on('progress', onProgress)
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

    replaceTransaction(hash: string, transaction: Transaction, initial?: EVM_Web3ConnectionOptions) {
        const options = this.getOptions(initial)
        return this.hijackedRequest<void>(
            {
                method: EthereumMethodType.MASK_REPLACE_TRANSACTION,
                params: [hash, transaction],
            },
            options,
        )
    }

    cancelTransaction(hash: string, transaction: Transaction, initial?: EVM_Web3ConnectionOptions) {
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
