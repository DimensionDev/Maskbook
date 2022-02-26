import urlcat from 'urlcat'
import BigNumber from 'bignumber.js'
import type { Web3Plugin } from '@masknet/plugin-infra'
import type { ChainId } from '@masknet/web3-shared-evm'
import type { GasPriceAPI } from '../types'
import type { EstimateSuggestResponse } from './types'

const METASWAP_API = 'https://gas-api.metaswap.codefi.network/'

export class MetaSwapAPI implements GasPriceAPI.Provider {
    async getGasPrice(chainId: ChainId): Promise<Web3Plugin.GasPrice> {
        const response = await fetch(urlcat(METASWAP_API, '/networks/:chainId/suggestedGasFees', { chainId }))
        const result = (await response.json()) as EstimateSuggestResponse

        return {
            fast: {
                estimatedSeconds: result.high?.minWaitTimeEstimate ?? 0,
                price: new BigNumber(result.high?.suggestedMaxFeePerGas ?? '0').toNumber(),
            },
            normal: {
                estimatedSeconds: result.medium?.minWaitTimeEstimate ?? 0,
                price: new BigNumber(result.medium?.suggestedMaxFeePerGas ?? '0').toNumber(),
            },
            slow: {
                estimatedSeconds: result.low?.minWaitTimeEstimate ?? 0,
                price: new BigNumber(result.low?.suggestedMaxFeePerGas ?? '0').toNumber(),
            },
        }
    }
}
