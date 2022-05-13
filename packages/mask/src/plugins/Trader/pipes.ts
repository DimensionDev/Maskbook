import { DataProvider, TradeProvider } from '@masknet/public-api'
import { createLookupTableResolver } from '@masknet/web3-shared-evm'

export const resolveDataProviderName = createLookupTableResolver<DataProvider, string>(
    {
        [DataProvider.COIN_GECKO]: 'CoinGecko',
        [DataProvider.COIN_MARKET_CAP]: 'CoinMarketCap',
        [DataProvider.UNISWAP_INFO]: 'Uniswap Info',
    },
    (dataProvider) => {
        throw new Error(`Unknown data provider: ${dataProvider}`)
    },
)

export const resolveDataProviderLink = createLookupTableResolver<DataProvider, string>(
    {
        [DataProvider.COIN_GECKO]: 'https://www.coingecko.com/',
        [DataProvider.COIN_MARKET_CAP]: 'https://coinmarketcap.com/',
        [DataProvider.UNISWAP_INFO]: 'https://info.uniswap.org/',
    },
    (dataProvider) => {
        throw new Error(`Unknown data provider: ${dataProvider}`)
    },
)

export const resolveTradeProviderName = createLookupTableResolver<TradeProvider, string>(
    {
        [TradeProvider.UNISWAP_V2]: 'Uniswap V2',
        [TradeProvider.UNISWAP_V3]: 'Uniswap V3',
        [TradeProvider.ZRX]: '0x',
        [TradeProvider.SUSHISWAP]: 'SushiSwap',
        [TradeProvider.SASHIMISWAP]: 'SashimiSwap',
        [TradeProvider.BALANCER]: 'Balancer',
        [TradeProvider.QUICKSWAP]: 'QuickSwap',
        [TradeProvider.PANCAKESWAP]: 'PancakeSwap',
        [TradeProvider.DODO]: 'DODO',
        [TradeProvider.BANCOR]: 'Bancor',
        [TradeProvider.OPENOCEAN]: 'OpenOcean',
        [TradeProvider.TRADERJOE]: 'TraderJoe',
        [TradeProvider.PANGOLIN]: 'PangolinDex',
        [TradeProvider.TRISOLARIS]: 'Trisolaris',
        [TradeProvider.WANNASWAP]: 'WannaSwap',
        [TradeProvider.JUGGLERRED]: 'JugglerRed',
        [TradeProvider.VENOMSWAP]: 'VenomSwap',
        [TradeProvider.OPENSWAP]: 'OpenSwap',
        [TradeProvider.MDEX]: 'Mdex',
        [TradeProvider.DEFIKINGDOMS]: 'DefiKingdoms',
    },
    (tradeProvider) => {
        throw new Error(`Unknown provider type: ${tradeProvider}`)
    },
)

export function resolveDaysName(days: number) {
    if (days === 0) return 'MAX'
    if (days >= 365) return `${Math.floor(days / 365)}y`
    if (days >= 30) return `${Math.floor(days / 30)}m`
    if (days >= 7) return `${Math.floor(days / 7)}w`
    return `${days}d`
}
