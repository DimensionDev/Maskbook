import { CoinMetadataTable } from '@masknet/shared'
import type { TrendingAPI } from '@masknet/web3-providers/types'
import type { Web3Helper } from '@masknet/web3-helpers'
import { Stack } from '@mui/material'
import { CoinMarketTable } from './CoinMarketTable.js'

interface CoinMarketPanelProps {
    trending: TrendingAPI.Trending
    result: Web3Helper.TokenResultAll
}

export function CoinMarketPanel(props: CoinMarketPanelProps) {
    const { trending, result } = props

    return (
        <Stack p={2} gap={1}>
            <CoinMarketTable trending={trending} result={result} />
            <CoinMetadataTable trending={trending} />
        </Stack>
    )
}
