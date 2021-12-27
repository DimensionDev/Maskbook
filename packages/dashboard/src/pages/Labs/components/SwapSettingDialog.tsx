import { MaskDialog } from '@masknet/theme'
import { DialogContent } from '@mui/material'
import { Services } from '../../../API'
import { useDashboardI18N } from '../../../locales'
import { TradeProvider } from '@masknet/public-api'
import {
    useBinanceNetworkTradeProvider,
    useEthereumNetworkTradeProvider,
    usePolygonNetworkTradeProvider,
    useArbitrumNetworkTradeProvider,
    useXDaiNetworkTradeProvider,
    useCeloNetworkTradeProvider,
    useFantomNetworkTradeProvider,
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
        { label: 'Bancor', value: TradeProvider.BANCOR },
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
    const fantomOptions = xDaiOptions

    const celoOptions = [{ label: 'SushiSwap', value: TradeProvider.SUSHISWAP }]

    const t = useDashboardI18N()

    const items = [
        {
            legend: t.labs_settings_swap_network({ network: 'ETH' }),
            value: useEthereumNetworkTradeProvider(),
            options: ethOptions,
            onChange: (value: string) => Services.Settings.setEthNetworkTradeProvider(Number.parseInt(value, 10)),
        },
        {
            legend: t.labs_settings_swap_network({ network: 'Polygon/Matic' }),
            value: usePolygonNetworkTradeProvider(),
            options: polygonOptions,
            onChange: (value: string) => Services.Settings.setPolygonNetworkTradeProvider(Number.parseInt(value, 10)),
        },
        {
            legend: t.labs_settings_swap_network({ network: 'BSC' }),
            value: useBinanceNetworkTradeProvider(),
            options: bscOptions,
            onChange: (value: string) => Services.Settings.setBinanceNetworkTradeProvider(Number.parseInt(value, 10)),
        },
        {
            legend: t.labs_settings_swap_network({ network: 'Arbitrum' }),
            value: useArbitrumNetworkTradeProvider(),
            options: arbitrumOptions,
            onChange: (value: string) => Services.Settings.setArbitrumNetworkTradeProvider(Number.parseInt(value, 10)),
        },
        {
            legend: t.labs_settings_swap_network({ network: 'xDai' }),
            value: useXDaiNetworkTradeProvider(),
            options: xDaiOptions,
            onChange: (value: string) => Services.Settings.setxDaiNetworkTradeProvider(Number.parseInt(value, 10)),
        },
        {
            legend: t.labs_settings_swap_network({ network: 'Celo' }),
            value: useCeloNetworkTradeProvider(),
            options: celoOptions,
            onChange: (value: string) => Services.Settings.setCeloNetworkTradeProvider(Number.parseInt(value, 10)),
        },
        {
            legend: t.labs_settings_swap_network({ network: 'Fantom' }),
            value: useFantomNetworkTradeProvider(),
            options: fantomOptions,
            onChange: (value: any) => Services.Settings.setFantomNetworkTradeProvider(+value),
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
