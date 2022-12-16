import { first, memoize, nth } from 'lodash-es'
import Web3SDK from 'web3'
import type { FeeHistoryResult } from 'web3-eth'
import { FungibleToken, GasOptionType, TransactionStatusType, toFixed } from '@masknet/web3-shared-base'
import {
    AddressType,
    Block,
    ChainId,
    chainResolver,
    GasOption,
    getRPCConstants,
    isValidAddress,
    SchemaType,
    Transaction,
    TransactionReceipt,
} from '@masknet/web3-shared-evm'
import type { GasOptionAPI, Web3BaseAPI } from '../entry-types.js'

const createSDK = memoize((chainId: ChainId) => {
    const RPC_URL = first(getRPCConstants(chainId).RPC_URLS)
    if (!RPC_URL) throw new Error('Failed to create web3 provider.')
    return new Web3SDK(RPC_URL)
})

export class Web3API
    implements Web3BaseAPI.Provider<ChainId, AddressType, SchemaType, Transaction, TransactionReceipt, Block, Web3SDK>
{
    createSDK(chainId: ChainId): Web3SDK {
        return createSDK(chainId)
    }
    getBalance(chainId: ChainId, address: string): Promise<string> {
        return this.createSDK(chainId).eth.getBalance(address)
    }
    getGasPrice(chainId: ChainId): Promise<string> {
        throw new Error('Method not implemented.')
    }
    getCode(chainId: ChainId, address: string): Promise<string> {
        return this.createSDK(chainId).eth.getCode(address)
    }
    async getAddressType(chainId: ChainId, address: string): Promise<AddressType | undefined> {
        if (!isValidAddress(address)) return
        const code = await this.createSDK(chainId).eth.getCode(address)
        return code === '0x' ? AddressType.ExternalOwned : AddressType.Contract
    }
    getSchemaType(chainId: ChainId, address: string): Promise<SchemaType | undefined> {
        throw new Error('Method not implemented.')
    }
    getBlock(chainId: ChainId, noOrId: string | number): Promise<Block> {
        throw new Error('Method not implemented.')
    }
    getBlockNumber(chainid: ChainId): Promise<number> {
        throw new Error('Method not implemented.')
    }
    getBlockTimestamp(chainid: ChainId): Promise<string> {
        throw new Error('Method not implemented.')
    }
    getTransaction(chainId: ChainId, hash: string): Promise<Transaction> {
        throw new Error('Method not implemented.')
    }
    getTransactionReceipt(chainId: ChainId, hash: string): Promise<TransactionReceipt> {
        throw new Error('Method not implemented.')
    }
    getTransactionStatus(chainId: ChainId, hash: string): Promise<TransactionStatusType> {
        throw new Error('Method not implemented.')
    }
    getTransactionNonce(chainId: ChainId, hash: string): Promise<string> {
        throw new Error('Method not implemented.')
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
