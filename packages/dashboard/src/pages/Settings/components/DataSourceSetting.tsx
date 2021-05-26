import { MenuItem } from '@material-ui/core'
import SettingSelect from './SettingSelect'
import { useTrendingDataSource } from '../api'
import { Services } from '../../../API'
import { useCallback } from 'react'
import type { SelectInputProps } from '@material-ui/core/Select/SelectInput'

export default function DataSourceSetting() {
    const source = useTrendingDataSource()
    const handleChange: SelectInputProps<number>['onChange'] = useCallback((event) => {
        const value = event.target.value
        Services.Settings.setTrendingDataSource(value)
    }, [])

    return (
        <SettingSelect<number> value={source} onChange={handleChange}>
            // TODO: use DataProvider
            <MenuItem value={0}>CoinGecko</MenuItem>
            <MenuItem value={1}>CoinMarketCap</MenuItem>
            <MenuItem value={2}>Uniswap Info</MenuItem>
        </SettingSelect>
    )
}
