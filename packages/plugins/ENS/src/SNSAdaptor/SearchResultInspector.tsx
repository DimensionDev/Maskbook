import { useContext } from 'react'
import { Box, Typography } from '@mui/material'
import useStyles from './useStyles'
import { Icons } from '@masknet/icons'
import { EmptyContent } from './EmptyContent'
import { LoadingContent } from './LoadingContent'
import { LoadFailedContent } from './LoadFailedContent'
import { ENSProvider, ENSContext, SearchResultInspectorProps } from './context'

export function SearchResultInspectorContent() {
    const { classes } = useStyles()
    const { isLoading, isNoResult, isError, reversedAddress, retry, tokenId, domain } = useContext(ENSContext)

    if (isError) return <LoadFailedContent isLoading={isLoading} retry={retry} />

    if (isLoading) return <LoadingContent />

    if (isNoResult) return <EmptyContent />

    return (
        <Box className={classes.root}>
            <div className={classes.coverCard}>
                <Icons.ENSCover className={classes.coverIcon} />
                <Typography className={classes.coverText}>{domain}</Typography>
            </div>
        </Box>
    )
}

export function SearchResultInspector(props: SearchResultInspectorProps) {
    return (
        <ENSProvider {...props}>
            <SearchResultInspectorContent />
        </ENSProvider>
    )
}
