import urlcat from 'urlcat'
import { GasOptionType, toFixed } from '@masknet/web3-shared-base'
import { ChainId, formatGweiToWei, getDeBankConstants, type GasOption } from '@masknet/web3-shared-evm'
import type { GasPriceDictResponse } from '../types.js'
import { DEBANK_OPEN_API } from '../constants.js'
import { fetchSquashedJSON } from '../../helpers/fetchJSON.js'
import type { GasOptionAPI_Base } from '../../entry-types.js'

/**
 * Debank's data might be outdated, like gas price for aurora which requires 1 Gwei at least
 * https://twitter.com/AlexAuroraDev/status/1490353255817302016
 * Once debank fixes it, we will remove this modifier.
 */
function gasModifier(gasDict: GasPriceDictResponse, chain: string) {
    if (chain === getDeBankConstants(ChainId.Aurora).CHAIN_ID) {
        ;(['fast', 'normal', 'slow'] as const).forEach((fieldKey) => {
            const field = gasDict.data[fieldKey]
            field.price = Math.max(field.price, formatGweiToWei(1).toNumber())
        })
    }
    return gasDict
}

export class DeBankGasOptionAPI implements GasOptionAPI_Base.Provider<ChainId, GasOption> {
    async getGasOptions(chainId: ChainId): Promise<Record<GasOptionType, GasOption>> {
        const { CHAIN_ID = '' } = getDeBankConstants(chainId)
        if (!CHAIN_ID) throw new Error('Failed to get gas price.')

        const result = await fetchSquashedJSON<GasPriceDictResponse>(
            urlcat(DEBANK_OPEN_API, '/v1/wallet/gas_market', { chain_id: CHAIN_ID }),
        )
        if (result.error_code !== 0) throw new Error('Failed to get gas price.')

        const responseModified = gasModifier(result, CHAIN_ID)
        return {
            [GasOptionType.FAST]: {
                estimatedSeconds: responseModified.data.fast.estimated_seconds || 15,
                suggestedMaxFeePerGas: toFixed(responseModified.data.fast.price),
                suggestedMaxPriorityFeePerGas: '0',
            },
            [GasOptionType.NORMAL]: {
                estimatedSeconds: responseModified.data.normal.estimated_seconds || 30,
                suggestedMaxFeePerGas: toFixed(responseModified.data.normal.price),
                suggestedMaxPriorityFeePerGas: '0',
            },
            [GasOptionType.SLOW]: {
                estimatedSeconds: responseModified.data.slow.estimated_seconds || 60,
                suggestedMaxFeePerGas: toFixed(responseModified.data.slow.price),
                suggestedMaxPriorityFeePerGas: '0',
            },
        }
    }
}
