import { GasOptionType } from '@masknet/web3-shared-base'
import type { ChainId, GasOption } from '@masknet/web3-shared-evm'
import type { GasOptionAPI } from '../types'
import type { EstimateSuggestResponse } from './types'
import Web3 from 'web3'

const ASTAR_API = 'https://gas.astar.network/api/gasnow?network=astar'

export class AstarAPI implements GasOptionAPI.Provider<ChainId, GasOption> {
    async getGasOptions(chainId: ChainId): Promise<Record<GasOptionType, GasOption>> {
        const response = await fetch(ASTAR_API)
        const gas = await response.json()
        const result = (await gas.data) as EstimateSuggestResponse

        const { tip } = result
        const { priorityFeePerGas } = result.eip1559

        return {
            [GasOptionType.FAST]: {
                estimatedBaseFee: formatWeiToGwei(result.eip1559.baseFeePerGas) ?? '0',
                estimatedSeconds: result.timestamp ?? 0,
                suggestedMaxFeePerGas: tip.fast ?? '0',
                suggestedMaxPriorityFeePerGas: formatWeiToGwei(priorityFeePerGas.fast) ?? '0',
            },
            [GasOptionType.NORMAL]: {
                estimatedBaseFee: result.eip1559.baseFeePerGas ?? '0',
                estimatedSeconds: result.timestamp ?? 0,
                suggestedMaxFeePerGas: tip.average ?? '0',
                suggestedMaxPriorityFeePerGas: priorityFeePerGas.average ?? '0',
            },
            [GasOptionType.SLOW]: {
                estimatedBaseFee: formatWeiToGwei(result.estimatedBaseFee) ?? '0',
                estimatedSeconds: result.timestamp ?? 0,
                suggestedMaxFeePerGas: tip.slow ?? '0',
                suggestedMaxPriorityFeePerGas: formatWeiToGwei(priorityFeePerGas.slow) ?? '0',
            },
        }
    }
}

export function formatWeiToGwei(value: string): string {
    const convert = Web3.utils.fromWei(value, 'Gwei')
    return convert
}
