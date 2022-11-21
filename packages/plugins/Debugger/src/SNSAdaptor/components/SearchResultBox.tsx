import type { Web3Helper } from '@masknet/web3-helpers'
import type { SearchResult } from '@masknet/web3-shared-base'
import { Typography } from '@mui/material'

export interface SearchResultBoxProps {
    result: SearchResult<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
}

export function SearchResultBox({ result }: SearchResultBoxProps) {
    return <Typography>{result.keyword}</Typography>
}
