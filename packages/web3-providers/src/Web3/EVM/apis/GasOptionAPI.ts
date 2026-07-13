import { nth } from 'lodash-es'
import { GasOptionType, toFixed } from '@masknet/web3-shared-base'
import type { ChainId, GasOption } from '@masknet/web3-shared-evm'
import { EVMWeb3Readonly } from './ConnectionReadonlyAPI.js'
import type { BaseGasOptions } from '../../../entry-types.js'
import { EVMChainResolver } from './ResolverAPI.js'

class GasOptionAPI implements BaseGasOptions.Provider<ChainId, GasOption> {
    getGasLimit(chainId: ChainId) {
        return [
            EVMChainResolver.minGasLimit(chainId),
            EVMChainResolver.defaultGasLimit(chainId),
            EVMChainResolver.maxGasLimit(chainId),
        ] as const
    }
    static HISTORICAL_BLOCKS = 4

    private avg(arr: bigint[]) {
        const sum = arr.reduce((a, v) => a + v, 0n)
        return sum / BigInt(arr.length || 1)
    }

    private formatFeeHistory(result: {
        oldestBlock: bigint
        baseFeePerGas: bigint[]
        gasUsedRatio: number[]
        reward?: bigint[][]
    }) {
        let index = 0
        const blockNumber = Number(result.oldestBlock)
        const blocks = []

        while (index < GasOptionAPI.HISTORICAL_BLOCKS) {
            blocks.push({
                number: blockNumber + index,
                baseFeePerGas: nth(result.baseFeePerGas, index) ?? 0n,
                gasUsedRatio: nth(result.gasUsedRatio, index) || 0,
                priorityFeePerGas: nth(result.reward, index) ?? [0n, 0n, 0n],
            })
            index += 1
        }
        return blocks
    }

    private async getGasOptionsForEIP1559(chainId: ChainId): Promise<Record<GasOptionType, GasOption>> {
        const history = await EVMWeb3Readonly.getFeeHistory(
            { chainId },
            {
                blockCount: GasOptionAPI.HISTORICAL_BLOCKS,
                blockTag: 'pending',
                rewardPercentiles: [25, 50, 75],
            },
        )
        const blocks = this.formatFeeHistory(history)
        const slow = this.avg(blocks.map((b) => b.priorityFeePerGas[0]))
        const normal = this.avg(blocks.map((b) => b.priorityFeePerGas[1]))
        const fast = this.avg(blocks.map((b) => b.priorityFeePerGas[2]))

        // get the base fee per gas from the latest block
        const block = await EVMWeb3Readonly.getBlockTag('latest', {
            chainId,
        })
        const baseFeePerGas = block?.baseFeePerGas ?? 0n

        return {
            [GasOptionType.FAST]: {
                estimatedBaseFee: toFixed(baseFeePerGas.toString()),
                estimatedSeconds: 0,
                baseFeePerGas: toFixed(baseFeePerGas.toString()),
                suggestedMaxFeePerGas: toFixed((baseFeePerGas + fast).toString()),
                suggestedMaxPriorityFeePerGas: toFixed(fast.toString()),
            },
            [GasOptionType.NORMAL]: {
                estimatedBaseFee: toFixed(baseFeePerGas.toString()),
                estimatedSeconds: 0,
                baseFeePerGas: toFixed(baseFeePerGas.toString()),
                suggestedMaxFeePerGas: toFixed((baseFeePerGas + normal).toString()),
                suggestedMaxPriorityFeePerGas: toFixed(normal.toString()),
            },
            [GasOptionType.SLOW]: {
                estimatedBaseFee: toFixed(baseFeePerGas.toString()),
                estimatedSeconds: 0,
                baseFeePerGas: toFixed(baseFeePerGas.toString()),
                suggestedMaxFeePerGas: toFixed((baseFeePerGas + slow).toString()),
                suggestedMaxPriorityFeePerGas: toFixed(slow.toString()),
            },
            [GasOptionType.CUSTOM]: {
                estimatedSeconds: 0,
                suggestedMaxFeePerGas: '',
                suggestedMaxPriorityFeePerGas: '',
            },
        }
    }

    private async getGasOptionsForPriorEIP1559(chainId: ChainId): Promise<Record<GasOptionType, GasOption>> {
        const gasPrice = await EVMWeb3Readonly.getGasPrice({
            chainId,
        })
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
            [GasOptionType.CUSTOM]: {
                estimatedSeconds: 0,
                suggestedMaxFeePerGas: '',
                suggestedMaxPriorityFeePerGas: '',
            },
        }
    }

    async getGasOptions(chainId: ChainId): Promise<Record<GasOptionType, GasOption>> {
        return EVMChainResolver.isFeatureSupported(chainId, 'EIP1559') ?
                this.getGasOptionsForEIP1559(chainId)
            :   this.getGasOptionsForPriorEIP1559(chainId)
    }
}
export const GasOptions = new GasOptionAPI()
