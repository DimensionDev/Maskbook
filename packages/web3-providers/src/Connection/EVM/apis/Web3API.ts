import { memoize } from 'lodash-es'
import Web3 from 'web3'
import type { HttpProvider } from 'web3-core'
import { type AbiItem, numberToHex, toHex, toNumber } from 'web3-utils'
import { delay } from '@masknet/kit'
import {
    AddressType,
    SchemaType,
    type ChainId,
    createContract,
    createWeb3Provider,
    createWeb3Request,
    isValidAddress,
    type Web3Provider,
    type Transaction,
    type TransactionDetailed,
    type TransactionReceipt,
    type Block,
    isEmptyHex,
    getTransactionStatusType,
    EthereumMethodType,
    AccountTransaction,
    isNativeTokenAddress,
    createERC20Token,
    parseStringOrBytes32,
    createNativeToken,
    getTokenConstant,
    getEthereumConstant,
    type TransactionSignature,
    ProviderURL,
    getAverageBlockDelay,
    isCryptoPunksContractAddress,
} from '@masknet/web3-shared-evm'
import {
    type FungibleToken,
    type NonFungibleCollection,
    type NonFungibleToken,
    type NonFungibleTokenContract,
    type NonFungibleTokenMetadata,
    type TransactionStatusType,
    createNonFungibleToken,
    createNonFungibleTokenCollection,
    createNonFungibleTokenContract,
    createNonFungibleTokenMetadata,
    isSameAddress,
    resolveIPFS_URL,
    resolveCrossOriginURL,
} from '@masknet/web3-shared-base'
import type { ERC20 } from '@masknet/web3-contracts/types/ERC20.js'
import type { ERC20Bytes32 } from '@masknet/web3-contracts/types/ERC20Bytes32.js'
import type { ERC165 } from '@masknet/web3-contracts/types/ERC165.js'
import type { ERC721 } from '@masknet/web3-contracts/types/ERC721.js'
import type { ERC1155 } from '@masknet/web3-contracts/types/ERC1155.js'
import type { CryptoPunks } from '@masknet/web3-contracts/types/CryptoPunks.js'
import type { BalanceChecker } from '@masknet/web3-contracts/types/BalanceChecker.js'
import ERC20ABI from '@masknet/web3-contracts/abis/ERC20.json'
import ERC165ABI from '@masknet/web3-contracts/abis/ERC165.json'
import ERC20Bytes32ABI from '@masknet/web3-contracts/abis/ERC20Bytes32.json'
import ERC721ABI from '@masknet/web3-contracts/abis/ERC721.json'
import ERC1155ABI from '@masknet/web3-contracts/abis/ERC1155.json'
import CryptoPunksABI from '@masknet/web3-contracts/abis/CryptoPunks.json'
import BalanceCheckerABI from '@masknet/web3-contracts/abis/BalanceChecker.json'
import type { BaseContract } from '@masknet/web3-contracts/types/types.js'
import type { Web3BaseAPI } from '../../../entry-types.js'
import { fetchJSON } from '../../../entry-helpers.js'
import { queryClient } from '@masknet/shared-base'

const EMPTY_STRING = Promise.resolve('')
const ZERO = Promise.resolve(0)

const createWeb3SDK = memoize(
    (url: string) => new Web3(url),
    (url) => url.toLowerCase(),
)

