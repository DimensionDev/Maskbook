import { useContext } from 'react'
import { Box } from '@mui/material'
import useStyles from './useStyles'
import { ENSEmptyContent } from './ENSEmptyContent'
import { ENSLoadingContent } from './ENSLoadingContent'
import { ENSLoadFailedContent } from './ENSLoadFailedContent'
import { ENSProvider, ENSContext, SearchResultInspectorProps } from './ENSContext'

export function SearchResultInspectorContent() {
    const { classes } = useStyles()
    const { isLoading, isNoResult, isError, reversedAddress, retry, tokenId } = useContext(ENSContext)

    if (isError) return <ENSLoadFailedContent isLoading={isLoading} retry={retry} />

    if (isLoading) return <ENSLoadingContent />

    if (isNoResult) return <ENSEmptyContent />

    return <Box className={classes.root}>234</Box>
}

export function SearchResultInspector(props: SearchResultInspectorProps) {
    return (
        <ENSProvider {...props}>
            <SearchResultInspectorContent />
        </ENSProvider>
    )
}
