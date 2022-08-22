import type { Trending } from '../../types'
import type { DataProvider } from '@masknet/public-api'
import { CoinMarketTable } from './CoinMarketTable'
import { CoinMetadataTable } from './CoinMetadataTable'
import { Stack } from '@mui/material'

export interface CoinMarketPanelProps {
    trending: Trending
    dataProvider: DataProvider
}

export function CoinMarketPanel(props: CoinMarketPanelProps) {
    const { dataProvider, trending } = props

    return (
        <Stack p={2} gap={1}>
            <CoinMarketTable dataProvider={dataProvider} trending={trending} />
            <CoinMetadataTable dataProvider={dataProvider} trending={trending} />
        </Stack>
    )
}
