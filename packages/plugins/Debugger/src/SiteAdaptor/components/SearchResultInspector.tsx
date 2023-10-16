import type { Web3Helper } from '@masknet/web3-helpers'
import type { SearchResult } from '@masknet/web3-shared-base'
import { Typography } from '@mui/material'

interface SearchResultInspectorProps {
    resultList: Array<SearchResult<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>>
}

export function SearchResultInspector({ resultList }: SearchResultInspectorProps) {
    return <Typography>{resultList[0].keyword}</Typography>
}
