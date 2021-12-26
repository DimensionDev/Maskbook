import { MenuItem } from '@mui/material'
import SettingSelect from './SettingSelect'
import { useTrendingDataSource } from '../api'
import { Services } from '../../../API'
import { MarketTrendProvider } from '../../../type'

export default function DataSourceSetting() {
    const source = useTrendingDataSource()
    const handleChange = (event: any) => {
        const value = event.target.value
        Services.Settings.setTrendingDataSource(value)
    }

    return (
        <SettingSelect value={source} onChange={handleChange}>
            <MenuItem value={MarketTrendProvider.COIN_GECKO}>CoinGecko</MenuItem>
            <MenuItem value={MarketTrendProvider.COIN_MARKET_CAP}>CoinMarketCap</MenuItem>
            <MenuItem value={MarketTrendProvider.UNISWAP_INFO}>Uniswap Info</MenuItem>
        </SettingSelect>
    )
}
