import { useContext } from 'react'
import { Box } from '@mui/material'
import useStyles from './useStyles'
import { EmptyContent } from './EmptyContent'
import { LoadingContent } from './LoadingContent'
import { LoadFailedContent } from './LoadFailedContent'
import { ENSProvider, ENSContext, SearchResultInspectorProps } from './context'

export function SearchResultInspectorContent() {
    const { classes } = useStyles()
    const { isLoading, isNoResult, isError, reversedAddress, retry, tokenId } = useContext(ENSContext)

    if (isError) return <LoadFailedContent isLoading={isLoading} retry={retry} />

    if (isLoading) return <LoadingContent />

    if (isNoResult) return <EmptyContent />

    return <Box className={classes.root}>234</Box>
}

export function SearchResultInspector(props: SearchResultInspectorProps) {
    return (
        <ENSProvider {...props}>
            <SearchResultInspectorContent />
        </ENSProvider>
    )
}
