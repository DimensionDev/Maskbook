import { useContext } from 'react'
import { ChainId } from '@masknet/web3-shared-evm'
import { SourceType } from '@masknet/web3-shared-base'
import { Box, Typography, Link } from '@mui/material'
import useStyles from './useStyles'
import { useI18N } from '../locales'
import { Icons } from '@masknet/icons'
import { EmptyContent } from './EmptyContent'
import { LoadingContent } from './LoadingContent'
import { LoadFailedContent } from './LoadFailedContent'
import { TopAndLastOffers } from './TopAndLastOffers'
import { ENSProvider, ENSContext, SearchResultInspectorProps, RootContext } from './context'
import { CollectibleState } from './hooks/useCollectibleState'
import { NextIdBadge } from './NextIdBadge'
import { SocialAccountList } from './SocialAccountList'

export function SearchResultInspectorContent() {
    const t = useI18N()
    const { classes, cx } = useStyles()
    const {
        isLoading,
        isError,
        reversedAddress,
        retry,
        firstValidNextIdTwitterBinding,
        restOfValidNextIdTwitterBindings,
        domain,
        tokenId,
    } = useContext(ENSContext)

    if (isLoading) return <LoadingContent />

    if (!reversedAddress || !tokenId) return <EmptyContent />

    if (isError) return <LoadFailedContent isLoading={isLoading} retry={retry} />

    return (
        <CollectibleState.Provider
            initialState={{
                chainId: ChainId.Mainnet,
                tokenId,
                contractAddress: reversedAddress,
                sourceType: SourceType.OpenSea,
            }}>
            <Box className={classes.root}>
                <div className={classes.coverCard}>
                    <Typography className={classes.coverText}>{domain}</Typography>
                </div>
                {/* Hide it temporarily <SourceSwitcher /> */}
                <TopAndLastOffers />
                {firstValidNextIdTwitterBinding?.identity ? (
                    <div className={classes.nextIdVerified}>
                        <Typography className={classes.nextIdVerifiedTitle}>
                            {t.associated_social_accounts()}
                        </Typography>
                        <Link
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cx(classes.link, classes.rightSpace)}
                            href={`https://twitter.com/${firstValidNextIdTwitterBinding.identity}`}>
                            <Icons.TwitterRound />
                            <Typography className={classes.nextIdVerifiedTwitterName}>
                                {firstValidNextIdTwitterBinding.identity}
                            </Typography>
                        </Link>
                        <NextIdBadge />
                        {restOfValidNextIdTwitterBindings.length > 0 ? (
                            <SocialAccountList restOfValidNextIdTwitterBindings={restOfValidNextIdTwitterBindings} />
                        ) : null}
                    </div>
                ) : null}
            </Box>
        </CollectibleState.Provider>
    )
}

export function SearchResultInspector(props: SearchResultInspectorProps) {
    return (
        <RootContext>
            <ENSProvider {...props}>
                <SearchResultInspectorContent />
            </ENSProvider>
        </RootContext>
    )
}
