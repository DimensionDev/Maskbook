import { useContext } from 'react'
import { Box, Typography } from '@mui/material'
import useStyles from './useStyles'
import { useI18N } from '../locales'
import { Icons } from '@masknet/icons'
import { EmptyContent } from './EmptyContent'
import { LoadingContent } from './LoadingContent'
import { LoadFailedContent } from './LoadFailedContent'
import { ENSProvider, ENSContext, SearchResultInspectorProps } from './context'

export function SearchResultInspectorContent() {
    const t = useI18N()
    const { classes } = useStyles()
    const { isLoading, isNoResult, isError, reversedAddress, retry, nextIdTwitterBindingName, domain } =
        useContext(ENSContext)
    if (isError) return <LoadFailedContent isLoading={isLoading} retry={retry} />

    if (isLoading) return <LoadingContent />

    if (isNoResult) return <EmptyContent />

    return (
        <Box className={classes.root}>
            <div className={classes.coverCard}>
                <Icons.ENSCover className={classes.coverIcon} />
                <Typography className={classes.coverText}>{domain}</Typography>
            </div>
            {nextIdTwitterBindingName ? (
                <div className={classes.nextIdVerified}>
                    <Typography className={classes.nextIdVerifiedTitle}>{t.associated_social_accounts()}</Typography>
                    <Icons.TwitterRound />
                    <Typography className={classes.nextIdVerifiedTwitterName}>{nextIdTwitterBindingName}</Typography>
                    <Icons.NextIDMini variant="light" width={32} />
                </div>
            ) : null}
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
