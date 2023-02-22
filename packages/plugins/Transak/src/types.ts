// Learn more https://docs.transak.com/docs/query-parameters
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
    excludeFiatCurrencies?: string
}
