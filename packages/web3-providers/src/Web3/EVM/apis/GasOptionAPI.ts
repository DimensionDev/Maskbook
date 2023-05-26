import { nth } from 'lodash-es'
import type { FeeHistoryResult } from 'web3-eth'
import { GasOptionType, toFixed } from '@masknet/web3-shared-base'
import { type ChainId, chainResolver, type GasOption } from '@masknet/web3-shared-evm'
import { ConnectionAPI } from './ConnectionAPI.js'
import type { GasOptionAPI_Base } from '../../../entry-types.js'

export class GasOptionAPI implements GasOptionAPI_Base.Provider<ChainId, GasOption> {
    private Web3 = new ConnectionAPI()

    static HISTORICAL_BLOCKS = 4

    private avg(arr: number[]) {
        const sum = arr.reduce((a, v) => a + v)
        return Math.round(sum / arr.length)
    }

    private formatFeeHistory(result: FeeHistoryResult) {
        let index = 0
        const blockNumber = Number(result.oldestBlock)
        const blocks = []

        while (index < GasOptionAPI.HISTORICAL_BLOCKS) {
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
        const web3 = this.Web3.getWeb3({ chainId })
        const history = await web3.eth.getFeeHistory(GasOptionAPI.HISTORICAL_BLOCKS, 'pending', [25, 50, 75])
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
        const web3 = this.Web3.getWeb3({
            chainId,
        })
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
