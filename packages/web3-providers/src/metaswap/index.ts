import urlcat from 'urlcat'
import { GasOptionType } from '@masknet/web3-shared-base'
import { ChainId, formatGweiToWei, GasOption } from '@masknet/web3-shared-evm'
import type { GasOptionAPI } from '../types/index.js'
import type { EstimateSuggestResponse } from './types.js'

const METASWAP_API = 'https://gas-api.metaswap.codefi.network/'

function formatAmountAsWei(amount = '0') {
    return formatGweiToWei(amount).toFixed()
}

export class MetaSwapAPI implements GasOptionAPI.Provider<ChainId, GasOption> {
    async getGasOptions(chainId: ChainId): Promise<Record<GasOptionType, GasOption> | undefined> {
        if (!chainId) return
        const response = await global.r2d2Fetch(
            urlcat(METASWAP_API, '/networks/:chainId/suggestedGasFees', { chainId }),
        )
        const result = (await response.json()) as EstimateSuggestResponse

        return {
            [GasOptionType.FAST]: {
                estimatedBaseFee: formatAmountAsWei(result.estimatedBaseFee),
                estimatedSeconds: 15,
                baseFeePerGas: formatAmountAsWei(result.estimatedBaseFee),
                suggestedMaxFeePerGas: formatAmountAsWei(result.high?.suggestedMaxFeePerGas),
                suggestedMaxPriorityFeePerGas: formatAmountAsWei(result.high?.suggestedMaxPriorityFeePerGas),
            },
            [GasOptionType.NORMAL]: {
                estimatedBaseFee: formatAmountAsWei(result.estimatedBaseFee),
                estimatedSeconds: 30,
                baseFeePerGas: formatAmountAsWei(result.estimatedBaseFee),
                suggestedMaxFeePerGas: formatAmountAsWei(result.medium?.suggestedMaxFeePerGas),
                suggestedMaxPriorityFeePerGas: formatAmountAsWei(result.medium?.suggestedMaxPriorityFeePerGas),
            },
            [GasOptionType.SLOW]: {
                estimatedBaseFee: formatAmountAsWei(result.estimatedBaseFee),
                estimatedSeconds: 60,
                baseFeePerGas: formatAmountAsWei(result.estimatedBaseFee),
                suggestedMaxFeePerGas: formatAmountAsWei(result.low?.suggestedMaxFeePerGas),
                suggestedMaxPriorityFeePerGas: formatAmountAsWei(result.low?.suggestedMaxPriorityFeePerGas),
            },
        }
    }
}
