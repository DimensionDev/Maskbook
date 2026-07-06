import { toHex, type Account, type ECKeyIdentifier, type Proof } from '@masknet/shared-base'
import { queryClient } from '@masknet/shared-base-ui'
import {
    createNonFungibleTokenContract,
    type FungibleToken,
    type NonFungibleTokenContract,
    type TransactionStatusType,
} from '@masknet/web3-shared-base'
import {
    AccountTransaction,
    AddressType,
    createAccount,
    createERC20Token,
    EthereumMethodType,
    getEthereumConstant,
    getTokenConstant,
    getTransactionStatusType,
    isEmptyHex,
    isEIP7702Delegation,
    isNativeTokenAddress,
    isValidAddress,
    parseStringOrBytes32,
    SchemaType,
    type Block,
    type ChainId,
    type NetworkType,
    type ProviderType,
    type Signature,
    type Transaction,
    type TransactionDetailed,
    type TransactionReceipt,
    type TransactionSignature,
    type Web3,
} from '@masknet/web3-shared-evm'
import { first, omit, toNumber } from 'lodash-es'
import type { Address } from 'viem'
import type { BaseConnectionOptions } from '../../../entry-types.js'
import type { BaseConnection } from '../../Base/apis/Connection.js'
import type { ConnectionOptionsProvider } from '../../Base/apis/ConnectionOptions.js'
import type { EVMConnectionOptions } from '../types/index.js'
import { ConnectionOptionsReadonlyAPI } from './ConnectionOptionsReadonlyAPI.js'
import { EVMContractReadonlyAPI } from './ContractReadonlyAPI.js'
import { EVMRequestReadonlyAPI } from './RequestReadonlyAPI.js'
import { EVMChainResolver } from './ResolverAPI.js'

const EMPTY_STRING = Promise.resolve('')
const ZERO = Promise.resolve(0)

