import urlcat from 'urlcat'
import { parseInt, uniqBy } from 'lodash-unified'
import { ChainId } from '@masknet/web3-shared-evm'
import type { SecurityAPI } from '..'
import { fetchJSON } from '../helpers'
import { GO_PLUS_LABS_ROOT_URL } from './constants'

export interface SupportedChainResponse {
    id: string
    name: string
}

export class GoPlusLabsAPI implements SecurityAPI.Provider<ChainId> {
    async getTokenSecurity(chainId: ChainId, listOfAddress: string[]) {
        const response = await fetchJSON<{
            code: 0 | 1
            message: 'OK' | string
            result: Record<
                string,
                SecurityAPI.ContractSecurity & SecurityAPI.TokenSecurity & SecurityAPI.TradingSecurity
            >
        }>(
            urlcat(GO_PLUS_LABS_ROOT_URL, 'api/v1/token_security/:id', {
                id: chainId,
                contract_addresses: uniqBy(listOfAddress, (x) => x.toLowerCase()).join(),
            }),
        )

        if (response.code !== 1) return
        return response.result
    }

    async getSupportedChain(): Promise<SecurityAPI.SupportedChain<ChainId>[]> {
        const { code, result } = await fetchJSON<{
            code: 0 | 1
            message: 'OK' | string
            result: SupportedChainResponse[]
        }>(urlcat(GO_PLUS_LABS_ROOT_URL, 'api/v1/supported_chains'))

        if (code !== 1) return []
        return result.map((x) => ({ chainId: parseInt(x.id) ?? ChainId.Mainnet, name: x.name }))
    }
}
