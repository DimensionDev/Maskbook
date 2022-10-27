import { HTMLProps, memo, useEffect, useRef, useState } from 'react'
import { useCopyToClipboard } from 'react-use'
import { v4 as uuid } from 'uuid'
import { Icons } from '@masknet/icons'
import { Box, Link, MenuItem, Typography } from '@mui/material'
import { useWeb3State, useChainContext } from '@masknet/web3-hooks-base'
import { AccountIcon, AddressItem, useSnackbarCallback } from '@masknet/shared'
import { makeStyles, ShadowRootMenu } from '@masknet/theme'
import { isSameAddress, SocialAccount, SocialIdentity } from '@masknet/web3-shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { useI18N } from '../../../utils/index.js'
import { AvatarDecoration } from './AvatarDecoration'

const MENU_ITEM_HEIGHT = 40
const MENU_LIST_PADDING = 8
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
    avatarDecoration: {},
    description: {
        height: 40,
        marginLeft: 10,
        overflow: 'auto',
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
    },
    linkIcon: {
        lineHeight: '14px',
        height: 14,
        overflow: 'hidden',
        color: theme.palette.text.secondary,
        cursor: 'pointer',
    },
    addressMenu: {
        maxHeight: MENU_ITEM_HEIGHT * 10 + MENU_LIST_PADDING * 2,
        width: 248,
        backgroundColor: theme.palette.maskColor.bottom,
    },
    menuItem: {
        height: MENU_ITEM_HEIGHT,
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        flexGrow: 1,
        justifyContent: 'space-between',
    },
    addressItem: {
        display: 'flex',
        alignItems: 'center',
    },
    secondLinkIcon: {
        color: theme.palette.maskColor.secondaryDark,
    },
    selectedIcon: {
        color: theme.palette.maskColor.primary,
    },
}))

export interface ProfileBarProps extends HTMLProps<HTMLDivElement> {
    identity: SocialIdentity
    socialAccounts: SocialAccount[]
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
        const containerRef = useRef<HTMLDivElement>(null)
        const { current: avatarClipPathId } = useRef<string>(uuid())

        const [, copyToClipboard] = useCopyToClipboard()

        const onCopy = useSnackbarCallback({
            executor: async () => copyToClipboard(address!),
            deps: [],
            successText: t('copy_success'),
        })

        const { Others } = useWeb3State()
        const { chainId } = useChainContext()

        const [walletMenuOpen, setWalletMenuOpen] = useState(false)
        useEffect(() => {
            const closeMenu = () => setWalletMenuOpen(false)
            window.addEventListener('scroll', closeMenu, false)
            return () => {
                window.removeEventListener('scroll', closeMenu, false)
            }
        }, [])
        const selectedAddress = socialAccounts.find((x) => isSameAddress(x.address, address))

        return (
            <Box className={cx(classes.root, className)} {...rest} ref={containerRef}>
                <div className={classes.avatar}>
                    <img
                        src={identity.avatar}
                        height={40}
                        width={40}
                        alt={identity.nickname}
                        style={{
                            WebkitClipPath: `url(#${avatarClipPathId}-clip-path)`,
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
                            <Icons.PopupCopy onClick={onCopy} size={14} className={classes.linkIcon} />
                            <Link
                                href={Others?.explorerResolver.addressLink(chainId ?? ChainId.Mainnet, address)}
                                target="_blank"
                                title={t('view_on_explorer')}
                                rel="noopener noreferrer"
                                onClick={(event) => {
                                    event.stopPropagation()
                                }}
                                className={classes.linkIcon}>
                                <Icons.LinkOut size={14} />
                            </Link>
                            <Icons.ArrowDrop
                                size={14}
                                color={theme.palette.text.primary}
                                onClick={() => setWalletMenuOpen((v) => !v)}
                            />
                        </div>
                    ) : null}
                </Box>
                <ShadowRootMenu
                    anchorEl={containerRef.current}
                    open={walletMenuOpen}
                    disablePortal
                    PaperProps={{
                        className: classes.addressMenu,
                    }}
                    onClose={() => setWalletMenuOpen(false)}>
                    {socialAccounts.map((x) => {
                        return (
                            <MenuItem
                                className={classes.menuItem}
                                key={x.address}
                                value={x.address}
                                onClick={() => {
                                    setWalletMenuOpen(false)
                                    onAddressChange?.(x.address)
                                }}>
                                <div className={classes.addressItem}>
                                    <AddressItem socialAccount={x} linkIconClassName={classes.secondLinkIcon} />
                                    <AccountIcon socialAccount={x} />
                                </div>
                                {isSameAddress(address, x.address) && (
                                    <Icons.CheckCircle className={classes.selectedIcon} />
                                )}
                            </MenuItem>
                        )
                    })}
                </ShadowRootMenu>
                {children}
            </Box>
        )
    },
)
