import urlcat from 'urlcat'
import type { TokenAPI } from '..'
import { fetchJSON } from '../helpers'
import { TOKEN_VIEW_ROOT_URL, API_KEY, INTERVAL } from './constants'

export class TokenViewAPI implements TokenAPI.Provider {
    async getTokenInfo(tokenSymbol: string) {
        const response = await fetchJSON<TokenAPI.tokenInfo[]>(
            urlcat(TOKEN_VIEW_ROOT_URL, {
                key: API_KEY,
                ids: tokenSymbol,
                interval: INTERVAL,
            }),
        )

        return response?.[0]
    }
}
