import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { Icons } from '@masknet/icons'
import { AddressItem, CopyButton, Image, TokenWithSocialGroupMenu, useCollectionByTwitterHandle } from '@masknet/shared'
import { CrossIsolationMessages, EMPTY_LIST, type SocialAccount, type SocialIdentity } from '@masknet/shared-base'
import { useAnchor } from '@masknet/shared-base-ui'
import { makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useChainContext, useWeb3Utils } from '@masknet/web3-hooks-base'
import { TrendingAPI } from '@masknet/web3-providers/types'
import { isSameAddress } from '@masknet/web3-shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { Box, Link, Skeleton, Typography } from '@mui/material'
import type { BoxProps } from '@mui/system'
import { PluginTraderMessages } from '@masknet/plugin-trader'
import { AvatarDecoration } from './AvatarDecoration.js'
import { msg } from '@lingui/macro'
import { useLingui } from '@lingui/react'

const useStyles = makeStyles<void, 'avatarDecoration'>()((theme, _, refs) => ({
    root: {
        display: 'flex',
        alignItems: 'center',
        columnGap: 4,
    },
    avatar: {
        position: 'relative',
        height: 40,
        width: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        flexGrow: 0,
        filter: 'drop-shadow(0px 6px 12px rgba(28, 104, 243, 0.2))',
        backdropFilter: 'blur(16px)',
        '& img': {
            position: 'absolute',
            borderRadius: '100%',
            // Adjust to fit the rainbow border.
            transform: 'scale(0.94, 0.96) translate(0, 1px)',
        },
        [`& .${refs.avatarDecoration}`]: {
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            transform: 'scale(1)',
        },
    },
    avatarImageContainer: {
        borderRadius: '50%',
    },
    avatarDecoration: {},
    description: {
        height: 40,
        marginLeft: 10,
        overflow: 'auto',
        flexGrow: 1,
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
        '& :focus:not(:focus-visible)': {
            outline: 0,
        },
    },
    nickname: {
        color: theme.palette.text.primary,
        fontWeight: 700,
        fontSize: 18,
        lineHeight: '22px',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
    },
    addressRow: {
        fontSize: 14,
        display: 'flex',
        alignItems: 'center',
        columnGap: 2,
    },
    address: {
        color: theme.palette.text.primary,
        fontSize: 14,
        height: 18,
        fontWeight: 400,
        lineHeight: '18px',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
    },
    linkIcon: {
        lineHeight: '14px',
        height: 14,
        overflow: 'hidden',
        color: theme.palette.maskColor.second,
        cursor: 'pointer',
        flexShrink: 0,
    },
}))

interface ProfileBarProps extends BoxProps {
    identity: SocialIdentity
    socialAccounts: Array<SocialAccount<Web3Helper.ChainIdAll>>
    address?: string
    onAddressChange?: (address: string) => void
}

/**
 * What a Profile includes:
 * - Website info
 * - Wallets
 */
