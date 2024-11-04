import { useMemo } from 'react'
import stringify from 'json-stable-stringify'
import { rgbToHex, useTheme } from '@mui/material'
import { TRANSAK_API_KEY_PRODUCTION, TRANSAK_API_KEY_STAGING } from '../constants.js'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import type { TransakConfig } from '../types.js'

const HOST_MAP = {
    production: 'https://global.transak.com',
    development: 'https://staging-global.transak.com',
    test: 'https://development-global.transak.com',
}

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

export function useTransakURL(config?: Partial<TransakConfig>) {
    const theme = useTheme()
    const search = useMemo(() => {
        const config_: TransakConfig = {
            ...DEFAULT_PARAMETERS,
            themeColor: rgbToHex(theme.palette.maskColor.dark).slice(1),
            exchangeScreenTitle:
                config?.walletAddress ? `Buy Crypto to ${formatEthereumAddress(config.walletAddress, 4)}` : void 0,
            ...config,
        }
        const params = new URLSearchParams()
        Object.entries(config_).forEach(([key, value = '']) => params.append(key, String(value)))
        return params.toString()
        // eslint-disable-next-line react-compiler/react-compiler
    }, [theme.palette.primary.main, stringify(config)])
    return `${HOST_MAP[process.env.NODE_ENV]}?${search}`
}
