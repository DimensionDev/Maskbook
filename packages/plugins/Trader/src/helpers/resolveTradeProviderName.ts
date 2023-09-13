import { TradeProvider } from '@masknet/public-api'
import { createLookupTableResolver } from '@masknet/shared-base'

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
        [TradeProvider.MDEX]: 'Mdex',
        [TradeProvider.ARTHSWAP]: 'ArthSwap',
        [TradeProvider.VERSA]: 'Versa',
        [TradeProvider.ASTAREXCHANGE]: 'AstarExchange',
        [TradeProvider.YUMISWAP]: 'YumiSwap',
    },
    (tradeProvider) => {
        throw new Error(`Unknown provider type: ${tradeProvider}`)
    },
)
