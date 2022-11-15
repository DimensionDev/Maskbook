import { useContext, forwardRef, useImperativeHandle } from 'react'
import { ChainId } from '@masknet/web3-shared-evm'
import { useCopyToClipboard } from 'react-use'
import { SourceType, resolveNextIDPlatformLink } from '@masknet/web3-shared-base'
import { useWeb3State } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { useSnackbarCallback } from '@masknet/shared'
import { Box, Typography, Link, alpha } from '@mui/material'
import { ENSProvider, ENSContext, SearchResultInspectorProps } from './context.js'
import { CollectibleState } from './hooks/useCollectibleState.js'
import { SocialAccountList } from './SocialAccountList.js'
import { SocialTooltip } from './SocialTooltip.js'
import { makeStyles } from '@masknet/theme'
import { Icons } from '@masknet/icons'
import { useI18N } from '../locales/index.js'
import { resolveNextIDPlatformIcon } from './utils.js'

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

        reversedAddress: {
            display: 'flex',
            alignItems: 'center',
            color: theme.palette.maskColor.secondaryDark,
            fontSize: 14,
            lineHeight: '18px',
        },
        nextIdVerified: {
            display: 'flex',
            alignItems: 'center',
            marginBottom: 12,
        },
        socialName: {
            color: theme.palette.maskColor.dark,
            maxWidth: 115,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
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
            color: theme.palette.maskColor.dark,
            cursor: 'pointer',
        },
        bindingsWrapper: {
            display: 'flex',
            width: 520,
            alignItems: 'center',
            overflow: 'hidden',
        },
        badge: {
            display: 'flex',
            marginRight: 12,
            alignItems: 'center',
            maxWidth: 134,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            height: 36,
            padding: theme.spacing(0, 1),
            background: alpha(theme.palette.common.white, 0.5),
            borderRadius: 8,
        },
        reversedAddressIcon: {
            marginRight: 2,
            marginBottom: 1,
            cursor: 'pointer',
            color: theme.palette.maskColor.secondaryDark,
        },
    }
})

export const SearchResultInspectorContent = forwardRef(function (
    props: SearchResultInspectorProps,
    ref: React.ForwardedRef<unknown>,
) {
    const t = useI18N()
    const { classes, cx } = useStyles({})
    const { Others } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
    const { isLoading, isError, retry, reversedAddress, nextIdBindings, firstNextIdrBinding, domain, tokenId } =
        useContext(ENSContext)

    useImperativeHandle(ref, () => ({ isLoading, reversedAddress, domain, isError, tokenId }), [
        isLoading,
        reversedAddress,
        domain,
        isError,
        tokenId,
        retry,
    ])
    const [, copyToClipboard] = useCopyToClipboard()
    const copyWalletAddress = useSnackbarCallback({
        executor: async (address: string) => copyToClipboard(address),
        deps: [],
        successText: t.wallets_address_copied(),
    })

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
                        {reversedAddress ? (
                            <Typography className={classes.reversedAddress}>
                                {reversedAddress}{' '}
                                <Icons.Copy
                                    size={20}
                                    className={classes.reversedAddressIcon}
                                    onClick={() => copyWalletAddress(reversedAddress ?? '')}
                                />
                                <Link
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={classes.link}
                                    href={
                                        Others?.explorerResolver.addressLink?.(ChainId.Mainnet, reversedAddress) ?? ''
                                    }>
                                    <Icons.LinkOut size={20} className={classes.reversedAddressIcon} />
                                </Link>
                            </Typography>
                        ) : null}
                    </div>
                </section>
                {firstNextIdrBinding?.identity ? (
                    <div className={classes.nextIdVerified}>
                        <section className={classes.bindingsWrapper}>
                            {nextIdBindings.map((x, i) => (
                                <SocialTooltip key={i} platform={x.source}>
                                    <div className={classes.badge}>
                                        <Link
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={classes.link}
                                            href={resolveNextIDPlatformLink(x.platform, x.identity)}>
                                            {resolveNextIDPlatformIcon(x.platform)}
                                            <Typography className={cx(classes.socialName, classes.rightSpace)}>
                                                {x.identity}
                                            </Typography>
                                            <Icons.LinkOut size={20} className={classes.linkOutIcon} />
                                        </Link>
                                    </div>
                                </SocialTooltip>
                            ))}
                        </section>

                        {nextIdBindings.length > 1 ? <SocialAccountList nextIdBindings={nextIdBindings} /> : null}
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
