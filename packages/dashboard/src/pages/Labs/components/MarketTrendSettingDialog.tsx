import { MaskDialog } from '@masknet/theme'
import { DialogContent } from '@mui/material'
import { Services } from '../../../API'
import { useDashboardI18N } from '../../../locales'
import { MarketTrendProvider } from '../../../type'
import { useTrendingDataSource } from '../../Settings/api'

import SettingItem from './SettingItem'

export interface SettingDialogProps {
    open: boolean
    onClose(): void
}
export default function MarketTrendSettingDialog({ open, onClose }: SettingDialogProps) {
    const options = [
        { label: 'CoinGecko', value: MarketTrendProvider.COIN_GECKO },
        { label: 'CoinMarketCap', value: MarketTrendProvider.COIN_MARKET_CAP },
        { label: 'Uniswap Info', value: MarketTrendProvider.UNISWAP_INFO },
    ]

    const source = useTrendingDataSource()
    const t = useDashboardI18N()

    return (
        <MaskDialog title={t.labs_settings_market_trend()} open={open} onClose={onClose}>
            <DialogContent sx={{ padding: '16px 40px 24px' }}>
                <SettingItem
                    legend={t.labs_settings_market_trend_source()}
                    value={source}
                    options={options}
                    onChange={(value) => Services.Settings.setTrendingDataSource(+value)}
                />
            </DialogContent>
        </MaskDialog>
    )
}