export class EVMConnectionReadonlyAPI
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

    getViem(initial?: EVMConnectionOptions) {
        return this.Request.getViem(initial)
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

    async renameWallet(address: string, name: string, initial?: EVMConnectionOptions): Promise<void> {
        throw new Error('Method not implemented.')
    }

    async removeWallet(address: string, password?: string | undefined, initial?: EVMConnectionOptions): Promise<void> {
        throw new Error('Method not implemented.')
    }

    async resetAllWallets(initial?: EVMConnectionOptions): Promise<void> {
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

    async transferFungibleToken(
        address: string,
        recipient: string,
        amount: string,
        memo?: string,
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
        // EIP-7702 delegated EOA: still an EOA, not a contract.
        if (isEIP7702Delegation(code)) return AddressType.ExternalOwned
        return isEmptyHex(code) ? AddressType.ExternalOwned : AddressType.Contract
    }

    async getSchemaType(address: string, initial?: EVMConnectionOptions): Promise<SchemaType | undefined> {
        const ERC165_INTERFACE_ID = '0x01ffc9a7'
        const EIP5516_INTERFACE_ID = '0x8314f22b'
        const EIP5192_INTERFACE_ID = '0xb45a3c0e'
        const ERC721_INTERFACE_ID = '0x80ac58cd'
        const ERC1155_INTERFACE_ID = '0xd9b67a26'

        try {
            const options = this.ConnectionOptions.fill(initial)
            const erc165Contract = this.Contract.getERC165Contract(address)

            const [isERC165, isERC721] = await Promise.all([
                this.Contract.readContract(erc165Contract, 'supportsInterface', [ERC165_INTERFACE_ID], options),
                this.Contract.readContract(erc165Contract, 'supportsInterface', [ERC721_INTERFACE_ID], options),
            ])

            if (isERC165 && isERC721) return SchemaType.ERC721

            const isERC1155 = await this.Contract.readContract(
                erc165Contract,
                'supportsInterface',
                [ERC1155_INTERFACE_ID],
                options,
            )
            if (isERC165 && isERC1155) return SchemaType.ERC1155

            const [isEIP5516, isEIP5192] = await Promise.all([
                this.Contract.readContract(erc165Contract, 'supportsInterface', [EIP5516_INTERFACE_ID], options),
                this.Contract.readContract(erc165Contract, 'supportsInterface', [EIP5192_INTERFACE_ID], options),
            ])

            if (isEIP5516 || isEIP5192) return SchemaType.SBT

            const isERC20 = await this.getCode(address, options)
            if (!isEmptyHex(isERC20)) return SchemaType.ERC20

            return
        } catch {
            return
        }
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
            const contractERC721 = this.Contract.getERC721Contract(address)
            const results = await Promise.allSettled([
                this.Contract.readContract(contractERC721, 'name', [], options),
                this.Contract.readContract(contractERC721, 'symbol', [], options),
            ])

            const [name, symbol] = results.map((result) =>
                result.status === 'fulfilled' ? String(result.value ?? '') : '',
            )

            return createNonFungibleTokenContract(
                options.chainId,
                SchemaType.ERC1155,
                address,
                name ?? 'Unknown Token',
                symbol ?? 'UNKNOWN',
            )
        }

        // ERC721
        const contract = this.Contract.getERC721Contract(address)
        const results = await Promise.allSettled([
            this.Contract.readContract(contract, 'name', [], options),
            this.Contract.readContract(contract, 'symbol', [], options),
        ])

        const [name, symbol] = results.map((result) =>
            result.status === 'fulfilled' ? String(result.value ?? '') : '',
        )

        return createNonFungibleTokenContract<ChainId, SchemaType.ERC721>(
            options.chainId,
            SchemaType.ERC721,
            address,
            name ?? 'Unknown Token',
            symbol ?? 'UNKNOWN',
        )
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
        const contract = this.Contract.getERC20Contract(address)
        return (
            (
                await this.Contract.readContract(contract, 'balanceOf', [options.account as Address], options)
            )?.toString() ?? '0'
        )
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
            const contract = this.Contract.getBalanceCheckerContract(BALANCE_CHECKER_ADDRESS)
            const balances = (await this.Contract.readContract(
                contract,
                'balances',
                [[options.account as Address], listOfNonNativeAddress as Address[]],
                // cannot check the sender's balance in the same contract
                { ...options, from: undefined },
            )) as readonly bigint[] | undefined

            listOfNonNativeAddress.forEach((x, i) => {
                entities.push([x, balances?.[i]?.toString() ?? '0'])
            })
        }
        return Object.fromEntries(entities)
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
        const contract = this.Contract.getERC20Contract(address)
        const bytes32Contract = this.Contract.getERC20Bytes32Contract(address)
        const results = await queryClient.fetchQuery({
            staleTime: 600_000,
             
            queryKey: ['fungibleToken', options.chainId, address, contract, options, bytes32Contract],
            queryFn: async () => {
                return Promise.allSettled([
                    this.Contract.readContract(contract, 'name', [], options),
                    this.Contract.readContract(bytes32Contract, 'name', [], options),
                    this.Contract.readContract(contract, 'symbol', [], options),
                    this.Contract.readContract(bytes32Contract, 'symbol', [], options),
                    this.Contract.readContract(contract, 'decimals', [], options),
                ])
            },
        })
        const [name, nameBytes32, symbol, symbolBytes32, decimals] = results.map((result) =>
            result.status === 'fulfilled' ? result.value : '',
        ) as string[]
        return createERC20Token(
            options.chainId,
            address,
            parseStringOrBytes32(name, toHex(nameBytes32), 'Unknown Token'),
            parseStringOrBytes32(symbol, toHex(symbolBytes32), 'UNKNOWN'),
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
                params: [toHex(noOrId), false],
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
            return toHex(fallback)
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

    async changeOwner(recipient: string, initial?: EVMConnectionOptions): Promise<string> {
        throw new Error('Method not implemented.')
    }

    async fund(proof: Proof, initial?: EVMConnectionOptions): Promise<string> {
        throw new Error('Method not implemented.')
    }

    async deploy(owner: string, identifier?: ECKeyIdentifier, initial?: EVMConnectionOptions): Promise<string> {
        throw new Error('Method not implemented.')
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
