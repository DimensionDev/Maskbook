import { MaskDialog } from '@masknet/theme'
import { DialogContent } from '@material-ui/core'
import { Services } from '../../../API'
import { useDashboardI18N } from '../../../locales'
import { TradeProvider } from '@masknet/public-api'
import {
    useBinanceNetworkTradeProvider,
    useEthereumNetworkTradeProvider,
    usePolygonNetworkTradeProvider,
    useArbitrumNetworkTradeProvider,
    useXDaiNetworkTradeProvider,
} from '../../Settings/api'

import SettingItem from './SettingItem'

export interface SettingDialogProps {
    open: boolean
    onClose(): void
}
export default function SwapSettingDialog({ open, onClose }: SettingDialogProps) {
    const ethOptions = [
        { label: 'UniSwap V2', value: TradeProvider.UNISWAP_V2 },
        { label: 'UniSwap V3', value: TradeProvider.UNISWAP_V3 },
        { label: 'SushiSwap', value: TradeProvider.SUSHISWAP },
        { label: 'SashimiSwap', value: TradeProvider.SASHIMISWAP },
        { label: '0x', value: TradeProvider.ZRX },
        { label: 'Balancer', value: TradeProvider.BALANCER },
        { label: 'DODO', value: TradeProvider.DODO },
    ]

    const polygonOptions = [
        { label: 'QuickSwap', value: TradeProvider.QUICKSWAP },
        { label: 'SushiSwap', value: TradeProvider.SUSHISWAP },
        { label: '0x', value: TradeProvider.ZRX },
        { label: 'DODO', value: TradeProvider.DODO },
    ]

    const bscOptions = [
        { label: 'PancakeSwap', value: TradeProvider.PANCAKESWAP },
        { label: 'SushiSwap', value: TradeProvider.SUSHISWAP },
        { label: '0x', value: TradeProvider.ZRX },
        { label: 'DODO', value: TradeProvider.DODO },
    ]

    const arbitrumOptions = [{ label: 'UniSwap V3', value: TradeProvider.UNISWAP_V3 }]

    const xDaiOptions = [{ label: 'SushiSwap', value: TradeProvider.SUSHISWAP }]

    const t = useDashboardI18N()

    const items = [
        {
            legend: t.labs_settings_swap_network({ network: 'ETH' }),
            value: useEthereumNetworkTradeProvider(),
            options: ethOptions,
            onChange: (value: any) => Services.Settings.setEthNetworkTradeProvider(+value),
        },
        {
            legend: t.labs_settings_swap_network({ network: 'Polygon/Matic' }),
            value: usePolygonNetworkTradeProvider(),
            options: polygonOptions,
            onChange: (value: any) => Services.Settings.setPolygonNetworkTradeProvider(+value),
        },
        {
            legend: t.labs_settings_swap_network({ network: 'BSC' }),
            value: useBinanceNetworkTradeProvider(),
            options: bscOptions,
            onChange: (value: any) => Services.Settings.setBinanceNetworkTradeProvider(+value),
        },
        {
            legend: t.labs_settings_swap_network({ network: 'Arbitrum' }),
            value: useArbitrumNetworkTradeProvider(),
            options: arbitrumOptions,
            onChange: (value: any) => Services.Settings.setArbitrumNetworkTradeProvider(+value),
        },
        {
            legend: t.labs_settings_swap_network({ network: 'xDai' }),
            value: useXDaiNetworkTradeProvider(),
            options: xDaiOptions,
            onChange: (value: any) => Services.Settings.setxDaiNetworkTradeProvider(+value),
        },
    ]

    return (
        <MaskDialog title={t.labs_settings_swap()} open={open} onClose={onClose}>
            <DialogContent sx={{ padding: '16px 40px 24px' }}>
                {items.map((i, idx) => (
                    <SettingItem
                        legend={i.legend}
                        value={i.value}
                        options={i.options}
                        onChange={i.onChange}
                        key={idx}
                    />
                ))}
            </DialogContent>
        </MaskDialog>
    )
}
