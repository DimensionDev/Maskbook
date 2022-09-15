import { DataProvider, TradeProvider } from '@masknet/public-api'
import { createLookupTableResolver } from '@masknet/shared-base'

export const resolveDataProviderLink = createLookupTableResolver<DataProvider, string>(
    {
        [DataProvider.CoinGecko]: 'https://www.coingecko.com/',
        [DataProvider.CoinMarketCap]: 'https://coinmarketcap.com/',
        [DataProvider.UniswapInfo]: 'https://info.uniswap.org/',
        [DataProvider.NFTScan]: 'https://www.nftscan.com/',
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
        [TradeProvider.VENOMSWAP]: 'VenomSwap',
        [TradeProvider.OPENSWAP]: 'OpenSwap',
        [TradeProvider.MDEX]: 'Mdex',
        [TradeProvider.ARTHSWAP]: 'ArthSwap',
        [TradeProvider.VERSA]: 'Versa',
        [TradeProvider.ASTAREXCHANGE]: 'AstarExchange',
        [TradeProvider.DEFIKINGDOMS]: 'DefiKingdoms',
        [TradeProvider.YUMISWAP]: 'YumiSwap',
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
