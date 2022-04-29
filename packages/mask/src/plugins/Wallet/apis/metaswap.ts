import type { ChainId } from '@masknet/web3-shared-evm'
import urlcat from 'urlcat'
import type { EstimateSuggestResponse } from '../types/metaswap'

const METASWAP_API = 'https://gas-api.metaswap.codefi.network/'

export async function getSuggestedGasFees(chainId: ChainId) {
    if (chainId) {
        const response = await fetch(urlcat(METASWAP_API, '/networks/:chainId/suggestedGasFees', { chainId }))
        return (await response.json()) as EstimateSuggestResponse
    }
    return undefined
}
