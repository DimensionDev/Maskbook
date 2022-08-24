import { Icons } from '@masknet/icons'
import { useChainId, useWeb3State } from '@masknet/plugin-infra/web3'
import { AddressItem, useSnackbarCallback } from '@masknet/shared'
import { makeStyles, ShadowRootMenu } from '@masknet/theme'
import {
    isSameAddress,
    NetworkPluginID,
    SocialAddress,
    SocialAddressType,
    SocialIdentity,
} from '@masknet/web3-shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { Box, Link, MenuItem, Typography } from '@mui/material'
import { memo, useRef, useState } from 'react'
import { useCopyToClipboard } from 'react-use'
import { useI18N } from '../../../utils'

const useStyles = makeStyles()((theme) => ({
    root: {
        display: 'flex',
        alignItems: 'center',
        columnGap: 4,
        cursor: 'pointer',
    },
    avatar: {
        height: 40,
        width: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 40,
        filter: 'drop-shadow(0px 6px 12px rgba(28, 104, 243, 0.2))',
        backdropFilter: 'blur(16px)',
    },
    description: {
        marginLeft: 10,
    },
    nickname: {
        display: 'flex',
        alignItems: 'center',
        columnGap: 4,
        color: theme.palette.text.primary,
        fontWeight: 700,
        fontSize: 14,
        lineHeight: '18px',
    },
    address: {
        color: theme.palette.text.primary,
        fontSize: 14,
        lineHeight: '18px',
        display: 'flex',
        alignItems: 'center',
        columnGap: 2,
    },
    menuItem: {
        display: 'flex',
        alignItems: 'center',
        flexGrow: 1,
        justifyContent: 'space-between',
    },
    linkIcon: {
        color: theme.palette.text.secondary,
        cursor: 'pointer',
        height: 14,
    },
    addressMenu: {
        maxHeight: 192,
        width: 248,
        backgroundColor: theme.palette.maskColor.bottom,
    },
    addressItem: {
        display: 'flex',
        alignItems: 'center',
    },
    secondLinkIcon: {
        margin: '4px 2px 0 2px',
        color: theme.palette.maskColor.secondaryDark,
    },
    selectedIcon: {
        color: theme.palette.maskColor.primary,
    },
}))

export interface ProfileBarProps {
    identity: SocialIdentity
    socialAddressList: Array<SocialAddress<NetworkPluginID>>
    address?: string
    onClick?: (ev: React.MouseEvent<HTMLDivElement>) => void
    onAddressChange?: (address: string) => void
}

/**
 * What a Profile includes:
 * - SNS info
 * - Wallets
 */
export const ProfileBar = memo<ProfileBarProps>(
    ({ onClick, socialAddressList, address, identity, onAddressChange }) => {
        const { classes } = useStyles()
        const { t } = useI18N()
        const nicknameRef = useRef<HTMLDivElement>(null)

        const [, copyToClipboard] = useCopyToClipboard()

        const onCopy = useSnackbarCallback({
            executor: async () => copyToClipboard(address!),
            deps: [],
            successText: t('copy_success'),
        })

        const { Others } = useWeb3State(NetworkPluginID.PLUGIN_EVM)

        const [walletMenuOpen, setWalletMenuOpen] = useState(false)

        const formattedAddress = Others?.formatAddress(address ?? '', 4) ?? ''
        const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
        const addressLink = address && Others?.explorerResolver.addressLink(chainId ?? ChainId.Mainnet, address)

        return (
            <Box onClick={onClick} className={classes.root}>
                <img src={identity.avatar} alt={identity.nickname} className={classes.avatar} />
                <Box className={classes.description} ref={nicknameRef}>
                    <Typography className={classes.nickname}>
                        <span>{identity.nickname}</span>
                    </Typography>
                    <Typography className={classes.address}>
                        <span title={address}>{formattedAddress}</span>
                        {address ? <Icons.PopupCopy onClick={onCopy} size={14} className={classes.linkIcon} /> : null}
                        {addressLink ? (
                            <Link
                                href={addressLink}
                                target="_blank"
                                title={t('view_on_explorer')}
                                rel="noopener noreferrer"
                                onClick={(event) => {
                                    event.stopPropagation()
                                }}
                                className={classes.linkIcon}>
                                <Icons.LinkOut size={14} className={classes.linkIcon} />
                            </Link>
                        ) : null}
                        <Icons.ArrowDrop size={14} onClick={() => setWalletMenuOpen((v) => !v)} />
                    </Typography>
                </Box>
                <ShadowRootMenu
                    anchorEl={nicknameRef.current}
                    open={walletMenuOpen}
                    disablePortal
                    PaperProps={{
                        className: classes.addressMenu,
                    }}
                    onClose={() => setWalletMenuOpen(false)}>
                    {socialAddressList.map((x) => {
                        const reversible = [
                            SocialAddressType.KV,
                            SocialAddressType.ADDRESS,
                            SocialAddressType.NEXT_ID,
                        ].includes(x.type)
                        return (
                            <MenuItem key={x.address} value={x.address} onClick={() => onAddressChange?.(x.address)}>
                                <div className={classes.menuItem}>
                                    <div className={classes.addressItem}>
                                        <AddressItem
                                            reverse={reversible}
                                            identityAddress={x}
                                            iconProps={classes.secondLinkIcon}
                                        />
                                        {x?.type === SocialAddressType.NEXT_ID && <Icons.Verified />}
                                    </div>
                                    {isSameAddress(address, x.address) && (
                                        <Icons.Selected className={classes.selectedIcon} />
                                    )}
                                </div>
                            </MenuItem>
                        )
                    })}
                </ShadowRootMenu>
            </Box>
        )
    },
)
