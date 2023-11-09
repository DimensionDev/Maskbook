import { GasOptionType, toFixed } from '@masknet/web3-shared-base'
import type { ChainId, GasOption } from '@masknet/web3-shared-evm'
import { fetchJSON } from '../helpers/fetchJSON.js'
import type { EstimateSuggestResponse } from './types.js'
import type { BaseGasOptions } from '../entry-types.js'

const ASTAR_API = 'https://gas.astar.network/api/gasnow?network=astar'

class AstarAPI implements BaseGasOptions.Provider<ChainId, GasOption> {
    async getGasOptions(): Promise<Record<GasOptionType, GasOption>> {
        const { data: result } = await fetchJSON<{ data: EstimateSuggestResponse }>(ASTAR_API)

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
            [GasOptionType.CUSTOM]: {
                estimatedSeconds: 0,
                suggestedMaxFeePerGas: '',
                suggestedMaxPriorityFeePerGas: '',
            },
        }
    }
}
export const AstarGas = new AstarAPI()
