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
import { ENSPostExtraInfoWrapper } from './ENSPostExtraInfoWrapper'

export function SearchResultInspectorContent() {
    const t = useI18N()
    const { classes, cx } = useStyles({})
    const {
        isLoading,
        isError,
        reversedAddress,
        retry,
        validNextIdTwitterBindings,
        firstValidNextIdTwitterBinding,
        restOfValidNextIdTwitterBindings,
        domain,
        tokenId,
    } = useContext(ENSContext)

    if (isLoading) return <LoadingContent />

    if (reversedAddress === undefined) return null

    if (!reversedAddress || !tokenId) return <EmptyContent />

    if (isError) return <LoadFailedContent isLoading={isLoading} retry={retry} />

    return (
        <ENSPostExtraInfoWrapper>
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
                            <section className={classes.bindingsWrapper}>
                                {validNextIdTwitterBindings.map((x, i) => (
                                    <div key={i} className={classes.badge}>
                                        <Link
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={cx(classes.link, classes.rightSpace)}
                                            href={`https://twitter.com/${x.identity}`}>
                                            <Icons.TwitterRoundWithNoBorder width={20} height={20} />
                                            <Typography className={classes.nextIdVerifiedTwitterName}>
                                                {x.identity}
                                            </Typography>
                                        </Link>
                                        <NextIdBadge variant="light" />
                                    </div>
                                ))}
                            </section>

                            {restOfValidNextIdTwitterBindings.length > 0 ? (
                                <SocialAccountList
                                    restOfValidNextIdTwitterBindings={restOfValidNextIdTwitterBindings}
                                />
                            ) : null}
                        </div>
                    ) : null}
                </Box>
            </CollectibleState.Provider>
        </ENSPostExtraInfoWrapper>
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
