import urlcat from 'urlcat'
import { GasOptionType } from '@masknet/web3-shared-base'
import { type ChainId, formatGweiToWei, type GasOption, isValidChainId } from '@masknet/web3-shared-evm'
import type { EstimateSuggestResponse } from './types.js'
import type { BaseGasOptions } from '../entry-types.js'
import { fetchJSON } from '../helpers/fetchJSON.js'

const METASWAP_API = 'https://gas-api.metaswap.codefi.network/'

function formatAmountAsWei(amount = '0') {
    return formatGweiToWei(amount).toFixed()
}

class MetaSwapAPI implements BaseGasOptions.Provider<ChainId, GasOption> {
    async getGasOptions(chainId: ChainId): Promise<Record<GasOptionType, GasOption> | undefined> {
        if (!isValidChainId(chainId)) return
        const result = await fetchJSON<EstimateSuggestResponse>(
            urlcat(METASWAP_API, '/networks/:chainId/suggestedGasFees', { chainId }),
        )

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
            [GasOptionType.CUSTOM]: {
                estimatedSeconds: 0,
                suggestedMaxFeePerGas: '',
                suggestedMaxPriorityFeePerGas: '',
            },
        }
    }
}
export const MetaSwap = new MetaSwapAPI()
