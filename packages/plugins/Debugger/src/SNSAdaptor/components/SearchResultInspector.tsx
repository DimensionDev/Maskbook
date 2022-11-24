import type { Web3Helper } from '@masknet/web3-helpers'
import type { SearchResult } from '@masknet/web3-shared-base'
import { Typography } from '@mui/material'

export interface SearchResultInspectorProps {
    result: SearchResult<Web3Helper.ChainIdAll>
}

export function SearchResultInspector({ result }: SearchResultInspectorProps) {
    return <Typography>{result.keyword}</Typography>
}
