import { first, memoize, nth } from 'lodash-es'
import Web3 from 'web3'
import type { FeeHistoryResult } from 'web3-eth'
import type { AbiItem } from 'web3-utils'
import { FungibleToken, GasOptionType, TransactionStatusType, toFixed } from '@masknet/web3-shared-base'
import {
    AddressType,
    Block,
    ChainId,
    chainResolver,
    createContract,
    GasOption,
    getRPCConstants,
    getTransactionStatusType,
    isEmptyHex,
    isValidAddress,
    SchemaType,
    TransactionDetailed,
    TransactionReceipt,
} from '@masknet/web3-shared-evm'
import type { GasOptionAPI, Web3BaseAPI } from '../entry-types.js'
import type { BaseContract } from '@masknet/web3-contracts/types/types.js'
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

const createSDK = memoize((chainId: ChainId) => {
    const RPC_URL = first(getRPCConstants(chainId).RPC_URLS)
    if (!RPC_URL) throw new Error('Failed to create web3 provider.')
    return new Web3(RPC_URL)
})

export class Web3API
    implements
        Web3BaseAPI.Provider<ChainId, AddressType, SchemaType, TransactionDetailed, TransactionReceipt, Block, Web3>
{
    private getWeb3Contract<T extends BaseContract>(chainId: ChainId, address: string, ABI: AbiItem[]) {
        const web3 = this.createSDK(chainId)
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

    createSDK(chainId: ChainId): Web3 {
        return createSDK(chainId)
    }
    getBalance(chainId: ChainId, address: string): Promise<string> {
        return this.createSDK(chainId).eth.getBalance(address)
    }
    getGasPrice(chainId: ChainId): Promise<string> {
        return this.createSDK(chainId).eth.getGasPrice()
    }
    getCode(chainId: ChainId, address: string): Promise<string> {
        return this.createSDK(chainId).eth.getCode(address)
    }
    async getAddressType(chainId: ChainId, address: string): Promise<AddressType | undefined> {
        if (!isValidAddress(address)) return
        const code = await this.createSDK(chainId).eth.getCode(address)
        return code === '0x' ? AddressType.ExternalOwned : AddressType.Contract
    }
    async getSchemaType(chainId: ChainId, address: string): Promise<SchemaType | undefined> {
        const ERC165_INTERFACE_ID = '0x01ffc9a7'
        const EIP5516_INTERFACE_ID = '0x8314f22b'
        const EIP5192_INTERFACE_ID = '0xb45a3c0e'
        const ERC721_INTERFACE_ID = '0x80ac58cd'
        const ERC1155_INTERFACE_ID = '0xd9b67a26'

        try {
            const erc165Contract = await this.getWeb3Contract<ERC165>(chainId, address, ERC165ABI as AbiItem[])

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
        return this.createSDK(chainId).eth.getBlock(noOrId) as Promise<Block>
    }
    getBlockNumber(chainId: ChainId): Promise<number> {
        return this.createSDK(chainId).eth.getBlockNumber()
    }
    async getBlockTimestamp(chainId: ChainId): Promise<number> {
        const blockNumber = await this.getBlockNumber(chainId)
        const block = await this.getBlock(chainId, blockNumber)
        return Number.parseInt(block.timestamp, 16)
    }
    getTransaction(chainId: ChainId, hash: string): Promise<TransactionDetailed | null> {
        return this.createSDK(chainId).eth.getTransaction(hash) as unknown as Promise<TransactionDetailed | null>
    }
    getTransactionReceipt(chainId: ChainId, hash: string): Promise<TransactionReceipt> {
        return this.createSDK(chainId).eth.getTransactionReceipt(hash)
    }
    getTransactionNonce(chainId: ChainId, address: string): Promise<number> {
        return this.createSDK(chainId).eth.getTransactionCount(address)
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

export class Web3GasOptionAPI implements GasOptionAPI.Provider<ChainId, GasOption> {
    static HISTORICAL_BLOCKS = 4

    private web3 = new Web3API()

    private avg(arr: number[]) {
        // eslint-disable-next-line unicorn/no-array-reduce
        const sum = arr.reduce((a, v) => a + v)
        return Math.round(sum / arr.length)
    }

    private formatFeeHistory(result: FeeHistoryResult) {
        let index = 0
        const blockNumber = Number(result.oldestBlock)
        const blocks = []

        while (index < Web3GasOptionAPI.HISTORICAL_BLOCKS) {
            blocks.push({
                number: blockNumber + index,
                baseFeePerGas: Number.parseInt(nth(result.baseFeePerGas, index) ?? '0', 16),
                gasUsedRatio: nth(result.gasUsedRatio, index) || 0,
                priorityFeePerGas:
                    nth(result.reward, index)?.map((x) => Number.parseInt(x, 16)) ??
                    Array.from<number>({ length: 3 }).fill(0),
            })
            index += 1
        }
        return blocks
    }

    private async getGasOptionsForEIP1559(chainId: ChainId): Promise<Record<GasOptionType, GasOption>> {
        const web3 = this.web3.createSDK(chainId)
        const history = await web3.eth.getFeeHistory(Web3GasOptionAPI.HISTORICAL_BLOCKS, 'pending', [25, 50, 75])
        const blocks = this.formatFeeHistory(history)
        const slow = this.avg(blocks.map((b) => b.priorityFeePerGas[0]))
        const normal = this.avg(blocks.map((b) => b.priorityFeePerGas[1]))
        const fast = this.avg(blocks.map((b) => b.priorityFeePerGas[2]))

        // get the base fee per gas from the latest block
        const block = await web3.eth.getBlock('latest')
        const baseFeePerGas = block?.baseFeePerGas ?? 0

        return {
            [GasOptionType.FAST]: {
                estimatedBaseFee: toFixed(baseFeePerGas),
                estimatedSeconds: 0,
                baseFeePerGas: toFixed(baseFeePerGas),
                suggestedMaxFeePerGas: toFixed(baseFeePerGas + fast),
                suggestedMaxPriorityFeePerGas: toFixed(fast),
            },
            [GasOptionType.NORMAL]: {
                estimatedBaseFee: toFixed(baseFeePerGas),
                estimatedSeconds: 0,
                baseFeePerGas: toFixed(baseFeePerGas),
                suggestedMaxFeePerGas: toFixed(baseFeePerGas + normal),
                suggestedMaxPriorityFeePerGas: toFixed(normal),
            },
            [GasOptionType.SLOW]: {
                estimatedBaseFee: toFixed(baseFeePerGas),
                estimatedSeconds: 0,
                baseFeePerGas: toFixed(baseFeePerGas),
                suggestedMaxFeePerGas: toFixed(baseFeePerGas + slow),
                suggestedMaxPriorityFeePerGas: toFixed(slow),
            },
        }
    }

    private async getGasOptionsForPriorEIP1559(chainId: ChainId): Promise<Record<GasOptionType, GasOption>> {
        const web3 = this.web3.createSDK(chainId)
        const gasPrice = await web3.eth.getGasPrice()
        return {
            [GasOptionType.FAST]: {
                estimatedBaseFee: '0',
                estimatedSeconds: 15,
                suggestedMaxFeePerGas: toFixed(gasPrice),
                suggestedMaxPriorityFeePerGas: '0',
            },
            [GasOptionType.NORMAL]: {
                estimatedBaseFee: '0',
                estimatedSeconds: 30,
                suggestedMaxFeePerGas: toFixed(gasPrice),
                suggestedMaxPriorityFeePerGas: '0',
            },
            [GasOptionType.SLOW]: {
                estimatedBaseFee: '0',
                estimatedSeconds: 60,
                suggestedMaxFeePerGas: toFixed(gasPrice),
                suggestedMaxPriorityFeePerGas: '0',
            },
        }
    }

    async getGasOptions(chainId: ChainId): Promise<Record<GasOptionType, GasOption>> {
        if (chainResolver.isSupport(chainId, 'EIP1559')) return this.getGasOptionsForEIP1559(chainId)
        else return this.getGasOptionsForPriorEIP1559(chainId)
    }
}
