import urlcat from 'urlcat'
import { GasOptions, GasOptionType } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import type { GasOptionAPI } from '../types'
import type { EstimateSuggestResponse } from './types'

const METASWAP_API = 'https://gas-api.metaswap.codefi.network/'

export class MetaSwapAPI implements GasOptionAPI.Provider<ChainId> {
    async getGasOptions(chainId: ChainId): Promise<GasOptions> {
        const response = await fetch(urlcat(METASWAP_API, '/networks/:chainId/suggestedGasFees', { chainId }))
        const result = (await response.json()) as EstimateSuggestResponse

        return {
            estimatedBaseFee: result.estimatedBaseFee,
            options: {
                [GasOptionType.FAST]: {
                    estimatedSeconds: result.high?.minWaitTimeEstimate ?? 0,
                    suggestedMaxFeePerGas: result.high?.suggestedMaxFeePerGas ?? '0',
                    suggestedMaxPriorityFeePerGas: result.high?.suggestedMaxPriorityFeePerGas ?? '0',
                },
                [GasOptionType.NORMAL]: {
                    estimatedSeconds: result.medium?.minWaitTimeEstimate ?? 0,
                    suggestedMaxFeePerGas: result.medium?.suggestedMaxFeePerGas ?? '0',
                    suggestedMaxPriorityFeePerGas: result.medium?.suggestedMaxPriorityFeePerGas ?? '0',
                },
                [GasOptionType.SLOW]: {
                    estimatedSeconds: result.low?.minWaitTimeEstimate ?? 0,
                    suggestedMaxFeePerGas: result.low?.suggestedMaxFeePerGas ?? '0',
                    suggestedMaxPriorityFeePerGas: result.low?.suggestedMaxPriorityFeePerGas ?? '0',
                },
            },
        }
    }
}
