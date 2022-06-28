import urlcat from 'urlcat'
import { GasOptionType } from '@masknet/web3-shared-base'
import type { ChainId, GasOption } from '@masknet/web3-shared-evm'
import type { GasOptionAPI } from '../types'
import type { EstimateSuggestResponse } from './types'

const ASTAR_API = 'https://gas.astar.network/'

export class AstarAPI implements GasOptionAPI.Provider<ChainId, GasOption> {
    async getGasOptions(): Promise<Record<GasOptionType, GasOption>> {
        const response = await fetch(urlcat(ASTAR_API, '/api/gasnow?network=astar'))
        const result = (await response.json()) as EstimateSuggestResponse

        return {
            [GasOptionType.FAST]: {
                estimatedBaseFee: result.eip1559.baseFeePerGas ?? '0',
                estimatedSeconds: result.timestamp ?? 0,
                suggestedMaxFeePerGas: result.tip.fast ?? '0',
                suggestedMaxPriorityFeePerGas: result.eip1559.priorityFeePerGas.fast ?? '0',
            },
            [GasOptionType.NORMAL]: {
                estimatedBaseFee: result.eip1559.baseFeePerGas ?? '0',
                estimatedSeconds: result.timestamp ?? 0,
                suggestedMaxFeePerGas: result.tip.average ?? '0',
                suggestedMaxPriorityFeePerGas: result.eip1559.priorityFeePerGas.average ?? '0',
            },
            [GasOptionType.SLOW]: {
                estimatedBaseFee: result.estimatedBaseFee ?? '0',
                estimatedSeconds: result.timestamp ?? 0,
                suggestedMaxFeePerGas: result.tip.slow ?? '0',
                suggestedMaxPriorityFeePerGas: result.eip1559.priorityFeePerGas.slow ?? '0',
            },
        }
    }
}
