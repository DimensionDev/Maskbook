import { useContext, useState } from 'react'
import { ChainId } from '@masknet/web3-shared-evm'
import { SourceType } from '@masknet/web3-shared-base'
import { Box, Typography, Link } from '@mui/material'
import { useI18N } from '../locales'
import { Icons } from '@masknet/icons'
import { EmptyContent } from './EmptyContent'
import { LoadingContent } from './LoadingContent'
import { LoadFailedContent } from './LoadFailedContent'
import { TopAndLastOffers } from './TopAndLastOffers'
import { ENSProvider, ENSContext, SearchResultInspectorProps } from './context'
import { CollectibleState } from './hooks/useCollectibleState'
import { NextIdBadge } from './NextIdBadge'
import { SocialAccountList } from './SocialAccountList'
import { ENSPostExtraInfoWrapper } from './ENSPostExtraInfoWrapper'
import { makeStyles } from '@masknet/theme'

interface StyleProps {
    isMenuScroll?: boolean
}

const useStyles = makeStyles<StyleProps>()((theme) => {
    return {
        root: {
            padding: theme.spacing(0, 2),
        },
        coverCard: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: 256,
            marginBottom: 12,
            backgroundImage: `url(${new URL('./assets/ENSCover.svg', import.meta.url)})`,
            backgroundSize: 'contain',
        },
        coverText: {
            fontSize: 24,
            fontWeight: 700,
            width: '100%',
            textAlign: 'center',
            color: theme.palette.common.white,
        },
        nextIdVerified: {
            display: 'flex',
            alignItems: 'center',
            margin: '0px 12px 28px',
        },
        nextIdVerifiedTitle: {
            color: theme.palette.maskColor.secondaryDark,
            marginRight: 12,
            fontSize: 16,
        },
        nextIdVerifiedTwitterName: {
            color: theme.palette.maskColor.dark,
            fontWeight: 700,
            marginLeft: 4,
            fontSize: 16,
        },
        rightSpace: {
            marginRight: 12,
        },
        link: {
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none !important',
        },
        bindingsWrapper: {
            display: 'grid',
            gridAutoFlow: 'column',
            width: 300,
            alignItems: 'center',
            overflow: 'hidden',
        },
        badge: {
            display: 'flex',
            marginRight: 12,
            alignItems: 'center',
        },
    }
})

export function SearchResultInspectorContent() {
    const t = useI18N()
    const { classes, cx } = useStyles({})
    const [rightBoundary, setRightBoundary] = useState<number | undefined>()
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
                            <section
                                className={classes.bindingsWrapper}
                                ref={(e) => {
                                    setRightBoundary(e?.getBoundingClientRect().right)
                                }}>
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
                                        <NextIdBadge variant="light" rightBoundary={rightBoundary} />
                                    </div>
                                ))}
                            </section>

                            {validNextIdTwitterBindings.length > 1 ? (
                                <SocialAccountList validNextIdTwitterBindings={validNextIdTwitterBindings} />
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
        <ENSProvider {...props}>
            <SearchResultInspectorContent />
        </ENSProvider>
    )
}
