import { GasOptionType } from '@masknet/web3-shared-base'
import type { ChainId, GasOption } from '@masknet/web3-shared-evm'
import type { GasOptionAPI } from '../types/index.js'
import type { EstimateSuggestResponse } from './types.js'
import { formatWeiToGwei } from '@masknet/web3-shared-evm'

const ASTAR_API = 'https://gas.astar.network/api/gasnow?network=astar'

export class AstarAPI implements GasOptionAPI.Provider<ChainId, GasOption> {
    async getGasOptions(chainId: ChainId): Promise<Record<GasOptionType, GasOption>> {
        const response = await fetch(ASTAR_API)
        const gas = await response.json()

        const result = gas.data as EstimateSuggestResponse
        const { priorityFeePerGas } = result.eip1559

        return {
            [GasOptionType.FAST]: {
                estimatedBaseFee: formatWeiToGwei(result.eip1559.baseFeePerGas).toString() ?? '0',
                estimatedSeconds: 15,
                suggestedMaxFeePerGas: formatWeiToGwei(result.fast ?? 0).toString(),
                suggestedMaxPriorityFeePerGas: formatWeiToGwei(priorityFeePerGas.fast).toString() ?? '0',
            },
            [GasOptionType.NORMAL]: {
                estimatedBaseFee: formatWeiToGwei(result.eip1559.baseFeePerGas).toString() ?? '0',
                estimatedSeconds: 30,
                suggestedMaxFeePerGas: formatWeiToGwei(result.average ?? 0).toString(),
                suggestedMaxPriorityFeePerGas: formatWeiToGwei(priorityFeePerGas.average).toString() ?? '0',
            },
            [GasOptionType.SLOW]: {
                estimatedBaseFee: formatWeiToGwei(result.eip1559.baseFeePerGas).toString() ?? '0',
                estimatedSeconds: 60,
                suggestedMaxFeePerGas: formatWeiToGwei(result.slow ?? 0).toString(),
                suggestedMaxPriorityFeePerGas: formatWeiToGwei(priorityFeePerGas.slow).toString() ?? '0',
            },
        }
    }
}