export const ProfileBar = memo<ProfileBarProps>(function ProfileBar({
    socialAccounts,
    address,
    identity,
    onAddressChange,
    className,
    children,
    ...rest
}) {
    const { _ } = useLingui()
    const { classes, theme, cx } = useStyles()
    const { current: avatarClipPathId } = useRef<string>(crypto.randomUUID())
    const { anchorEl, anchorBounding } = useAnchor()

    const collectionList = useCollectionByTwitterHandle(identity.identifier?.userId)

    const Utils = useWeb3Utils()
    const { chainId } = useChainContext()

    const [walletMenuOpen, setWalletMenuOpen] = useState(false)
    const closeMenu = useCallback(() => setWalletMenuOpen(false), [])
    useEffect(() => {
        const closeMenu = () => setWalletMenuOpen(false)
        window.addEventListener('scroll', closeMenu, false)
        return () => {
            window.removeEventListener('scroll', closeMenu, false)
        }
    }, [])
    const selectedAccount = socialAccounts.find((x) => isSameAddress(x.address, address))

    return (
        <Box className={cx(classes.root, className)} {...rest}>
            <div className={classes.avatar}>
                <Image
                    src={identity.avatar}
                    height={40}
                    width={40}
                    alt={identity.nickname}
                    containerProps={{
                        className: classes.avatarImageContainer,
                        style: {
                            WebkitClipPath: `url(#${avatarClipPathId}-clip-path)`,
                        },
                    }}
                />
                <AvatarDecoration className={classes.avatarDecoration} userId={identity.identifier?.userId} size={40} />
            </div>
            <Box className={classes.description}>
                <Typography className={classes.nickname} title={identity.nickname}>
                    {identity.nickname}
                </Typography>
                {address ?
                    <div className={classes.addressRow}>
                        <AddressItem
                            socialAccount={selectedAccount}
                            disableLinkIcon
                            TypographyProps={{ className: classes.address }}
                        />
                        <CopyButton size={14} className={classes.linkIcon} text={address} />
                        <Link
                            href={Utils.explorerResolver.addressLink(chainId ?? ChainId.Mainnet, address)}
                            target="_blank"
                            title={_(msg`View on Explorer`)}
                            rel="noopener noreferrer"
                            onClick={(event) => {
                                event.stopPropagation()
                            }}
                            sx={{ outline: 0 }}
                            className={classes.linkIcon}>
                            <Icons.LinkOut size={14} />
                        </Link>
                        <Icons.ArrowDrop
                            size={14}
                            color={theme.palette.text.primary}
                            onClick={() => {
                                setWalletMenuOpen((v) => !v)
                            }}
                        />
                    </div>
                :   null}
            </Box>

            <TokenWithSocialGroupMenu
                open={walletMenuOpen}
                onClose={closeMenu}
                fromSocialCard
                onAddressChange={onAddressChange}
                currentAddress={address}
                socialAccounts={socialAccounts}
                collectionList={collectionList || EMPTY_LIST}
                onTokenChange={(currentResult) => {
                    setWalletMenuOpen(false)
                    if (!anchorBounding) return
                    PluginTraderMessages.trendingAnchorObserved.sendToLocal({
                        name: identity.identifier?.userId || '',
                        identity,
                        address,
                        anchorBounding,
                        anchorEl,
                        type: TrendingAPI.TagType.HASH,
                        isCollectionProjectPopper: true,
                        currentResult,
                    })

                    CrossIsolationMessages.events.profileCardEvent.sendToLocal({ open: false })
                }}
                anchorPosition={{
                    top: 60,
                    left: 60,
                }}
                anchorReference="anchorPosition"
            />

            {children}
        </Box>
    )
})

type ProfileBarSkeletonProps = Omit<ProfileBarProps, 'identity' | 'onAddressChange'>

// This Skeleton is not fully empty, but also has user address
export const ProfileBarSkeleton = memo<ProfileBarSkeletonProps>(function ProfileBarSkeleton({
    socialAccounts,
    address,
    className,
    children,
    ...rest
}) {
    const { _ } = useLingui()
    const { classes, cx } = useStyles()

    const Utils = useWeb3Utils()
    const { chainId } = useChainContext()

    const selectedAccount = socialAccounts.find((x) => isSameAddress(x.address, address))

    return (
        <Box className={cx(classes.root, className)} {...rest}>
            <div className={classes.avatar}>
                <Skeleton variant="circular" height={40} width={40} />
            </div>
            <Box className={classes.description}>
                <Skeleton variant="text" className={classes.nickname} width={100} />
                {address ?
                    <div className={classes.addressRow}>
                        <AddressItem
                            socialAccount={selectedAccount}
                            disableLinkIcon
                            TypographyProps={{ className: classes.address }}
                        />
                        <CopyButton size={14} className={classes.linkIcon} text={address} />
                        <Link
                            href={Utils.explorerResolver.addressLink(chainId ?? ChainId.Mainnet, address)}
                            target="_blank"
                            title={_(msg`View on Explorer`)}
                            rel="noopener noreferrer"
                            onClick={(event) => {
                                event.stopPropagation()
                            }}
                            sx={{ outline: 0 }}
                            className={classes.linkIcon}>
                            <Icons.LinkOut size={14} />
                        </Link>
                    </div>
                :   null}
            </Box>
            {children}
        </Box>
    )
})
