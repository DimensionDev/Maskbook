import { first, memoize } from 'lodash-es'
import Web3 from 'web3'
import type { HttpProvider } from 'web3-core'
import type { AbiItem } from 'web3-utils'
import {
    AddressType,
    SchemaType,
    ChainId,
    createContract,
    createWeb3Provider,
    createWeb3Request,
    getRPCConstants,
    isValidAddress,
    Web3Provider,
    TransactionDetailed,
    TransactionReceipt,
    Block,
    isEmptyHex,
    getTransactionStatusType,
} from '@masknet/web3-shared-evm'
import type { FungibleToken, TransactionStatusType } from '@masknet/web3-shared-base'
import type { ERC20 } from '@masknet/web3-contracts/types/ERC20.js'
import type { ERC20Bytes32 } from '@masknet/web3-contracts/types/ERC20Bytes32.js'
import type { ERC165 } from '@masknet/web3-contracts/types/ERC165.js'
import type { ERC721 } from '@masknet/web3-contracts/types/ERC721.js'
import type { ERC1155 } from '@masknet/web3-contracts/types/ERC1155.js'
import ERC20ABI from '@masknet/web3-contracts/abis/ERC20.json'
import ERC165ABI from '@masknet/web3-contracts/abis/ERC165.json'
import ERC20Bytes32ABI from '@masknet/web3-contracts/abis/ERC20Bytes32.json'
import ERC721ABI from '@masknet/web3-contracts/abis/ERC721.json'
import ERC1155ABI from '@masknet/web3-contracts/abis/ERC1155.json'
import type { BaseContract } from '@masknet/web3-contracts/types/types.js'
import type { Web3BaseAPI } from '../../entry-types.js'

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
            TransactionDetailed,
            TransactionReceipt,
            Block,
            Web3Provider,
            Web3
        >
{
    createWeb3(chainId: ChainId) {
        const RPC_URL = first(getRPCConstants(chainId).RPC_URLS)
        if (!RPC_URL) throw new Error('Failed to create web3 provider.')
        return createWeb3SDK(RPC_URL)
    }

    createProvider(chainId: ChainId) {
        const web3 = this.createWeb3(chainId)
        const provider = web3.currentProvider as HttpProvider
        return createWeb3Provider(createWeb3Request(provider.send.bind(provider)))
    }

    private getWeb3Contract<T extends BaseContract>(chainId: ChainId, address: string, ABI: AbiItem[]) {
        const web3 = this.createWeb3(chainId)
        return createContract<T>(web3, address, ABI)
    }

    private getERC20Contract(chainId: ChainId, address: string) {
        return this.getWeb3Contract<ERC20>(chainId, address, ERC20ABI as AbiItem[])
    }

    private getERC721Contract(chainId: ChainId, address: string) {
        return this.getWeb3Contract<ERC721>(chainId, address, ERC721ABI as AbiItem[])
    }

    private getERC1155Contract(chainId: ChainId, address: string) {
        return this.getWeb3Contract<ERC1155>(chainId, address, ERC1155ABI as AbiItem[])
    }

    private getERC165Contract(chainId: ChainId, address: string) {
        return this.getWeb3Contract<ERC165>(chainId, address, ERC165ABI as AbiItem[])
    }

    getBalance(chainId: ChainId, address: string): Promise<string> {
        return this.createWeb3(chainId).eth.getBalance(address)
    }
    getGasPrice(chainId: ChainId): Promise<string> {
        return this.createWeb3(chainId).eth.getGasPrice()
    }
    getCode(chainId: ChainId, address: string): Promise<string> {
        return this.createWeb3(chainId).eth.getCode(address)
    }
    async getAddressType(chainId: ChainId, address: string): Promise<AddressType | undefined> {
        if (!isValidAddress(address)) return
        const code = await this.createWeb3(chainId).eth.getCode(address)
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
        return this.createWeb3(chainId).eth.getBlock(noOrId) as Promise<Block>
    }
    getBlockNumber(chainId: ChainId): Promise<number> {
        return this.createWeb3(chainId).eth.getBlockNumber()
    }
    async getBlockTimestamp(chainId: ChainId): Promise<number> {
        const blockNumber = await this.getBlockNumber(chainId)
        const block = await this.getBlock(chainId, blockNumber)
        return Number.parseInt(block.timestamp, 16)
    }
    getTransaction(chainId: ChainId, hash: string): Promise<TransactionDetailed> {
        return this.createWeb3(chainId).eth.getTransaction(hash) as unknown as Promise<TransactionDetailed>
    }
    getTransactionReceipt(chainId: ChainId, hash: string): Promise<TransactionReceipt> {
        return this.createWeb3(chainId).eth.getTransactionReceipt(hash)
    }
    getTransactionNonce(chainId: ChainId, address: string): Promise<number> {
        return this.createWeb3(chainId).eth.getTransactionCount(address)
    }
    async getTransactionStatus(chainId: ChainId, hash: string): Promise<TransactionStatusType> {
        const receipt = await this.getTransactionReceipt(chainId, hash)
        return getTransactionStatusType(receipt)
    }
    getNativeToken(chainId: ChainId): Promise<FungibleToken<ChainId, SchemaType>> {
        throw new Error('Method not implemented.')
    }
    getFungibleToken(chainId: ChainId, address: string): Promise<FungibleToken<ChainId, SchemaType>> {
        throw new Error('Method not implemented.')
    }
    getNonFungibleTokenOwner(
        chainId: ChainId,
        address: string,
        tokenId: string,
        schema?: SchemaType | undefined,
    ): Promise<string> {
        throw new Error('Method not implemented.')
    }
    getNonFungibleTokenOwnership(
        chainId: ChainId,
        address: string,
        tokenId: string,
        schema?: SchemaType | undefined,
    ): Promise<boolean> {
        throw new Error('Method not implemented.')
    }
}
