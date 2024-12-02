import urlcat from 'urlcat'
import { GasOptionType, toFixed } from '@masknet/web3-shared-base'
import { type ChainId, type GasOption } from '@masknet/web3-shared-evm'
import type { GasPriceResponse } from '../types.js'
import { DEBANK_OPEN_API } from '../constants.js'
import { fetchSquashedJSON } from '../../helpers/fetchJSON.js'
import type { BaseGasOptions } from '../../entry-types.js'
import { getDebankChain } from '../helpers.js'

class DeBankGasOptionAPI implements BaseGasOptions.Provider<ChainId, GasOption> {
    async getGasOptions(chainId: ChainId): Promise<Record<GasOptionType, GasOption>> {
        const CHAIN_ID = getDebankChain(chainId)
        if (!CHAIN_ID) throw new Error('Failed to get gas price.')

        const result = await fetchSquashedJSON<GasPriceResponse>(
            urlcat(DEBANK_OPEN_API, '/v1/wallet/gas_market', { chain_id: CHAIN_ID }),
        )
        if (!result.length) throw new Error('Failed to get gas price.')

        const fast = result.find((x) => x.level === 'fast')
        const normal = result.find((x) => x.level === 'normal')
        const slow = result.find((x) => x.level === 'slow')
        return {
            [GasOptionType.FAST]: {
                estimatedSeconds: fast?.estimated_seconds || 15,
                suggestedMaxFeePerGas: toFixed(fast!.price),
                suggestedMaxPriorityFeePerGas: '0',
            },
            [GasOptionType.NORMAL]: {
                estimatedSeconds: normal?.estimated_seconds || 30,
                suggestedMaxFeePerGas: toFixed(normal!.price),
                suggestedMaxPriorityFeePerGas: '0',
            },
            [GasOptionType.SLOW]: {
                estimatedSeconds: slow?.estimated_seconds || 60,
                suggestedMaxFeePerGas: toFixed(slow!.price),
                suggestedMaxPriorityFeePerGas: '0',
            },
            [GasOptionType.CUSTOM]: {
                estimatedSeconds: 0,
                suggestedMaxFeePerGas: '',
                suggestedMaxPriorityFeePerGas: '',
            },
        }
    }
}
export const DeBankGasOption = new DeBankGasOptionAPI()
