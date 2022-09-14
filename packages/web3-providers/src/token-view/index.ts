import urlcat from 'urlcat'
import type { TokenAPI } from '../index.js'
import { fetchJSON } from '../helpers.js'
import { TOKEN_VIEW_ROOT_URL, API_KEY, INTERVAL } from './constants.js'

export class TokenViewAPI implements TokenAPI.Provider {
    async getTokenInfo(tokenSymbol: string) {
        const response = await fetchJSON<TokenAPI.TokenInfo[] | undefined>(
            urlcat(TOKEN_VIEW_ROOT_URL, {
                key: API_KEY,
                ids: tokenSymbol,
                interval: INTERVAL,
            }),
        )

        return response?.[0]
    }
}
