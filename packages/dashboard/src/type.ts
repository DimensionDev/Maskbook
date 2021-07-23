export enum RoutePaths {
    Welcome = '/welcome',
    Setup = '/setup',
    SignUp = '/sign-up',
    Login = '/login',
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
    COIN_GECKO,
    COIN_MARKET_CAP,
    UNISWAP_INFO,
}

export enum TradeProvider {
    UNISWAP,
    ZRX, // 0x
    // ONE_INCH,
    SUSHISWAP,
    SASHIMISWAP,
    BALANCER,
    QUICKSWAP,
    PANCAKESWAP,
}
