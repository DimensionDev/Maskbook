import { useCallback } from 'react'
import { TrendingPopper } from '../trending/TrendingPopper'
import { DataProvider, TagType, TradeProvider } from '../../types'
import { PopperView } from '../trending/PopperView'
import { useAvailableDataProviders } from '../../trending/useAvailableDataProviders'

export interface TagInspectorProps {}

export function TagInspector(props: TagInspectorProps) {
    // build availability cache in the background page
    useAvailableDataProviders(TagType.CASH, 'BTC')

    const createTrendingView = useCallback(
        (name: string, type: TagType, dataProviders: DataProvider[], reposition?: () => void) => {
            return (
                <PopperView
                    name={name}
                    tagType={type}
                    dataProviders={dataProviders}
                    tradeProviders={[
                        TradeProvider.UNISWAP,
                        TradeProvider.SUSHISWAP,
                        TradeProvider.ZRX,
                        TradeProvider.SASHIMISWAP,
                        TradeProvider.BALANCER,
                    ]}
                    onUpdate={reposition}
                />
            )
        },
        [],
    )
    return <TrendingPopper>{createTrendingView}</TrendingPopper>
}
