import { first, omit, toNumber } from 'lodash-es'
import * as web3_utils from /* webpackDefer: true */ 'web3-utils'
import type { Account, ECKeyIdentifier, Proof, UpdatableWallet, Wallet } from '@masknet/shared-base'
import {
    AddressType,
    SchemaType,
    type ChainId,
    type Transaction,
    type TransactionDetailed,
    type TransactionReceipt,
    type Block,
    EthereumMethodType,
    AccountTransaction,
    isNativeTokenAddress,
    type TransactionSignature,
    type ProviderType,
    type Signature,
    type UserOperation,
    type Web3,
    isValidAddress,
    isEmptyHex,
    getTransactionStatusType,
    parseStringOrBytes32,
    createERC20Token,
    isCryptoPunksContractAddress,
    getEthereumConstant,
    getTokenConstant,
    createAccount,
    type NetworkType,
} from '@masknet/web3-shared-evm'
import {
    type FungibleToken,
    type NonFungibleCollection,
    type NonFungibleToken,
    type NonFungibleTokenContract,
    type NonFungibleTokenMetadata,
    type TransactionStatusType,
    isSameAddress,
    createNonFungibleToken,
    resolveCrossOriginURL,
    resolveIPFS_URL,
    createNonFungibleTokenMetadata,
    createNonFungibleTokenContract,
    createNonFungibleTokenCollection,
    isGreaterThan,
} from '@masknet/web3-shared-base'
import { queryClient } from '@masknet/shared-base-ui'
import { EVMRequestReadonlyAPI } from './RequestReadonlyAPI.js'
import { EVMContractReadonlyAPI } from './ContractReadonlyAPI.js'
import { ConnectionOptionsReadonlyAPI } from './ConnectionOptionsReadonlyAPI.js'
import type { BaseConnection } from '../../Base/apis/Connection.js'
import { fetchJSON } from '../../../helpers/fetchJSON.js'
import type { EVMConnectionOptions } from '../types/index.js'
import type { BaseConnectionOptions } from '../../../entry-types.js'
import { EVMChainResolver } from './ResolverAPI.js'
import type { ConnectionOptionsProvider } from '../../Base/apis/ConnectionOptions.js'

const EMPTY_STRING = Promise.resolve('')
const ZERO = Promise.resolve(0)

interface ERC721Metadata {
    name: string
    description: string
    image: string
}

interface ERC1155Metadata {
    name: string
    decimals: number
    description: string
    image: string
}

