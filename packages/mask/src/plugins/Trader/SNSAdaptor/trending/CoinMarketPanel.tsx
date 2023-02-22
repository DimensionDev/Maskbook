import type { Trending } from '../../types/index.js'
import type { SourceType } from '@masknet/web3-shared-base'
import { CoinMarketTable } from './CoinMarketTable.js'
import type { Web3Helper } from '@masknet/web3-helpers'
import { CoinMetadataTable } from './CoinMetadataTable.js'
import { Stack } from '@mui/material'

export interface CoinMarketPanelProps {
    trending: Trending
    dataProvider: SourceType
    result: Web3Helper.TokenResultAll
}

export function CoinMarketPanel(props: CoinMarketPanelProps) {
    const { dataProvider, trending, result } = props

    return (
        <Stack p={2} gap={1}>
            <CoinMarketTable dataProvider={dataProvider} trending={trending} result={result} />
            <CoinMetadataTable dataProvider={dataProvider} trending={trending} />
        </Stack>
    )
}
