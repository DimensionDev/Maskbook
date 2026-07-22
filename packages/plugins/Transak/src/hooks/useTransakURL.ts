import { TRANSAK_API_KEY_PRODUCTION, TRANSAK_API_KEY_STAGING } from '../constants.js'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import type { TransakConfig } from '../types.js'

const DEFAULT_PARAMETERS: TransakConfig = {
    apiKey: process.env.NODE_ENV === 'production' ? TRANSAK_API_KEY_PRODUCTION : TRANSAK_API_KEY_STAGING,
    environment: process.env.NODE_ENV === 'production' ? 'PRODUCTION' : 'STAGING',
    defaultFiatAmount: 100,
    defaultCryptoCurrency: 'ETH',
    hostURL: location.origin,
    redirectURL: location.origin,
    widgetWidth: '100%',
    widgetHeight: '630px',
    hideMenu: false,
    excludeFiatCurrencies: 'KRW',
}

// Query params shared by the legacy direct URL and the session proxy.
export function buildTransakSearchParams(config?: Partial<TransakConfig>, themeColor?: string): URLSearchParams {
    const config_: TransakConfig = {
        ...DEFAULT_PARAMETERS,
        referrerDomain: location.origin,
        themeColor,
        exchangeScreenTitle:
            config?.walletAddress ? `Buy Crypto to ${formatEthereumAddress(config.walletAddress, 4)}` : undefined,
        ...config,
    }
    const params = new URLSearchParams()
    Object.entries(config_).forEach(([key, value]) => {
        if (value === undefined || value === null) return
        params.append(key, String(value))
    })
    return params
}
