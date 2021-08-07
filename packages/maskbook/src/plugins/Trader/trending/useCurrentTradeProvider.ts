import { useValueRef } from '@masknet/shared'
import {
    ethereumNetworkTradeProviderSettings,
    polygonNetworkTradeProviderSettings,
    binanceNetworkTradeProviderSettings,
} from '../settings'
import { TradeProvider } from '../types'
import { getNetworkTypeFromChainId } from '@masknet/web3-shared'
import { currentChainIdSettings } from '../../Wallet/settings'
import { unreachable } from '@dimensiondev/kit'
import { NetworkType } from '@masknet/public-api'

<<<<<<< HEAD
export function useCurrentTradeProvider(availableTradeProviders: TradeProvider[]) {
    const [tradeProvider, setTradeProvider] = useState(
        availableTradeProviders.length ? availableTradeProviders[0] : TradeProvider.UNISWAP_V2,
    )
    const currentTradeProvider = useValueRef(currentTradeProviderSettings)
=======
export function useCurrentTradeProvider() {
    const networkType: NetworkType | undefined = getNetworkTypeFromChainId(currentChainIdSettings.value)
    const ethNetworkTradeProvider = useValueRef(ethereumNetworkTradeProviderSettings)
    const polygonNetworkTradeProvider = useValueRef(polygonNetworkTradeProviderSettings)
    const binanceNetworkTradeProvider = useValueRef(binanceNetworkTradeProviderSettings)
>>>>>>> develop

    if (!networkType) return TradeProvider.UNISWAP
    switch (networkType) {
        case NetworkType.Ethereum:
            return ethNetworkTradeProvider
        case NetworkType.Polygon:
            return polygonNetworkTradeProvider
        case NetworkType.Binance:
            return binanceNetworkTradeProvider
        case NetworkType.Arbitrum:
            throw new Error('TODO')
        default:
            unreachable(networkType)
    }
}
