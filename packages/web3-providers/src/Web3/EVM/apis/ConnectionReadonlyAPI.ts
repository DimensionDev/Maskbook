import { first } from 'lodash-es'
import type Web3 from 'web3'
import { numberToHex, toHex, toNumber } from 'web3-utils'
import { delay } from '@masknet/kit'
import { type Account, type ECKeyIdentifier, type Proof, type Wallet, queryClient } from '@masknet/shared-base'
import {
    AddressType,
    SchemaType,
    type ChainId,
    type Web3Provider,
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
    ContractTransaction,
    isValidAddress,
    isEmptyHex,
    getTransactionStatusType,
    createNativeToken,
    parseStringOrBytes32,
    createERC20Token,
    isCryptoPunksContractAddress,
    getAverageBlockDelay,
    getEthereumConstant,
    getTokenConstant,
} from '@masknet/web3-shared-evm'
import {
    type FungibleToken,
    type NonFungibleCollection,
    type NonFungibleToken,
    type NonFungibleTokenContract,
    type NonFungibleTokenMetadata,
    TransactionStatusType,
    isSameAddress,
    createNonFungibleToken,
    resolveCrossOriginURL,
    resolveIPFS_URL,
    createNonFungibleTokenMetadata,
    createNonFungibleTokenContract,
    createNonFungibleTokenCollection,
} from '@masknet/web3-shared-base'
import { RequestReadonlyAPI } from './RequestReadonlyAPI.js'
import { ContractReadonlyAPI } from './ContractReadonlyAPI.js'
import { Web3StateRef } from './Web3StateAPI.js'
import { ConnectionOptionsAPI } from './ConnectionOptionsAPI.js'
import type { ConnectionAPI_Base } from '../../Base/apis/ConnectionAPI.js'
import { Providers } from '../providers/index.js'
import type { ConnectionOptions } from '../types/index.js'
import { fetchJSON } from '../../../entry-helpers.js'
import type { ConnectionOptions_Base } from '../../../entry-types.js'

const EMPTY_STRING = Promise.resolve('')
const ZERO = Promise.resolve(0)

export interface ERC721Metadata {
    name: string
    description: string
    image: string
}

export interface ERC1155Metadata {
    name: string
    decimals: number
    description: string
    image: string
}

