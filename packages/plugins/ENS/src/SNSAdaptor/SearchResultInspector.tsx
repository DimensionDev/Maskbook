import { useContext, forwardRef, useImperativeHandle } from 'react'
import { ChainId } from '@masknet/web3-shared-evm'
import { SourceType } from '@masknet/web3-shared-base'
import { Box, Typography, Link, alpha } from '@mui/material'
import { useI18N } from '../locales/index.js'
import { ENSProvider, ENSContext, SearchResultInspectorProps } from './context.js'
import { CollectibleState } from './hooks/useCollectibleState.js'
import { SocialAccountList } from './SocialAccountList.js'
import { SocialTooltip } from './SocialTooltip.js'
import { makeStyles } from '@masknet/theme'
import { Icons } from '@masknet/icons'

interface StyleProps {
    isMenuScroll?: boolean
}

const useStyles = makeStyles<StyleProps>()((theme) => {
    return {
        root: {
            padding: theme.spacing(0, 2),
        },
        ensInfo: {
            height: 42,
            display: 'flex',
            alignItems: 'center',
            marginBottom: 16,
        },
        ensIcon: {
            marginRight: 4,
        },
        ensDomain: {
            fontWeight: 700,
            color: theme.palette.common.black,
            fontSize: 14,
            lineHeight: '18px',
        },
        twitterIcon: {
            height: 20,
            width: 20,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.palette.maskColor.dark,
            borderRadius: 999,
        },
        reversedAddress: {
            color: theme.palette.maskColor.secondaryDark,
            fontSize: 14,
            lineHeight: '18px',
        },
        nextIdVerified: {
            display: 'flex',
            alignItems: 'center',
            marginBottom: 12,
        },
        nextIdVerifiedTwitterName: {
            color: theme.palette.maskColor.dark,
            fontWeight: 700,
            marginLeft: 4,
            fontSize: 16,
        },
        rightSpace: {
            marginRight: 6,
        },
        link: {
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none !important',
        },
        linkOutIcon: {
            cursor: 'pointer',
        },
        bindingsWrapper: {
            display: 'grid',
            gridAutoFlow: 'column',
            width: 520,
            alignItems: 'center',
            overflow: 'hidden',
        },
        badge: {
            display: 'flex',
            marginRight: 12,
            alignItems: 'center',
            height: 36,
            padding: theme.spacing(0, 1),
            background: alpha(theme.palette.common.white, 0.5),
            borderRadius: 8,
        },
    }
})

export const SearchResultInspectorContent = forwardRef(function (
    props: SearchResultInspectorProps,
    ref: React.ForwardedRef<unknown>,
) {
    const t = useI18N()
    const { classes, cx } = useStyles({})
    const {
        isLoading,
        isError,
        retry,
        reversedAddress,
        validNextIdTwitterBindings,
        firstValidNextIdTwitterBinding,
        keyword: domain,
        tokenId,
    } = useContext(ENSContext)

    useImperativeHandle(ref, () => ({ isLoading, reversedAddress, isError, tokenId }), [
        isLoading,
        reversedAddress,
        isError,
        tokenId,
        retry,
    ])

    return (
        <CollectibleState.Provider
            initialState={{
                chainId: ChainId.Mainnet,
                tokenId: tokenId ?? '',
                contractAddress: reversedAddress ?? '',
                sourceType: SourceType.OpenSea,
            }}>
            <Box className={classes.root}>
                <section className={classes.ensInfo}>
                    <Icons.ETH size={30} className={classes.ensIcon} />
                    <div>
                        <Typography className={classes.ensDomain}>{domain}</Typography>
                        <Typography className={classes.reversedAddress}>{reversedAddress}</Typography>
                    </div>
                </section>
                {firstValidNextIdTwitterBinding?.identity ? (
                    <div className={classes.nextIdVerified}>
                        <section className={classes.bindingsWrapper}>
                            {validNextIdTwitterBindings.map((x, i) => (
                                <SocialTooltip key={i}>
                                    <div className={classes.badge}>
                                        <Link
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={cx(classes.link, classes.rightSpace)}
                                            href={`https://twitter.com/${x.identity}`}>
                                            <div className={classes.twitterIcon}>
                                                <Icons.Twitter width={12} height={12} />
                                            </div>
                                            <Typography className={classes.nextIdVerifiedTwitterName}>
                                                {x.identity}
                                            </Typography>
                                        </Link>
                                        <Icons.LinkOut size={20} className={classes.linkOutIcon} />
                                    </div>
                                </SocialTooltip>
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
})

export const SearchResultInspector = forwardRef(function (
    props: SearchResultInspectorProps,
    ref: React.ForwardedRef<unknown>,
) {
    return (
        <ENSProvider {...props}>
            <SearchResultInspectorContent {...props} ref={ref} />
        </ENSProvider>
    )
})
