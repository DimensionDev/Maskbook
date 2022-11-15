import type { TokenAPI } from '../index.js'
import { fetchJSON } from '../helpers.js'
import { TOKEN_VIEW_ROOT_URL, INTERVAL } from './constants.js'

export class TokenViewAPI implements TokenAPI.Provider {
    async getTokenInfo(tokenSymbol: string) {
        const response = await fetchJSON<{ items: TokenAPI.TokenInfo[] } | undefined>(
            `${TOKEN_VIEW_ROOT_URL}&symbols=${tokenSymbol}&interval=${INTERVAL}`,
        )

        return response?.items?.[0]
    }
}