export class ConnectionReadonlyAPI
    implements
        ConnectionAPI_Base<
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
            Web3,
            Web3Provider
        >
{
    constructor(protected options?: ConnectionOptions) {}

    protected Request = new RequestReadonlyAPI(this.options)
    protected Contract = new ContractReadonlyAPI(this.options)
    protected ConnectionOptions = new ConnectionOptionsAPI(this.options)

    private get Transaction() {
        return Web3StateRef.value.Transaction
    }

    private get TransactionWatcher() {
        return Web3StateRef.value.TransactionWatcher
    }

    getWeb3(initial?: ConnectionOptions) {
        return this.Request.getWeb3(initial)
    }

    getWeb3Provider(initial?: ConnectionOptions) {
        return this.Request.getWeb3Provider(initial)
    }

    async connect(initial?: ConnectionOptions): Promise<Account<ChainId>> {
        return this.Request.request<Account<ChainId>>(
            {
                method: EthereumMethodType.MASK_LOGIN,
                params: [],
            },
            this.ConnectionOptions.fill(initial),
        )
    }

    async disconnect(initial?: ConnectionOptions): Promise<void> {
        await this.Request.request<void>(
            {
                method: EthereumMethodType.MASK_LOGOUT,
                params: [],
            },
            this.ConnectionOptions.fill(initial),
        )
    }

    getWallets(initial?: ConnectionOptions): Promise<Wallet[]> {
        return this.Request.request<Wallet[]>(
            {
                method: EthereumMethodType.MASK_WALLETS,
                params: [],
            },
            this.ConnectionOptions.fill(initial),
        )
    }

    async addWallet(wallet: Wallet, initial?: ConnectionOptions): Promise<void> {
        await this.Request.request<void>(
            {
                method: EthereumMethodType.MASK_ADD_WALLET,
                params: [wallet],
            },
            this.ConnectionOptions.fill(initial),
        )
    }

    async updateWallet(address: string, wallet: Wallet, initial?: ConnectionOptions): Promise<void> {
        await this.Request.request<void>(
            {
                method: EthereumMethodType.MASK_UPDATE_WALLET,
                params: [address, wallet],
            },
            this.ConnectionOptions.fill(initial),
        )
    }

    async updateOrAddWallet(wallet: Wallet, initial?: ConnectionOptions): Promise<void> {
        await this.Request.request<void>(
            {
                method: EthereumMethodType.MASK_ADD_OR_UPDATE_WALLET,
                params: [wallet],
            },
            this.ConnectionOptions.fill(initial),
        )
    }

    async renameWallet(address: string, name: string, initial?: ConnectionOptions): Promise<void> {
        await this.Request.request<void>(
            {
                method: EthereumMethodType.MASK_RENAME_WALLET,
                params: [address, name],
            },
            this.ConnectionOptions.fill(initial),
        )
    }

    async removeWallet(address: string, password?: string | undefined, initial?: ConnectionOptions): Promise<void> {
        await this.Request.request<void>(
            {
                method: EthereumMethodType.MASK_REMOVE_WALLET,
                params: [address, password],
            },
            this.ConnectionOptions.fill(initial),
        )
    }

    async updateWallets(wallets: Wallet[], initial?: ConnectionOptions): Promise<void> {
        await this.Request.request<void>(
            {
                method: EthereumMethodType.MASK_UPDATE_WALLETS,
                params: wallets,
            },
            this.ConnectionOptions.fill(initial),
        )
    }

    async removeWallets(wallets: Wallet[], initial?: ConnectionOptions): Promise<void> {
        await this.Request.request<void>(
            {
                method: EthereumMethodType.MASK_REMOVE_WALLETS,
                params: wallets,
            },
            this.ConnectionOptions.fill(initial),
        )
    }

    async approveFungibleToken(
        address: string,
        recipient: string,
        amount: string,
        initial?: ConnectionOptions,
    ): Promise<string> {
        const options = this.ConnectionOptions.fill(initial)

        // Native
        if (!address || isNativeTokenAddress(address)) throw new Error('Invalid token address.')

        // ERC20
        return new ContractTransaction(this.Contract.getERC20Contract(address, options)).send(
            (x) => x?.methods.approve(recipient, toHex(amount)),
            options.overrides,
        )
    }

    async approveNonFungibleToken(
        address: string,
        recipient: string,
        tokenId: string,
        schema: SchemaType,
        initial?: ConnectionOptions,
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
        initial?: ConnectionOptions,
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

    async transferFungibleToken(
        address: string,
        recipient: string,
        amount: string,
        memo?: string,
        initial?: ConnectionOptions,
    ): Promise<string> {
        const options = this.ConnectionOptions.fill(initial)

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
        return new ContractTransaction(this.Contract.getERC20Contract(address, options)).send(
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
        initial?: ConnectionOptions,
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

    async getGasPrice(initial?: ConnectionOptions): Promise<string> {
        const options = this.ConnectionOptions.fill(initial)
        return this.getWeb3(options).eth.getGasPrice()
    }

    async getAddressType(address: string, initial?: ConnectionOptions): Promise<AddressType | undefined> {
        const options = this.ConnectionOptions.fill(initial)
        if (!isValidAddress(address)) return
        const code = await this.getWeb3(options).eth.getCode(address)
        return code === '0x' ? AddressType.ExternalOwned : AddressType.Contract
    }

    async getSchemaType(address: string, initial?: ConnectionOptions): Promise<SchemaType | undefined> {
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
        initial?: ConnectionOptions,
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

    async getNonFungibleTokenOwner(address: string, tokenId: string, schema?: SchemaType, initial?: ConnectionOptions) {
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
        initial?: ConnectionOptions,
    ) {
        const options = this.ConnectionOptions.fill(initial)
        const actualSchema = schema ?? (await this.getSchemaType(address, options))

        // ERC1155
        if (actualSchema === SchemaType.ERC1155) {
            const contract = this.Contract.getERC1155Contract(address, options)
            // the owner has at least 1 token
            return toNumber((await contract?.methods.balanceOf(owner, tokenId).call()) ?? 0) > 0
        }

        // ERC721
        const contract = this.Contract.getERC721Contract(address, options)
        return isSameAddress(await contract?.methods.ownerOf(tokenId).call(), owner)
    }

    async getNonFungibleTokenMetadata(
        address: string,
        tokenId: string | undefined,
        schema?: SchemaType,
        initial?: ConnectionOptions,
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
        initial?: ConnectionOptions,
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
        initial?: ConnectionOptions,
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

    createAccount(initial?: ConnectionOptions_Base<ChainId, ProviderType, Transaction> | undefined): Account<ChainId> {
        const options = this.ConnectionOptions.fill(initial)
        const account = this.getWeb3().eth.accounts.create()
        return {
            account: account.address,
            chainId: options.chainId,
            privateKey: account.privateKey,
        }
    }

    async switchChain(chainId: ChainId, initial?: ConnectionOptions): Promise<void> {
        const options = this.ConnectionOptions.fill(initial)
        await Providers[options.providerType].switchChain(chainId)
    }

    async getNativeTokenBalance(initial?: ConnectionOptions): Promise<string> {
        const options = this.ConnectionOptions.fill(initial)
        if (!isValidAddress(options.account)) return '0'
        return this.getBalance(options.account, options)
    }

    async getFungibleTokenBalance(address: string, schema?: SchemaType, initial?: ConnectionOptions): Promise<string> {
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
        initial?: ConnectionOptions,
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
        initial?: ConnectionOptions,
    ): Promise<Record<string, string>> {
        if (!listOfAddress.length) return {}

        const options = this.ConnectionOptions.fill(initial)
        const NATIVE_TOKEN_ADDRESS = getTokenConstant(options.chainId, 'NATIVE_TOKEN_ADDRESS')
        const BALANCE_CHECKER_ADDRESS = getEthereumConstant(options.chainId, 'BALANCE_CHECKER_ADDRESS')
        const entities: Array<[string, string]> = []

        if (listOfAddress.some(isNativeTokenAddress)) {
            entities.push([NATIVE_TOKEN_ADDRESS ?? '', await this.getBalance(options.account, options)])
        }

        const listOfNonNativeAddress = listOfAddress.filter((x) => !isNativeTokenAddress(x))

        if (listOfNonNativeAddress.length) {
            const contract = this.Contract.getBalanceCheckerContract(BALANCE_CHECKER_ADDRESS ?? '', options)
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
        initial?: ConnectionOptions,
    ): Promise<Record<string, string>> {
        if (!listOfAddress.length) return {}

        const options = this.ConnectionOptions.fill(initial)
        const BALANCE_CHECKER_ADDRESS = getEthereumConstant(options.chainId, 'BALANCE_CHECKER_ADDRESS')
        const contract = this.Contract.getBalanceCheckerContract(BALANCE_CHECKER_ADDRESS ?? '', options)
        const result = await contract?.methods.balances([options.account], listOfAddress).call({
            // cannot check the sender's balance in the same contract
            from: undefined,
            chainId: numberToHex(options.chainId),
        })

        if (result?.length !== listOfAddress.length) return {}
        return Object.fromEntries(listOfAddress.map<[string, string]>((x, i) => [x, result[i]]))
    }

    getNativeToken(initial?: ConnectionOptions): Promise<FungibleToken<ChainId, SchemaType>> {
        const options = this.ConnectionOptions.fill(initial)
        const token = createNativeToken(options.chainId)
        if (!token) throw new Error('Failed to create native token.')
        return Promise.resolve(token)
    }

    async getFungibleToken(address: string, initial?: ConnectionOptions): Promise<FungibleToken<ChainId, SchemaType>> {
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

    async getAccount(initial?: ConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)
        const accounts = await this.Request.request<string[]>(
            {
                method: EthereumMethodType.ETH_ACCOUNTS,
            },
            options,
        )
        return first(accounts) ?? ''
    }

    async getChainId(initial?: ConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)
        const chainId = await this.Request.request<string>(
            {
                method: EthereumMethodType.ETH_CHAIN_ID,
            },
            options,
        )
        return Number.parseInt(chainId, 16)
    }

    getBlock(noOrId: number | string, initial?: ConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)
        return this.getWeb3(options).eth.getBlock(noOrId) as Promise<Block>
    }

    getBlockNumber(initial?: ConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)
        return this.getWeb3(options).eth.getBlockNumber()
    }

    async getBlockTimestamp(initial?: ConnectionOptions): Promise<number> {
        const options = this.ConnectionOptions.fill(initial)
        const blockNumber = await this.getBlockNumber(options)
        const block = await this.getBlock(blockNumber, options)
        return Number.parseInt(block.timestamp, 16)
    }

    getBalance(address: string, initial?: ConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)
        return this.getWeb3(options).eth.getBalance(address)
    }

    getCode(address: string, initial?: ConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)
        return this.getWeb3(options).eth.getCode(address)
    }

    async getTransaction(hash: string, initial?: ConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)
        return this.getWeb3(options).eth.getTransaction(hash) as unknown as Promise<TransactionDetailed>
    }

    async estimateTransaction(transaction: Transaction, fallback = 21000, initial?: ConnectionOptions) {
        try {
            const options = this.ConnectionOptions.fill(initial)
            const provider = this.Request.getWeb3Provider(options)
            return provider.request<string>({
                method: EthereumMethodType.ETH_ESTIMATE_GAS,
                params: [
                    new AccountTransaction({
                        from: options.account,
                        ...transaction,
                    }).fill(options.overrides),
                ],
            })
        } catch {
            return toHex(fallback)
        }
    }

    getTransactionReceipt(hash: string, initial?: ConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)
        return this.getWeb3(options).eth.getTransactionReceipt(hash)
    }

    async getTransactionStatus(hash: string, initial?: ConnectionOptions): Promise<TransactionStatusType> {
        const options = this.ConnectionOptions.fill(initial)
        const receipt = await this.getTransactionReceipt(hash, options)
        return getTransactionStatusType(receipt)
    }

    async getTransactionNonce(address: string, initial?: ConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)
        return this.getWeb3(options).eth.getTransactionCount(address)
    }

    signMessage(
        type: 'message' | 'typedData' | Omit<string, 'message' | 'typedData'>,
        message: string,
        initial?: ConnectionOptions,
    ) {
        const options = this.ConnectionOptions.fill(initial)
        if (!options.account) throw new Error('Unknown account.')

        switch (type) {
            case 'message':
                return this.Request.request<string>(
                    {
                        method: EthereumMethodType.PERSONAL_SIGN,
                        params: [message, options.account, ''].filter((x) => typeof x !== 'undefined'),
                    },
                    options,
                )
            case 'typedData':
                return this.Request.request<string>(
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

    async verifyMessage(type: string, message: string, signature: string, initial?: ConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)
        const web3 = this.getWeb3(options)
        const dataToSign = await web3.eth.personal.ecRecover(message, signature)
        return dataToSign === message
    }

    async signTransaction(transaction: Transaction, initial?: ConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)
        return this.Request.request<string>(
            {
                method: EthereumMethodType.ETH_SIGN_TRANSACTION,
                params: [transaction],
            },
            options,
        )
    }

    signTransactions(transactions: Transaction[], initial?: ConnectionOptions) {
        return Promise.all(transactions.map((x) => this.signTransaction(x, initial)))
    }

    supportedChainIds(initial?: ConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)
        return this.Request.request<ChainId[]>(
            {
                method: EthereumMethodType.ETH_SUPPORTED_CHAIN_IDS,
                params: [],
            },
            options,
        )
    }

    supportedEntryPoints(initial?: ConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)
        return this.Request.request<string[]>(
            {
                method: EthereumMethodType.ETH_SUPPORTED_ENTRY_POINTS,
                params: [],
            },
            options,
        )
    }

    async callUserOperation(owner: string, operation: UserOperation, initial?: ConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)
        return this.Request.request<string>(
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

    async sendUserOperation(owner: string, operation: UserOperation, initial?: ConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)
        return this.Request.request<string>(
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

    async transfer(recipient: string, amount: string, initial?: ConnectionOptions) {
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

    async changeOwner(recipient: string, initial?: ConnectionOptions) {
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

    async fund(proof: Proof, initial?: ConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)
        return this.Request.request<string>(
            {
                method: EthereumMethodType.MASK_FUND,
                params: [proof],
            },
            options,
        )
    }

    async deploy(owner: string, identifier?: ECKeyIdentifier, initial?: ConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)
        return this.Request.request<string>(
            {
                method: EthereumMethodType.MASK_DEPLOY,
                params: [owner, identifier],
            },
            options,
        )
    }

    callTransaction(transaction: Transaction, initial?: ConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)
        const provider = this.Request.getWeb3Provider(options)
        return provider.request<string>({
            method: EthereumMethodType.ETH_CALL,
            params: [new AccountTransaction(transaction).fill(options.overrides), 'latest'],
        })
    }

    async sendTransaction(transaction: Transaction, initial?: ConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)

        // send a transaction which will add into the internal transaction list and start to watch it for confirmation
        const hash = await this.Request.request<string>(
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

    sendSignedTransaction(signature: string, initial?: ConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)
        const provider = this.getWeb3Provider(options)
        return provider.request<string>({
            method: EthereumMethodType.ETH_SEND_RAW_TRANSACTION,
            params: [signature],
        })
    }

    async confirmTransaction(hash: string, initial?: ConnectionOptions): Promise<TransactionReceipt> {
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

    replaceTransaction(hash: string, transaction: Transaction, initial?: ConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)
        return this.Request.request<void>(
            {
                method: EthereumMethodType.MASK_REPLACE_TRANSACTION,
                params: [hash, transaction],
            },
            options,
        )
    }

    cancelTransaction(hash: string, transaction: Transaction, initial?: ConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)
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
            options,
        )
    }
}
