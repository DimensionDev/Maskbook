import { uniqBy } from 'lodash-unified'
import urlcat from 'urlcat'
import type { SecurityAPI } from '..'
import { fetchJSON } from '../helpers'
import { GO_PLUS_LABS_ROOT_URL } from './constants'

export class GoPlusLabsAPI implements SecurityAPI.Provider {
    async getTokenSecurity(chainId: number, listOfAddress: string[]) {
        const response = await fetchJSON<{
            code: 0 | 1
            message: 'OK' | string
            result: Record<string, SecurityAPI.ContractSecurity & SecurityAPI.TokenSecurity>
        }>(
            urlcat(GO_PLUS_LABS_ROOT_URL, 'api/v1/token_security/:id', {
                id: chainId,
                contract_addresses: uniqBy(listOfAddress, (x) => x.toLowerCase()).join(),
            }),
        )

        if (response.code !== 1) return
        return response.result
    }
}
