export const enum RoutePaths {
    Trade = '/trade',
    History = '/history',
    Confirm = '/confirm',
    BridgeConfirm = '/bridge-confirm',
    Transaction = '/transaction',
    Exit = '/exit',
    SelectLiquidity = '/select-liquidity',
    Slippage = '/slippage',
    QuoteRoute = '/quote-route',
    BridgeQuoteRoute = '/bridge-quote-route',
    TradingRoute = '/trading-route',
    NetworkFee = '/network-fee',
}

export const DEFAULT_SLIPPAGE = '0.5'

export const QUOTE_STALE_DURATION = 20_000

export const bridges = [
    {
        id: 275,
        logoUrl: 'https://www.okx.com/cdn/wallet/logo/dex_stargate_bridge.png',
    },
    {
        id: 639,
        logoUrl: 'https://www.okx.com/cdn/wallet/logo/dex_stargate_bridge.png',
    },
    {
        id: 315,
        logoUrl: '',
    },
    {
        id: 211,
        logoUrl: new URL('../assets/cbridge.svg', import.meta.url).href,
    },
    {
        id: 353,
        logoUrl: 'https://www.okx.com/cdn/wallet/logo/dex_Wanchain.png',
    },
    {
        id: 416,
        logoUrl: new URL('../assets/hyphen.svg', import.meta.url).href,
    },
    {
        id: 223,
        logoUrl: '',
    },
    {
        id: 129,
        logoUrl: new URL('../assets/wormhole.svg', import.meta.url).href,
    },
    {
        id: 480,
        logoUrl: new URL('../assets/connext.png', import.meta.url).href,
    },
    {
        id: 235,
        logoUrl: 'https://www.okx.com/cdn/web3/dex/logo/4e1e3c31-aaed-4131-a1d4-3440b7ae9cc3.png',
    },
]
