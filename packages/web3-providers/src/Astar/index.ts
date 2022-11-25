import { GasOptionType, toFixed } from '@masknet/web3-shared-base'
import type { ChainId, GasOption } from '@masknet/web3-shared-evm'
import type { GasOptionAPI } from '../types/index.js'
import type { EstimateSuggestResponse } from './types.js'

const ASTAR_API = 'https://gas.astar.network/api/gasnow?network=astar'

export class AstarAPI implements GasOptionAPI.Provider<ChainId, GasOption> {
    async getGasOptions(chainId: ChainId): Promise<Record<GasOptionType, GasOption>> {
        const response = await fetch(ASTAR_API)
        const gas = await response.json()

        const result = gas.data as EstimateSuggestResponse
        const { priorityFeePerGas } = result.eip1559

        return {
            [GasOptionType.FAST]: {
                estimatedBaseFee: toFixed(result.eip1559.baseFeePerGas),
                estimatedSeconds: 15,
                suggestedMaxFeePerGas: toFixed(result.fast ?? 0),
                suggestedMaxPriorityFeePerGas: toFixed(priorityFeePerGas.fast),
            },
            [GasOptionType.NORMAL]: {
                estimatedBaseFee: toFixed(result.eip1559.baseFeePerGas),
                estimatedSeconds: 30,
                suggestedMaxFeePerGas: toFixed(result.average ?? 0),
                suggestedMaxPriorityFeePerGas: toFixed(priorityFeePerGas.average),
            },
            [GasOptionType.SLOW]: {
                estimatedBaseFee: toFixed(result.eip1559.baseFeePerGas),
                estimatedSeconds: 60,
                suggestedMaxFeePerGas: toFixed(result.slow ?? 0),
                suggestedMaxPriorityFeePerGas: toFixed(priorityFeePerGas.slow),
            },
        }
    }
}
