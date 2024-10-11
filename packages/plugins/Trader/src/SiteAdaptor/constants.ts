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
export const REFETCH_INTERVAL = 20_000

export const bridges = [
    {
        id: 275,
        name: 'Stargate',
        logoUrl:
            'https://static.okx.com/cdn/wallet/logo/dex_stargate_bridge.png?x-oss-process=image/format,webp/ignore-error,1',
    },
    {
        id: 639,
        name: 'Stargate V2',
        logoUrl:
            'https://static.okx.com/cdn/wallet/logo/dex_stargate_bridge.png?x-oss-process=image/format,webp/ignore-error,1',
    },
    {
        id: 315,
        name: 'Across',
        logoUrl: new URL('../assets/accross.svg', import.meta.url).href,
    },
    {
        id: 211,
        name: 'Cbridge',
        logoUrl: new URL('../assets/cbridge.svg', import.meta.url).href,
    },
    {
        id: 353,
        name: 'Wanchain',
        logoUrl: 'https://www.okx.com/cdn/wallet/logo/dex_Wanchain.png',
    },
    {
        id: 416,
        name: 'Hyphen',
        logoUrl: new URL('../assets/hyphen.svg', import.meta.url).href,
    },
    {
        id: 223,
        name: 'Meson',
        logoUrl:
            'https://www.okx.com/cdn/explorer/dex/logo/2e188232-5793-4c71-a221-ebba4c59b64b.png?x-oss-process=image/format,webp/ignore-error,1',
    },
    {
        id: 129,
        name: 'Wormhole',
        logoUrl: new URL('../assets/wormhole.svg', import.meta.url).href,
    },
    {
        id: 480,
        name: 'Connext',
        logoUrl: new URL('../assets/connext.png', import.meta.url).href,
    },
    {
        id: 235,
        name: 'Bridgers',
        logoUrl: 'https://www.okx.com/cdn/web3/dex/logo/4e1e3c31-aaed-4131-a1d4-3440b7ae9cc3.png',
    },
    {
        id: 662,
        name: 'Circle-Bridge',
        logoUrl:
            'https://static.okx.com/cdn/explorer/dex/logo/dex_Circle.png.png?x-oss-process=image/format,webp/ignore-error,1',
    },
]
