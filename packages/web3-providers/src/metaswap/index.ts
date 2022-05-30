import urlcat from 'urlcat'
import { GasOptionType } from '@masknet/web3-shared-base'
import type { ChainId, GasOption } from '@masknet/web3-shared-evm'
import type { GasOptionAPI } from '../types'
import type { EstimateSuggestResponse } from './types'

const METASWAP_API = 'https://gas-api.metaswap.codefi.network/'

export class MetaSwapAPI implements GasOptionAPI.Provider<ChainId, GasOption> {
    async getGasOptions(chainId: ChainId): Promise<Record<GasOptionType, GasOption>> {
        const response = await fetch(urlcat(METASWAP_API, '/networks/:chainId/suggestedGasFees', { chainId }))
        const result = (await response.json()) as EstimateSuggestResponse

        return {
            [GasOptionType.FAST]: {
                estimatedBaseFee: result.estimatedBaseFee ?? '0',
                estimatedSeconds: result.high?.minWaitTimeEstimate ?? 0,
                suggestedMaxFeePerGas: result.high?.suggestedMaxFeePerGas ?? '0',
                suggestedMaxPriorityFeePerGas: result.high?.suggestedMaxPriorityFeePerGas ?? '0',
            },
            [GasOptionType.NORMAL]: {
                estimatedBaseFee: result.estimatedBaseFee ?? '0',
                estimatedSeconds: result.medium?.minWaitTimeEstimate ?? 0,
                suggestedMaxFeePerGas: result.medium?.suggestedMaxFeePerGas ?? '0',
                suggestedMaxPriorityFeePerGas: result.medium?.suggestedMaxPriorityFeePerGas ?? '0',
            },
            [GasOptionType.SLOW]: {
                estimatedBaseFee: result.estimatedBaseFee ?? '0',
                estimatedSeconds: result.low?.minWaitTimeEstimate ?? 0,
                suggestedMaxFeePerGas: result.low?.suggestedMaxFeePerGas ?? '0',
                suggestedMaxPriorityFeePerGas: result.low?.suggestedMaxPriorityFeePerGas ?? '0',
            },
        }
    }
}
