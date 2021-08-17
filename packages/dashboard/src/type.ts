export enum RoutePaths {
    Welcome = '/welcome',
    Setup = '/setup',
    SignUp = '/sign-up',
    SignIn = '/sign-in',
    PrivacyPolicy = '/privacy-policy',
    Personas = '/personas',
    Wallets = '/wallets',
    WalletsTransfer = '/wallets/transfer',
    WalletsSwap = '/wallets/swap',
    WalletsRedPacket = '/wallets/red-packet',
    WalletsSell = '/wallets/sell',
    WalletsHistory = '/wallets/history',
    Settings = '/settings',
    Labs = '/labs',
}

export enum MarketTrendProvider {
    COIN_GECKO = 0,
    COIN_MARKET_CAP = 1,
    UNISWAP_INFO = 2,
}
export { TradeProvider } from '@masknet/public-api'
