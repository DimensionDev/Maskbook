import { useContext } from 'react'
import { ChainId } from '@masknet/web3-shared-evm'
import { SourceType } from '@masknet/web3-shared-base'
import { Box, Typography } from '@mui/material'
import useStyles from './useStyles'
import { useI18N } from '../locales'
import { Icons } from '@masknet/icons'
import { EmptyContent } from './EmptyContent'
import { LoadingContent } from './LoadingContent'
import { LoadFailedContent } from './LoadFailedContent'
import { TopAndLastOffers } from './TopAndLastOffers'
import { SourceSwitcher } from './SourceSwitcher'
import { ENSProvider, ENSContext, SearchResultInspectorProps } from './context'
import { CollectibleState } from './hooks/useCollectibleState'

export function SearchResultInspectorContent() {
    const t = useI18N()
    const { classes } = useStyles()
    const { isLoading, isNoResult, isError, reversedAddress, retry, nextIdTwitterBindingName, domain, tokenId } =
        useContext(ENSContext)

    if (isNoResult || !reversedAddress || !tokenId) return <EmptyContent />

    if (isLoading) return <LoadingContent />

    if (isError) return <LoadFailedContent isLoading={isLoading} retry={retry} />
    return (
        <CollectibleState.Provider
            initialState={{
                chainId: ChainId.Mainnet,
                tokenId,
                contractAddress: reversedAddress,
                provider: SourceType.OpenSea,
            }}>
            <Box className={classes.root}>
                <div className={classes.coverCard}>
                    <img src={new URL('./assets/ENSCover.svg', import.meta.url).toString()} />
                    <Typography className={classes.coverText}>{domain}</Typography>
                </div>
                <SourceSwitcher />
                <TopAndLastOffers />
                {nextIdTwitterBindingName ? (
                    <div className={classes.nextIdVerified}>
                        <Typography className={classes.nextIdVerifiedTitle}>
                            {t.associated_social_accounts()}
                        </Typography>
                        <Icons.TwitterRound />
                        <Typography className={classes.nextIdVerifiedTwitterName}>
                            {nextIdTwitterBindingName}
                        </Typography>
                        <Icons.NextIDMini variant="light" width={32} />
                    </div>
                ) : null}
            </Box>
        </CollectibleState.Provider>
    )
}

export function SearchResultInspector(props: SearchResultInspectorProps) {
    return (
        <ENSProvider {...props}>
            <SearchResultInspectorContent />
        </ENSProvider>
    )
}
