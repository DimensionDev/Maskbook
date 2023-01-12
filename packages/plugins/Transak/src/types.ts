// Learn more https://integrate.transak.com/Query-Parameters-9ec523df3b874ec58cef4fa3a906f238
export interface TransakConfig {
    apiKey: string
    environment: 'STAGING' | 'PRODUCTION'
    networks?: string
    defaultFiatAmount?: number
    defaultCryptoCurrency?: string
    walletAddress?: string
    themeColor?: string
    countryCode?: string
    fiatCurrency?: string
    email?: string
    redirectURL: string
    hostURL: string
    widgetHeight?: string
    widgetWidth?: string
    hideMenu?: boolean
    exchangeScreenTitle?: string
}
