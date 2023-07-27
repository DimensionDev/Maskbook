import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { v4 as uuid } from 'uuid'
import { Icons } from '@masknet/icons'
import {
    AddressItem,
    CopyButton,
    Image,
    TokenWithSocialGroupMenu,
    useCollectionByTwitterHandler,
} from '@masknet/shared'
import { CrossIsolationMessages, EMPTY_LIST, type SocialAccount, type SocialIdentity } from '@masknet/shared-base'
import { useAnchor } from '@masknet/shared-base-ui'
import { makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useChainContext, useWeb3Others } from '@masknet/web3-hooks-base'
import { TrendingAPI } from '@masknet/web3-providers/types'
import { isSameAddress } from '@masknet/web3-shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { Box, Link, Typography } from '@mui/material'
import type { BoxProps } from '@mui/system'
import { useI18N } from '../../../utils/index.js'
import { AvatarDecoration } from './AvatarDecoration.js'
import { PluginTraderMessages } from '@masknet/plugin-trader'

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

export interface ProfileBarProps extends BoxProps {
    identity: SocialIdentity
    socialAccounts: Array<SocialAccount<Web3Helper.ChainIdAll>>
    address?: string
    onAddressChange?: (address: string) => void
}

/**
 * What a Profile includes:
 * - SNS info
 * - Wallets
 */
export const ProfileBar = memo<ProfileBarProps>(
    ({ socialAccounts, address, identity, onAddressChange, className, children, ...rest }) => {
        const { classes, theme, cx } = useStyles()
        const { t } = useI18N()
        const { current: avatarClipPathId } = useRef<string>(uuid())
        const { anchorEl, anchorBounding } = useAnchor()

        const { value: collectionList = EMPTY_LIST } = useCollectionByTwitterHandler(identity.identifier?.userId)

        const Others = useWeb3Others()
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
        const selectedAddress = socialAccounts.find((x) => isSameAddress(x.address, address))

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
                    <AvatarDecoration
                        className={classes.avatarDecoration}
                        clipPathId={avatarClipPathId}
                        userId={identity.identifier?.userId}
                        size={40}
                    />
                </div>
                <Box className={classes.description}>
                    <Typography className={classes.nickname} title={identity.nickname}>
                        {identity.nickname}
                    </Typography>
                    {address ? (
                        <div className={classes.addressRow}>
                            <AddressItem
                                socialAccount={selectedAddress}
                                disableLinkIcon
                                TypographyProps={{ className: classes.address }}
                            />
                            <CopyButton size={14} className={classes.linkIcon} text={address} />
                            <Link
                                href={Others.explorerResolver.addressLink(chainId ?? ChainId.Mainnet, address)}
                                target="_blank"
                                title={t('view_on_explorer')}
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
                    ) : null}
                </Box>

                <TokenWithSocialGroupMenu
                    open={walletMenuOpen}
                    onClose={closeMenu}
                    fromSocialCard
                    onAddressChange={onAddressChange}
                    currentAddress={address}
                    socialAccounts={socialAccounts}
                    collectionList={collectionList}
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
    },
)

ProfileBar.displayName = 'ProfileBar'