export class EVMConnectionReadonlyAPI
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
    static Default = new EVMConnectionReadonlyAPI()

    constructor(protected options?: EVMConnectionOptions) {
        this.Contract = new EVMContractReadonlyAPI(this.options)
        this.Request = new EVMRequestReadonlyAPI(this.options)
        this.ConnectionOptions = new ConnectionOptionsReadonlyAPI(this.options)
    }

    protected Request
    protected Contract
    protected ConnectionOptions: ConnectionOptionsProvider<ChainId, ProviderType, NetworkType, Transaction>

    getWeb3(initial?: EVMConnectionOptions) {
        return this.Request.getWeb3(initial)
    }

    getWeb3Provider(initial?: EVMConnectionOptions) {
        return this.Request.getWeb3Provider(initial)
    }

    async connect(initial?: EVMConnectionOptions): Promise<Account<ChainId>> {
        throw new Error('Method not implemented.')
    }

    async disconnect(initial?: EVMConnectionOptions): Promise<void> {
        throw new Error('Method not implemented.')
    }

    getWallets(initial?: EVMConnectionOptions): Promise<Wallet[]> {
        return this.Request.request<Wallet[]>(
            {
                method: EthereumMethodType.MASK_WALLETS,
                params: [],
            },
            initial,
        )
    }

    async addWallet(wallet: UpdatableWallet, initial?: EVMConnectionOptions): Promise<void> {
        throw new Error('Method not implemented.')
    }

    async updateWallet(
        address: string,
        wallet: Partial<UpdatableWallet>,
        initial?: EVMConnectionOptions,
    ): Promise<void> {
        throw new Error('Method not implemented.')
    }

    async renameWallet(address: string, name: string, initial?: EVMConnectionOptions): Promise<void> {
        throw new Error('Method not implemented.')
    }

    async removeWallet(address: string, password?: string | undefined, initial?: EVMConnectionOptions): Promise<void> {
        throw new Error('Method not implemented.')
    }

    async resetAllWallets(initial?: EVMConnectionOptions): Promise<void> {
        throw new Error('Method not implemented.')
    }

    async updateWallets(wallets: Wallet[], initial?: EVMConnectionOptions): Promise<void> {
        throw new Error('Method not implemented.')
    }

    async removeWallets(wallets: Wallet[], initial?: EVMConnectionOptions): Promise<void> {
        throw new Error('Method not implemented.')
    }

    async approveFungibleToken(
        address: string,
        recipient: string,
        amount: string,
        initial?: EVMConnectionOptions,
    ): Promise<string> {
        throw new Error('Method not implemented.')
    }

    async approveAllNonFungibleTokens(
        address: string,
        recipient: string,
        approved: boolean,
        schema?: SchemaType,
        initial?: EVMConnectionOptions,
    ): Promise<string> {
        throw new Error('Method not implemented.')
    }

    async transferFungibleToken(
        address: string,
        recipient: string,
        amount: string,
        memo?: string,
        initial?: EVMConnectionOptions,
    ): Promise<string> {
        throw new Error('Method not implemented.')
    }

    async transferNonFungibleToken(
        address: string,
        tokenId: string,
        recipient: string,
        amount?: string,
        schema?: SchemaType,
        initial?: EVMConnectionOptions,
    ): Promise<string> {
        throw new Error('Method not implemented.')
    }

    async getGasPrice(initial?: EVMConnectionOptions): Promise<string> {
        return this.Request.request<string>(
            {
                method: EthereumMethodType.eth_gasPrice,
                params: [],
            },
            initial,
        )
    }

    async getAddressType(address: string, initial?: EVMConnectionOptions): Promise<AddressType | undefined> {
        if (!isValidAddress(address)) return
        const code = await this.getCode(address, initial)
        return code === '0x' ? AddressType.ExternalOwned : AddressType.Contract
    }

    async getSchemaType(address: string, initial?: EVMConnectionOptions): Promise<SchemaType | undefined> {
        const ERC165_INTERFACE_ID = '0x01ffc9a7'
        const EIP5516_INTERFACE_ID = '0x8314f22b'
        const EIP5192_INTERFACE_ID = '0xb45a3c0e'
        const ERC721_INTERFACE_ID = '0x80ac58cd'
        const ERC1155_INTERFACE_ID = '0xd9b67a26'

        try {
            const options = this.ConnectionOptions.fill(initial)
            const erc165Contract = this.Contract.getERC165Contract(address, options)

            const [isERC165, isERC721] = await Promise.all([
                erc165Contract?.methods.supportsInterface(ERC165_INTERFACE_ID).call(),
                erc165Contract?.methods.supportsInterface(ERC721_INTERFACE_ID).call(),
            ])

            if (isERC165 && isERC721) return SchemaType.ERC721

            const isERC1155 = await erc165Contract?.methods.supportsInterface(ERC1155_INTERFACE_ID).call()
            if (isERC165 && isERC1155) return SchemaType.ERC1155

            const [isEIP5516, isEIP5192] = await Promise.all([
                erc165Contract?.methods.supportsInterface(EIP5516_INTERFACE_ID).call(),
                erc165Contract?.methods.supportsInterface(EIP5192_INTERFACE_ID).call(),
            ])

            if (isEIP5516 || isEIP5192) return SchemaType.SBT

            const isERC20 = await this.getCode(address, options)
            if (!isEmptyHex(isERC20)) return SchemaType.ERC20

            return
        } catch {
            return
        }
    }

    async getNonFungibleToken(
        address: string,
        tokenId: string,
        schema?: SchemaType,
        initial?: EVMConnectionOptions,
    ): Promise<NonFungibleToken<ChainId, SchemaType>> {
        const options = this.ConnectionOptions.fill(initial)
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
            const contract = this.Contract.getERC721Contract(address, options)
            try {
                ownerId = await contract?.methods.ownerOf(tokenId).call()
            } catch {}
        } else if (options.account) {
            const contract = this.Contract.getERC1155Contract(address, options)
            try {
                const balance = await contract?.methods.balanceOf(options.account, tokenId).call()
                ownerId = balance && isGreaterThan(balance, '0') ? options.account : undefined
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
        initial?: EVMConnectionOptions,
    ) {
        const options = this.ConnectionOptions.fill(initial)
        const actualSchema = schema ?? (await this.getSchemaType(address, options))

        // ERC1155
        if (actualSchema === SchemaType.ERC1155) return ''

        // CRYPTOPUNKS
        if (isCryptoPunksContractAddress(address)) {
            const cryptoPunksContract = this.Contract.getCryptoPunksContract(address, options)
            return (await cryptoPunksContract?.methods.punkIndexToAddress(tokenId).call()) ?? ''
        }

        // ERC721
        const contract = this.Contract.getERC721Contract(address, options)
        return (await contract?.methods.ownerOf(tokenId).call()) ?? ''
    }

    async getNonFungibleTokenOwnership(
        address: string,
        tokenId: string,
        owner: string,
        schema?: SchemaType,
        initial?: EVMConnectionOptions,
    ) {
        const options = this.ConnectionOptions.fill(initial)
        const actualSchema = schema ?? (await this.getSchemaType(address, options))

        // ERC1155
        if (actualSchema === SchemaType.ERC1155) {
            const contract = this.Contract.getERC1155Contract(address, options)
            // the owner has at least 1 token
            return isGreaterThan((await contract?.methods.balanceOf(owner, tokenId).call()) ?? 0, 0)
        }

        // ERC721
        const contract = this.Contract.getERC721Contract(address, options)
        return isSameAddress(await contract?.methods.ownerOf(tokenId).call(), owner)
    }

    async getNonFungibleTokenMetadata(
        address: string,
        tokenId: string | undefined,
        schema?: SchemaType,
        initial?: EVMConnectionOptions,
    ) {
        const options = this.ConnectionOptions.fill(initial)
        const processURI = (uri: string) => {
            // e.g,
            // address: 0x495f947276749ce646f68ac8c248420045cb7b5e
            // token id: 33445046430196205871873533938903624085962860434195770982901962545689408831489
            if (uri.startsWith('https://api.opensea.io/') && tokenId) return uri.replace('0x{id}', tokenId)

            // add cors header
            return resolveCrossOriginURL(resolveIPFS_URL(uri))!
        }
        const actualSchema = schema ?? (await this.getSchemaType(address, options))

        // ERC1155
        if (actualSchema === SchemaType.ERC1155) {
            const contract = this.Contract.getERC1155Contract(address, options)
            const uri = await contract?.methods.uri(tokenId ?? '').call()
            if (!uri) throw new Error('Failed to read metadata uri.')

            const response = await fetchJSON<ERC1155Metadata>(processURI(uri))
            return createNonFungibleTokenMetadata(
                options.chainId,
                response.name,
                tokenId ?? '',
                '',
                response.description,
                undefined,
                resolveIPFS_URL(response.image),
                resolveIPFS_URL(response.image),
            )
        }

        // ERC721
        const contract = this.Contract.getERC721Contract(address, options)
        const uri = await contract?.methods.tokenURI(tokenId ?? '').call()
        if (!uri) throw new Error('Failed to read metadata uri.')
        const response = await fetchJSON<ERC721Metadata>(processURI(uri))
        return createNonFungibleTokenMetadata(
            options.chainId,
            response.name,
            tokenId ?? '',
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
        initial?: EVMConnectionOptions,
    ): Promise<NonFungibleTokenContract<ChainId, SchemaType>> {
        const options = this.ConnectionOptions.fill(initial)
        const actualSchema = schema ?? (await this.getSchemaType(address, options))

        // ERC1155
        if (actualSchema === SchemaType.ERC1155) {
            const contractERC721 = this.Contract.getERC721Contract(address, options)
            const results = await Promise.allSettled([
                contractERC721?.methods.name().call() ?? EMPTY_STRING,
                contractERC721?.methods.symbol().call() ?? EMPTY_STRING,
            ])

            const [name, symbol] = results.map((result) => (result.status === 'fulfilled' ? result.value : ''))

            return createNonFungibleTokenContract(
                options.chainId,
                SchemaType.ERC1155,
                address,
                name ?? 'Unknown Token',
                symbol ?? 'UNKNOWN',
            )
        }

        // ERC721
        const contract = this.Contract.getERC721Contract(address, options)
        const results = await Promise.allSettled([
            contract?.methods.name().call() ?? EMPTY_STRING,
            contract?.methods.symbol().call() ?? EMPTY_STRING,
        ])

        const [name, symbol] = results.map((result) => (result.status === 'fulfilled' ? result.value : ''))

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
        initial?: EVMConnectionOptions,
    ): Promise<NonFungibleCollection<ChainId, SchemaType>> {
        const options = this.ConnectionOptions.fill(initial)
        const actualSchema = schema ?? (await this.getSchemaType(address, options))

        // ERC1155
        if (actualSchema === SchemaType.ERC1155) throw new Error('Not implemented yet.')

        // ERC721
        const contract = this.Contract.getERC721Contract(address, options)
        const results = await Promise.allSettled([contract?.methods.name().call() ?? EMPTY_STRING])
        const [name] = results.map((result) => (result.status === 'fulfilled' ? result.value : ''))
        return createNonFungibleTokenCollection(options.chainId, address, name ?? 'Unknown Token', '')
    }

    createAccount(initial?: BaseConnectionOptions<ChainId, ProviderType, Transaction> | undefined): Account<ChainId> {
        const options = this.ConnectionOptions.fill(initial)
        const account = createAccount()
        return {
            account: account.address,
            chainId: options.chainId,
            privateKey: account.privateKey,
        }
    }

    async switchChain(chainId: ChainId, initial?: EVMConnectionOptions): Promise<void> {
        throw new Error('Method not implemented.')
    }

    async getNativeTokenBalance(initial?: EVMConnectionOptions): Promise<string> {
        const options = this.ConnectionOptions.fill(initial)
        if (!isValidAddress(options.account)) return '0'
        return this.getBalance(options.account, options)
    }

    async getFungibleTokenBalance(
        address: string,
        schema?: SchemaType,
        initial?: EVMConnectionOptions,
    ): Promise<string> {
        const options = this.ConnectionOptions.fill(initial)

        // Native
        if (!address || isNativeTokenAddress(address)) return this.getNativeTokenBalance(options)

        // ERC20
        const contract = this.Contract.getERC20Contract(address, options)
        return (await contract?.methods.balanceOf(options.account).call()) ?? '0'
    }

    async getNonFungibleTokenBalance(
        address: string,
        tokenId: string | undefined,
        schema?: SchemaType,
        initial?: EVMConnectionOptions,
    ): Promise<string> {
        const options = this.ConnectionOptions.fill(initial)
        const actualSchema = schema ?? (await this.getSchemaType(address, options))

        // ERC1155
        if (actualSchema === SchemaType.ERC1155) {
            const contract = this.Contract.getERC1155Contract(address, options)
            return contract?.methods?.balanceOf(options.account, tokenId ?? '').call() ?? '0'
        }

        // ERC721
        const contract = this.Contract.getERC721Contract(address, options)
        return contract?.methods.balanceOf(options.account).call() ?? '0'
    }

    async getFungibleTokensBalance(
        listOfAddress: string[],
        initial?: EVMConnectionOptions,
    ): Promise<Record<string, string>> {
        if (!listOfAddress.length) return {}

        const options = this.ConnectionOptions.fill(initial)
        const NATIVE_TOKEN_ADDRESS = getTokenConstant(options.chainId, 'NATIVE_TOKEN_ADDRESS')
        const entities: Array<[string, string]> = []

        if (listOfAddress.some(isNativeTokenAddress)) {
            entities.push([NATIVE_TOKEN_ADDRESS ?? '', await this.getBalance(options.account, options)])
        }
        const BALANCE_CHECKER_ADDRESS = getEthereumConstant(options.chainId, 'BALANCE_CHECKER_ADDRESS')
        if (!BALANCE_CHECKER_ADDRESS) {
            if (process.env.NODE_ENV === 'development') {
                console.error(
                    `BALANCE_CHECKER_ADDRESS for chain ${options.chainId} is not provided, do you forget to update packages/web3-constants/evm/ethereum.json ?`,
                    BALANCE_CHECKER_ADDRESS,
                )
            }
            return Object.fromEntries(entities)
        }

        const listOfNonNativeAddress = listOfAddress.filter((x) => !isNativeTokenAddress(x))

        if (listOfNonNativeAddress.length) {
            const contract = this.Contract.getBalanceCheckerContract(BALANCE_CHECKER_ADDRESS, options)
            const balances = await contract?.methods.balances([options.account], listOfNonNativeAddress).call({
                // cannot check the sender's balance in the same contract
                from: undefined,
                chainId: web3_utils.numberToHex(options.chainId),
            })

            listOfNonNativeAddress.forEach((x, i) => {
                entities.push([x, balances?.[i] ?? '0'])
            })
        }
        return Object.fromEntries(entities)
    }

    async getNonFungibleTokensBalance(
        listOfAddress: string[],
        initial?: EVMConnectionOptions,
    ): Promise<Record<string, string>> {
        if (!listOfAddress.length) return {}

        const options = this.ConnectionOptions.fill(initial)
        const BALANCE_CHECKER_ADDRESS = getEthereumConstant(options.chainId, 'BALANCE_CHECKER_ADDRESS')
        if (!BALANCE_CHECKER_ADDRESS) {
            if (process.env.NODE_ENV === 'development') {
                console.error(
                    `BALANCE_CHECKER_ADDRESS for chain ${options.chainId} is not provided, do you forget to update packages/web3-constants/evm/ethereum.json ?`,
                    BALANCE_CHECKER_ADDRESS,
                )
            }
            return {}
        }
        const contract = this.Contract.getBalanceCheckerContract(BALANCE_CHECKER_ADDRESS, options)
        const result = await contract?.methods.balances([options.account], listOfAddress).call({
            // cannot check the sender's balance in the same contract
            from: undefined,
            chainId: web3_utils.numberToHex(options.chainId),
        })

        if (result?.length !== listOfAddress.length) return {}
        return Object.fromEntries(listOfAddress.map<[string, string]>((x, i) => [x, result[i]]))
    }

    getNativeToken(initial?: EVMConnectionOptions): Promise<FungibleToken<ChainId, SchemaType>> {
        const options = this.ConnectionOptions.fill(initial)
        const token = EVMChainResolver.nativeCurrency(options.chainId)
        if (!token) throw new Error('Failed to create native token.')
        return Promise.resolve(token)
    }

    async getFungibleToken(
        address: string,
        initial?: EVMConnectionOptions,
    ): Promise<FungibleToken<ChainId, SchemaType>> {
        const options = this.ConnectionOptions.fill(initial)

        // Native
        if (!address || isNativeTokenAddress(address)) return this.getNativeToken(options)

        // ERC20
        const contract = this.Contract.getERC20Contract(address, options)
        const bytes32Contract = this.Contract.getERC20Bytes32Contract(address, options)
        const results = await queryClient.fetchQuery({
            staleTime: 600_000,
            queryKey: ['fungibleToken', options.chainId, address],
            queryFn: async () => {
                return Promise.allSettled([
                    contract?.methods.name().call() ?? EMPTY_STRING,
                    bytes32Contract?.methods.name().call() ?? EMPTY_STRING,
                    contract?.methods.symbol().call() ?? EMPTY_STRING,
                    bytes32Contract?.methods.symbol().call() ?? EMPTY_STRING,
                    contract?.methods.decimals().call() ?? ZERO,
                ])
            },
        })
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

    async getAccount(initial?: EVMConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)
        const accounts = await this.Request.request<string[]>(
            {
                method: EthereumMethodType.eth_accounts,
                params: [],
            },
            options,
        )
        return first(accounts) ?? ''
    }

    async getChainId(initial?: EVMConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)
        const chainId = await this.Request.request<string>(
            {
                method: EthereumMethodType.eth_chainId,
                params: [],
            },
            options,
        )
        return Number.parseInt(chainId, 16)
    }

    getBlock(noOrId: number | string, initial?: EVMConnectionOptions) {
        return this.Request.request<Block>(
            {
                method: EthereumMethodType.eth_getBlockByNumber,
                params: [web3_utils.toHex(noOrId), false],
            },
            initial,
        )
    }

    getBlockNumber(initial?: EVMConnectionOptions) {
        return this.Request.request<number>(
            {
                method: EthereumMethodType.eth_blockNumber,
                params: [],
            },
            initial,
        )
    }

    async getBlockTimestamp(initial?: EVMConnectionOptions): Promise<number> {
        const options = this.ConnectionOptions.fill(initial)
        const blockNumber = await this.getBlockNumber(options)
        const block = await this.getBlock(blockNumber, options)
        return Number.parseInt(block.timestamp, 16)
    }

    getBalance(address: string, initial?: EVMConnectionOptions) {
        return this.Request.request<string>(
            {
                method: EthereumMethodType.eth_getBalance,
                params: [address, 'latest'],
            },
            initial,
        )
    }

    getCode(address: string, initial?: EVMConnectionOptions) {
        return this.Request.request<string>(
            {
                method: EthereumMethodType.eth_getCode,
                params: [address, 'latest'],
            },
            initial,
        )
    }

    async getTransaction(hash: string, initial?: EVMConnectionOptions) {
        return this.Request.request<TransactionDetailed>(
            {
                method: EthereumMethodType.eth_getTransactionByHash,
                params: [hash],
            },
            initial,
        )
    }

    async estimateTransaction(transaction: Transaction, fallback = 21000, initial?: EVMConnectionOptions) {
        try {
            const options = this.ConnectionOptions.fill(initial)
            return await this.Request.request<string>(
                {
                    method: EthereumMethodType.eth_estimateGas,
                    params: [
                        new AccountTransaction({
                            from: options.account,
                            chainId: options.chainId,
                            ...transaction,
                        }).fill(omit(options.overrides, ['gas', 'gasPrice', 'maxPriorityFeePerGas', 'maxFeePerGas'])),
                    ],
                },
                options,
            )
        } catch {
            return web3_utils.toHex(fallback)
        }
    }

    getTransactionReceipt(hash: string, initial?: EVMConnectionOptions) {
        return this.Request.request<TransactionReceipt>(
            {
                method: EthereumMethodType.eth_getTransactionReceipt,
                params: [hash],
            },
            initial,
        )
    }

    async getTransactionStatus(hash: string, initial?: EVMConnectionOptions): Promise<TransactionStatusType> {
        const receipt = await this.getTransactionReceipt(hash, initial)
        return getTransactionStatusType(receipt)
    }

    async getTransactionNonce(address: string, initial?: EVMConnectionOptions) {
        const nonce = await this.Request.request<number | string>(
            {
                method: EthereumMethodType.eth_getTransactionCount,
                params: [address, 'latest'],
            },
            initial,
        )
        return toNumber(nonce)
    }

    signMessage(
        type: 'message' | 'typedData' | Omit<string, 'message' | 'typedData'>,
        message: string,
        initial?: EVMConnectionOptions,
    ): Promise<string> {
        throw new Error('Method not implemented.')
    }

    async signTransaction(transaction: Transaction, initial?: EVMConnectionOptions): Promise<string> {
        throw new Error('Method not implemented.')
    }

    signTransactions(transactions: Transaction[], initial?: EVMConnectionOptions): Promise<string[]> {
        throw new Error('Method not implemented.')
    }

    supportedChainIds(initial?: EVMConnectionOptions): Promise<ChainId[]> {
        throw new Error('Method not implemented.')
    }

    async callUserOperation(owner: string, operation: UserOperation, initial?: EVMConnectionOptions): Promise<string> {
        throw new Error('Method not implemented.')
    }

    async sendUserOperation(owner: string, operation: UserOperation, initial?: EVMConnectionOptions): Promise<string> {
        throw new Error('Method not implemented.')
    }

    async transfer(recipient: string, amount: string, initial?: EVMConnectionOptions): Promise<string> {
        throw new Error('Method not implemented.')
    }

    async changeOwner(recipient: string, initial?: EVMConnectionOptions): Promise<string> {
        throw new Error('Method not implemented.')
    }

    async fund(proof: Proof, initial?: EVMConnectionOptions): Promise<string> {
        throw new Error('Method not implemented.')
    }

    async deploy(owner: string, identifier?: ECKeyIdentifier, initial?: EVMConnectionOptions): Promise<string> {
        throw new Error('Method not implemented.')
    }

    callTransaction(transaction: Transaction, initial?: EVMConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)
        return this.Request.request<string>(
            {
                method: EthereumMethodType.eth_call,
                params: [new AccountTransaction(transaction).fill(options.overrides), 'latest'],
            },
            options,
        )
    }

    async sendTransaction(transaction: Transaction, initial?: EVMConnectionOptions): Promise<string> {
        throw new Error('Method not implemented.')
    }

    sendSignedTransaction(signature: string, initial?: EVMConnectionOptions) {
        return this.Request.request<string>(
            {
                method: EthereumMethodType.eth_sendRawTransaction,
                params: [signature],
            },
            initial,
        )
    }

    async confirmTransaction(hash: string, initial?: EVMConnectionOptions): Promise<TransactionReceipt> {
        throw new Error('Method not implemented.')
    }

    replaceTransaction(hash: string, transaction: Transaction, initial?: EVMConnectionOptions): Promise<void> {
        throw new Error('Method not implemented.')
    }

    cancelTransaction(hash: string, transaction: Transaction, initial?: EVMConnectionOptions): Promise<void> {
        throw new Error('Method not implemented.')
    }
}

export const EVMWeb3Readonly = EVMConnectionReadonlyAPI.Default
