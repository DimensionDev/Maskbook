import { useContext, useState, forwardRef } from 'react'
import { ChainId } from '@masknet/web3-shared-evm'
import { SourceType } from '@masknet/web3-shared-base'
import { Box, Typography, Link } from '@mui/material'
import { useI18N } from '../locales/index.js'
import { Icons } from '@masknet/icons'
import { TopAndLastOffers } from './TopAndLastOffers.js'
import { ENSProvider, ENSContext, SearchResultInspectorProps } from './context.js'
import { CollectibleState } from './hooks/useCollectibleState.js'
import { NextIdBadge } from './NextIdBadge.js'
import { SocialAccountList } from './SocialAccountList.js'
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

export function SearchResultInspectorContent(props: SearchResultInspectorProps) {
    const t = useI18N()
    const { classes, cx } = useStyles({})
    const [rightBoundary, setRightBoundary] = useState<number | undefined>()
    const {
        isLoading,
        isError,
        reversedAddress,
        validNextIdTwitterBindings,
        firstValidNextIdTwitterBinding,
        keyword,
        tokenId,
    } = useContext(ENSContext)

    return (
        <CollectibleState.Provider
            initialState={{
                chainId: ChainId.Mainnet,
                tokenId: tokenId ?? '',
                contractAddress: reversedAddress ?? '',
                sourceType: SourceType.OpenSea,
            }}>
            <Box className={classes.root}>
                <div className={classes.coverCard}>
                    <Typography className={classes.coverText}>{keyword}</Typography>
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
    )
}

export const SearchResultInspector = forwardRef(function (props: SearchResultInspectorProps) {
    console.log({ props }, 123)
    return (
        <ENSProvider {...props}>
            <SearchResultInspectorContent {...props} />
        </ENSProvider>
    )
})