export class Web3API
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
        return createWeb3SDK(ProviderURL.from(chainId))
    }

    getWeb3Provider(chainId: ChainId) {
        const web3 = this.getWeb3(chainId)
        const provider = web3.currentProvider as HttpProvider
        return createWeb3Provider(createWeb3Request(provider.send.bind(provider)))
    }

    getWeb3Contract<T extends BaseContract>(chainId: ChainId, address: string, ABI: AbiItem[]) {
        const web3 = this.getWeb3(chainId)
        return createContract<T>(web3, address, ABI)
    }

    getERC20Contract(chainId: ChainId, address: string) {
        return this.getWeb3Contract<ERC20>(chainId, address, ERC20ABI as AbiItem[])
    }

    getERC721Contract(chainId: ChainId, address: string) {
        return this.getWeb3Contract<ERC721>(chainId, address, ERC721ABI as AbiItem[])
    }

    getERC1155Contract(chainId: ChainId, address: string) {
        return this.getWeb3Contract<ERC1155>(chainId, address, ERC1155ABI as AbiItem[])
    }

    getERC165Contract(chainId: ChainId, address: string) {
        return this.getWeb3Contract<ERC165>(chainId, address, ERC165ABI as AbiItem[])
    }
    getCryptoPunksContract(chainId: ChainId, address: string) {
        return this.getWeb3Contract<CryptoPunks>(chainId, address, CryptoPunksABI as AbiItem[])
    }

    async getFungibleTokensBalance(
        chainId: ChainId,
        listOfAddress: string[],
        owner: string,
    ): Promise<Record<string, string>> {
        if (!listOfAddress.length) return {}

        const NATIVE_TOKEN_ADDRESS = getTokenConstant(chainId, 'NATIVE_TOKEN_ADDRESS')
        const BALANCE_CHECKER_ADDRESS = getEthereumConstant(chainId, 'BALANCE_CHECKER_ADDRESS')
        const entities: Array<[string, string]> = []

        if (listOfAddress.some(isNativeTokenAddress)) {
            entities.push([NATIVE_TOKEN_ADDRESS ?? '', await this.getBalance(chainId, owner)])
        }

        const listOfNonNativeAddress = listOfAddress.filter((x) => !isNativeTokenAddress(x))

        if (listOfNonNativeAddress.length) {
            const contract = this.getWeb3Contract<BalanceChecker>(
                chainId,
                BALANCE_CHECKER_ADDRESS ?? '',
                BalanceCheckerABI as AbiItem[],
            )
            const balances = await contract?.methods.balances([owner], listOfNonNativeAddress).call({
                // cannot check the sender's balance in the same contract
                from: undefined,
                chainId: numberToHex(chainId),
            })

            listOfNonNativeAddress.forEach((x, i) => {
                entities.push([x, balances?.[i] ?? '0'])
            })
        }
        return Object.fromEntries(entities)
    }

    async getNonFungibleTokensBalance(
        chainId: ChainId,
        listOfAddress: string[],
        owner: string,
    ): Promise<Record<string, string>> {
        if (!listOfAddress.length) return {}

        const BALANCE_CHECKER_ADDRESS = getEthereumConstant(chainId, 'BALANCE_CHECKER_ADDRESS')
        const contract = this.getWeb3Contract<BalanceChecker>(
            chainId,
            BALANCE_CHECKER_ADDRESS ?? '',
            BalanceCheckerABI as AbiItem[],
        )
        const result = await contract?.methods.balances([owner], listOfAddress).call({
            // cannot check the sender's balance in the same contract
            from: undefined,
            chainId: numberToHex(chainId),
        })

        if (result?.length !== listOfAddress.length) return {}
        return Object.fromEntries(listOfAddress.map<[string, string]>((x, i) => [x, result[i]]))
    }

    getBalance(chainId: ChainId, address: string): Promise<string> {
        return this.getWeb3(chainId).eth.getBalance(address)
    }
    getGasPrice(chainId: ChainId): Promise<string> {
        return this.getWeb3(chainId).eth.getGasPrice()
    }
    getCode(chainId: ChainId, address: string): Promise<string> {
        return this.getWeb3(chainId).eth.getCode(address)
    }
    async getAddressType(chainId: ChainId, address: string): Promise<AddressType | undefined> {
        if (!isValidAddress(address)) return
        const code = await this.getWeb3(chainId).eth.getCode(address)
        return code === '0x' ? AddressType.ExternalOwned : AddressType.Contract
    }
    async getSchemaType(chainId: ChainId, address: string): Promise<SchemaType | undefined> {
        const ERC165_INTERFACE_ID = '0x01ffc9a7'
        const EIP5516_INTERFACE_ID = '0x8314f22b'
        const EIP5192_INTERFACE_ID = '0xb45a3c0e'
        const ERC721_INTERFACE_ID = '0x80ac58cd'
        const ERC1155_INTERFACE_ID = '0xd9b67a26'

        try {
            const erc165Contract = this.getERC165Contract(chainId, address)

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

            const isERC20 = await this.getCode(chainId, address)
            if (!isEmptyHex(isERC20)) return SchemaType.ERC20

            return
        } catch {
            return
        }
    }
    getBlock(chainId: ChainId, noOrId: string | number): Promise<Block> {
        return this.getWeb3(chainId).eth.getBlock(noOrId) as Promise<Block>
    }
    getBlockNumber(chainId: ChainId): Promise<number> {
        return this.getWeb3(chainId).eth.getBlockNumber()
    }
    async getBlockTimestamp(chainId: ChainId): Promise<number> {
        const blockNumber = await this.getBlockNumber(chainId)
        const block = await this.getBlock(chainId, blockNumber)
        return Number.parseInt(block.timestamp, 16)
    }
    getTransaction(chainId: ChainId, hash: string): Promise<TransactionDetailed> {
        return this.getWeb3(chainId).eth.getTransaction(hash) as unknown as Promise<TransactionDetailed>
    }
    getTransactionReceipt(chainId: ChainId, hash: string): Promise<TransactionReceipt> {
        return this.getWeb3(chainId).eth.getTransactionReceipt(hash)
    }
    getTransactionNonce(chainId: ChainId, address: string): Promise<number> {
        return this.getWeb3(chainId).eth.getTransactionCount(address)
    }
    async getTransactionStatus(chainId: ChainId, hash: string): Promise<TransactionStatusType> {
        const receipt = await this.getTransactionReceipt(chainId, hash)
        return getTransactionStatusType(receipt)
    }
    getNativeToken(chainId: ChainId): Promise<FungibleToken<ChainId, SchemaType>> {
        const token = createNativeToken(chainId)
        if (!token) throw new Error('Failed to create native token.')
        return Promise.resolve(token)
    }
    async getFungibleToken(chainId: ChainId, address: string): Promise<FungibleToken<ChainId, SchemaType>> {
        // Native
        if (!address || isNativeTokenAddress(address)) return this.getNativeToken(chainId)

        // ERC20
        const contract = this.getERC20Contract(chainId, address)
        const bytes32Contract = this.getWeb3Contract<ERC20Bytes32>(chainId, address, ERC20Bytes32ABI as AbiItem[])
        const results = await queryClient.fetchQuery({
            staleTime: 600_000,
            queryKey: ['fungibleToken', chainId, address],
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
            chainId,
            address,
            parseStringOrBytes32(name, nameBytes32, 'Unknown Token'),
            parseStringOrBytes32(symbol, symbolBytes32, 'UNKNOWN'),
            typeof decimals === 'string' ? Number.parseInt(decimals ? decimals : '0', 10) : decimals,
        )
    }
    async getNonFungibleTokenOwner(
        chainId: ChainId,
        address: string,
        tokenId: string,
        schema?: SchemaType | undefined,
    ): Promise<string> {
        const actualSchema = schema ?? (await this.getSchemaType(chainId, address))

        // ERC1155
        if (actualSchema === SchemaType.ERC1155) return ''

        // CRYPTOPUNKS
        if (isCryptoPunksContractAddress(address)) {
            const cryptoPunksContract = this.getCryptoPunksContract(chainId, address)
            return (await cryptoPunksContract?.methods.punkIndexToAddress(tokenId).call()) ?? ''
        }

        // ERC721
        const contract = this.getERC721Contract(chainId, address)
        return (await contract?.methods.ownerOf(tokenId).call()) ?? ''
    }
    async getNonFungibleTokenOwnership(
        chainId: ChainId,
        address: string,
        tokenId: string,
        owner: string,
        schema?: SchemaType | undefined,
    ): Promise<boolean> {
        const actualSchema = schema ?? (await this.getSchemaType(chainId, address))

        // ERC1155
        if (actualSchema === SchemaType.ERC1155) {
            const contract = this.getERC1155Contract(chainId, address)
            // the owner has at least 1 token
            return toNumber((await contract?.methods.balanceOf(owner, tokenId).call()) ?? 0) > 0
        }

        // ERC721
        const contract = this.getERC721Contract(chainId, address)
        return isSameAddress(await contract?.methods.ownerOf(tokenId).call(), owner)
    }
    async estimateTransaction(chainId: ChainId, transaction: Transaction, fallback = 21000): Promise<string> {
        try {
            const provider = this.getWeb3Provider(chainId)
            return provider.request<string>({
                method: EthereumMethodType.ETH_ESTIMATE_GAS,
                params: [
                    {
                        ...transaction,
                        value: transaction.value ? toHex(transaction.value) : undefined,
                    },
                ],
            })
        } catch {
            return toHex(fallback)
        }
    }
    callTransaction(chainId: ChainId, transaction: Transaction, overrides?: Transaction): Promise<string> {
        const provider = this.getWeb3Provider(chainId)
        return provider.request<string>({
            method: EthereumMethodType.ETH_CALL,
            params: [new AccountTransaction(transaction).fill(overrides), 'latest'],
        })
    }
    async confirmTransaction(chainId: ChainId, hash: string, signal?: AbortSignal): Promise<TransactionReceipt> {
        const times = 49
        const interval = getAverageBlockDelay(chainId)

        for (let i = 0; i < times; i += 1) {
            if (signal?.aborted) throw new Error(signal.reason)

            try {
                const receipt = await this.getTransactionReceipt(chainId, hash)
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
    replaceTransaction(chainId: ChainId, hash: string, transaction: Transaction): Promise<void> {
        const provider = this.getWeb3Provider(chainId)
        return provider.request<void>({
            method: EthereumMethodType.MASK_REPLACE_TRANSACTION,
            params: [hash, transaction],
        })
    }
    cancelTransaction(chainId: ChainId, hash: string, transaction: Transaction): Promise<void> {
        const provider = this.getWeb3Provider(chainId)
        return provider.request<void>({
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
        })
    }
    async sendSignedTransaction(chainId: ChainId, signed: string): Promise<string> {
        const provider = this.getWeb3Provider(chainId)
        return provider.request<string>({
            method: EthereumMethodType.ETH_SEND_RAW_TRANSACTION,
            params: [signed],
        })
    }
    async getNativeTokenBalance(chainId: ChainId, owner: string): Promise<string> {
        if (!isValidAddress(owner)) return '0'
        return this.getBalance(chainId, owner)
    }
    async getFungibleTokenBalance(
        chainId: ChainId,
        address: string,
        owner: string,
        schema?: SchemaType | undefined,
    ): Promise<string> {
        // Native
        if (!address || isNativeTokenAddress(address)) return this.getNativeTokenBalance(chainId, owner)

        // ERC20
        const contract = this.getERC20Contract(chainId, address)
        return (await contract?.methods.balanceOf(owner).call()) ?? '0'
    }
    async getNonFungibleTokenBalance(
        chainId: ChainId,
        address: string,
        tokenId: string | undefined,
        owner: string,
        schema?: SchemaType | undefined,
    ): Promise<string> {
        const actualSchema = schema ?? (await this.getSchemaType(chainId, address))

        // ERC1155
        if (actualSchema === SchemaType.ERC1155) {
            const contract = this.getERC1155Contract(chainId, address)
            return contract?.methods?.balanceOf(owner, tokenId ?? '').call() ?? '0'
        }

        // ERC721
        const contract = this.getERC721Contract(chainId, address)
        return contract?.methods.balanceOf(owner).call() ?? '0'
    }
    async getNonFungibleToken(
        chainId: ChainId,
        address: string,
        tokenId: string,
        schema?: SchemaType | undefined,
    ): Promise<NonFungibleToken<ChainId, SchemaType>> {
        const actualSchema = schema ?? (await this.getSchemaType(chainId, address))
        const allSettled = await Promise.allSettled([
            this.getNonFungibleTokenMetadata(chainId, address, tokenId, schema),
            this.getNonFungibleTokenContract(chainId, address, schema),
        ])
        const [metadata, contract] = allSettled.map((x) => (x.status === 'fulfilled' ? x.value : undefined)) as [
            NonFungibleTokenMetadata<ChainId>,
            NonFungibleTokenContract<ChainId, SchemaType>,
        ]

        let ownerId: string | undefined

        if (actualSchema !== SchemaType.ERC1155) {
            const contract = this.getERC721Contract(chainId, address)
            try {
                ownerId = await contract?.methods.ownerOf(tokenId).call()
            } catch {}
        }

        return createNonFungibleToken<ChainId, SchemaType>(
            chainId,
            address,
            actualSchema ?? SchemaType.ERC721,
            tokenId,
            ownerId,
            metadata,
            contract,
        )
    }
    async getNonFungibleTokenMetadata(
        chainId: ChainId,
        address: string,
        tokenId?: string | undefined,
        schema?: SchemaType | undefined,
    ): Promise<NonFungibleTokenMetadata<ChainId>> {
        const processURI = (uri: string) => {
            // e.g,
            // address: 0x495f947276749ce646f68ac8c248420045cb7b5e
            // token id: 33445046430196205871873533938903624085962860434195770982901962545689408831489
            if (uri.startsWith('https://api.opensea.io/') && tokenId) return uri.replace('0x{id}', tokenId)

            // add cors header
            return resolveCrossOriginURL(resolveIPFS_URL(uri))!
        }
        const actualSchema = schema ?? (await this.getSchemaType(chainId, address))

        // ERC1155
        if (actualSchema === SchemaType.ERC1155) {
            const contract = this.getERC1155Contract(chainId, address)
            const uri = await contract?.methods.uri(tokenId ?? '').call()
            if (!uri) throw new Error('Failed to read metadata uri.')

            const response = await fetchJSON<Web3BaseAPI.ERC1155Metadata>(processURI(uri))
            return createNonFungibleTokenMetadata(
                chainId,
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
        const contract = this.getERC721Contract(chainId, address)
        const uri = await contract?.methods.tokenURI(tokenId ?? '').call()
        if (!uri) throw new Error('Failed to read metadata uri.')
        const response = await fetchJSON<Web3BaseAPI.ERC721Metadata>(processURI(uri))
        return createNonFungibleTokenMetadata(
            chainId,
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
        chainId: ChainId,
        address: string,
        schema?: SchemaType | undefined,
    ): Promise<NonFungibleTokenContract<ChainId, SchemaType>> {
        const actualSchema = schema ?? (await this.getSchemaType(chainId, address))

        // ERC1155
        if (actualSchema === SchemaType.ERC1155) {
            const contractERC721 = this.getERC721Contract(chainId, address)
            const results = await Promise.allSettled([
                contractERC721?.methods.name().call() ?? EMPTY_STRING,
                contractERC721?.methods.symbol().call() ?? EMPTY_STRING,
            ])

            const [name, symbol] = results.map((result) => (result.status === 'fulfilled' ? result.value : ''))

            return createNonFungibleTokenContract(
                chainId,
                SchemaType.ERC1155,
                address,
                name ?? 'Unknown Token',
                symbol ?? 'UNKNOWN',
            )
        }

        // ERC721
        const contract = this.getERC721Contract(chainId, address)
        const results = await Promise.allSettled([
            contract?.methods.name().call() ?? EMPTY_STRING,
            contract?.methods.symbol().call() ?? EMPTY_STRING,
        ])

        const [name, symbol] = results.map((result) => (result.status === 'fulfilled' ? result.value : ''))

        return createNonFungibleTokenContract<ChainId, SchemaType.ERC721>(
            chainId,
            SchemaType.ERC721,
            address,
            name ?? 'Unknown Token',
            symbol ?? 'UNKNOWN',
        )
    }
    async getNonFungibleTokenCollection(
        chainId: ChainId,
        address: string,
        schema?: SchemaType,
    ): Promise<NonFungibleCollection<ChainId, SchemaType>> {
        const actualSchema = schema ?? (await this.getSchemaType(chainId, address))

        // ERC1155
        if (actualSchema === SchemaType.ERC1155) throw new Error('Not implemented yet.')

        // ERC721
        const contract = this.getERC721Contract(chainId, address)
        const results = await Promise.allSettled([contract?.methods.name().call() ?? EMPTY_STRING])
        const [name] = results.map((result) => (result.status === 'fulfilled' ? result.value : ''))
        return createNonFungibleTokenCollection(chainId, address, name ?? 'Unknown Token', '')
    }
}
