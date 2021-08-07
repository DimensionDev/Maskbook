import { MaskDialog } from '@masknet/theme'
import { DialogContent } from '@material-ui/core'
import { Services } from '../../../API'
import { useDashboardI18N } from '../../../locales'
import { TradeProvider } from '../../../type'
import {
    useBinanceNetworkTradeProvider,
    useEthereumNetworkTradeProvider,
    usePolygonNetworkTradeProvider,
} from '../../Settings/api'

import SettingItem from './SettingItem'

export interface SettingDialogProps {
    open: boolean
    onClose(): void
}
export default function SwapSettingDialog({ open, onClose }: SettingDialogProps) {
    const ethOptions = [
        { label: 'UniSwap V2', value: TradeProvider.UNISWAP_V2 },
        { label: 'SushiSwap', value: TradeProvider.SUSHISWAP },
        { label: 'SashimiSwap', value: TradeProvider.SASHIMISWAP },
        { label: 'Ox', value: TradeProvider.ZRX },
        { label: 'Balancer', value: TradeProvider.BALANCER },
    ]

    const t = useDashboardI18N()

    const ethNetworkTradeProvider = useEthereumNetworkTradeProvider()
    const polygonNetworkTradeProvider = usePolygonNetworkTradeProvider()
    const bscNetworkTradeProvider = useBinanceNetworkTradeProvider()

    const polygonOptions = [
        { label: 'QuickSwap', value: TradeProvider.QUICKSWAP },
        { label: 'SushiSwap', value: TradeProvider.SUSHISWAP },
    ]

    const bscOptions = [
        { label: 'PancakeSwap', value: TradeProvider.PANCAKESWAP },
        { label: 'SushiSwap', value: TradeProvider.SUSHISWAP },
    ]

    return (
        <MaskDialog title={t.labs_settings_swap()} open={open} onClose={onClose}>
            <DialogContent sx={{ padding: '16px 40px 24px' }}>
                <SettingItem
                    legend={t.labs_settings_swap_eth()}
                    value={ethNetworkTradeProvider}
                    options={ethOptions}
                    onChange={(value) => Services.Settings.setEthNetworkTradeProvider(+value)}
                />
                <SettingItem
                    legend={t.labs_settings_swap_polygon()}
                    value={polygonNetworkTradeProvider}
                    options={polygonOptions}
                    onChange={(value) => Services.Settings.setPolygonNetworkTradeProvider(+value)}
                />
                <SettingItem
                    legend={t.labs_settings_swap_bsc()}
                    value={bscNetworkTradeProvider}
                    options={bscOptions}
                    onChange={(value) => Services.Settings.setBinanceNetworkTradeProvider(+value)}
                />
            </DialogContent>
        </MaskDialog>
    )
}
