import { useCurrentWeb3NetworkPluginID, NetworkPluginID, useWallet } from '@masknet/plugin-infra/web3'
import { WalletMessages } from '@masknet/plugin-wallet'
import type { BindingProof } from '@masknet/shared-base'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { makeStyles, MaskColorVar, ShadowRootMenu, useStylesExtends } from '@masknet/theme'
import { isSameAddress } from '@masknet/web3-shared-evm'
import { Button, Divider, ListItemIcon, MenuItem, Stack, Typography } from '@mui/material'
import classNames from 'classnames'
import { noop } from 'lodash-unified'
import { useCallback, useEffect, useState } from 'react'
import { useSharedI18N } from '../../../locales'
import { CheckedIcon, UncheckIcon } from '../../assets/Check'
import { WalletSettingIcon } from '../../assets/setting'
import { Verify2Icon } from '../../assets/Verify2'
import { WalletUI } from './WalletUI'

const useStyles = makeStyles()((theme) => ({
    root: {
        paddingLeft: 4,
        paddingRight: 4,
        cursor: 'pointer',
    },
    wrapper: {},
    address: {
        lineHeight: 1.5,
    },
    copy: {
        color: theme.palette.secondary.main,
    },

    icon: {
        width: 24,
        height: 24,
    },
    iconShadow: {
        filter: 'drop-shadow(0px 0px 6px rgba(28, 104, 243, 0.6))',
    },
    change: {
        marginLeft: theme.spacing(4),
        backgroundColor: MaskColorVar.twitterButton,
        borderRadius: 9999,
        fontWeight: 600,
        fontSize: 14,
    },
    divider: {
        borderColor: theme.palette.mode === 'dark' ? '#2F3336' : '#F2F5F6',
        marginLeft: 16,
        marginRight: 16,
    },
    paper: {
        width: 335,
        backgroundColor: theme.palette.mode === 'dark' ? '#000000' : 'white',
    },
}))

interface WalletMenuBarProps extends withClasses<'root'> {
    wallets: BindingProof[]
    onChange: (address: string) => void
    openPopupsWindow?: () => void
    iconSize?: number
    badgeSize?: number
    pending?: string | React.ReactElement | React.ReactNode
}

export function WalletMenuBar(props: WalletMenuBarProps) {
    const { onChange, wallets, openPopupsWindow, iconSize, badgeSize, pending } = props
    const classes = useStylesExtends(useStyles(), props)
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
    const onClose = () => setAnchorEl(null)
    const onOpen = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget)
    const t = useSharedI18N()
    const currentPluginId = useCurrentWeb3NetworkPluginID()
    const wallet = useWallet(currentPluginId)
    const [selectedWallet, setSelectedWallet] = useState(wallet?.address || wallets[0].identity || '')
    const onClick = useCallback((address: string) => {
        onChange(address)
        setSelectedWallet(address)
        onClose()
    }, [])

    useEffect(() => {
        if (!wallet?.address && !wallets.length) return
        setSelectedWallet(wallet?.address || wallets[0].identity)
        onChange(wallet?.address || wallets[0].identity)
    }, [wallet, wallets])

    const { setDialog: openSelectProviderDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectProviderDialogUpdated,
    )

    const onConnectWallet = useCallback(() => {
        openSelectProviderDialog({ open: true, pluginID: NetworkPluginID.PLUGIN_EVM })
        onClose()
    }, [openSelectProviderDialog, onClose])

    const walletItem = (
        name: string,
        selectedWallet: string,
        wallet: string,
        enableChange: boolean,
        onClick: (wallet: string) => void,
        onChange?: () => void,
        verify?: boolean,
        isETH?: boolean,
    ) => (
        <MenuItem key={wallet} value={wallet} onClick={() => onClick(wallet)}>
            <ListItemIcon>
                {selectedWallet === wallet ? (
                    <CheckedIcon className={classNames(classes.icon, classes.iconShadow)} />
                ) : (
                    <UncheckIcon className={classes.icon} />
                )}
            </ListItemIcon>
            <WalletUI
                name={name}
                iconSize={iconSize}
                badgeSize={badgeSize}
                address={wallet}
                verify={verify}
                isETH={isETH}
            />
            {enableChange && (
                <Button size="small" className={classes.change} onClick={onChange}>
                    {t.change()}
                </Button>
            )}
        </MenuItem>
    )

    if (!wallets.length && (currentPluginId !== NetworkPluginID.PLUGIN_EVM || !wallet?.address)) return null

    return (
        <Stack className={classes.root}>
            <Stack onClick={onOpen} direction="row" alignItems="center" className={classes.wrapper}>
                <WalletUI
                    name={wallet?.name ?? ''}
                    iconSize={iconSize}
                    badgeSize={badgeSize}
                    address={selectedWallet}
                    isETH={
                        wallets.some((x) => isSameAddress(x.identity, wallet?.address))
                            ? true
                            : currentPluginId === NetworkPluginID.PLUGIN_EVM
                    }
                    showMenuDrop
                    pending={pending}
                />
            </Stack>
            <ShadowRootMenu
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={onClose}
                disableRestoreFocus
                PaperProps={{
                    className: classes.paper,
                }}>
                {wallet?.address ? (
                    walletItem(
                        wallet.name ?? '',
                        selectedWallet,
                        wallet.address,
                        Boolean(wallet.address),
                        () => onClick(wallet.address),
                        () => openSelectProviderDialog({ open: true, pluginID: NetworkPluginID.PLUGIN_EVM }),
                        wallets.some((x) => isSameAddress(x.identity, wallet.address)),
                        wallets.some((x) => isSameAddress(x.identity, wallet.address))
                            ? true
                            : currentPluginId === NetworkPluginID.PLUGIN_EVM,
                    )
                ) : (
                    <MenuItem key="connect">
                        <Button fullWidth onClick={onConnectWallet} sx={{ width: 311, padding: 1, borderRadius: 9999 }}>
                            {t.connect_your_wallet()}
                        </Button>
                    </MenuItem>
                )}
                <Divider className={classes.divider} />
                {wallets
                    .sort((a, b) => Number.parseInt(b.created_at, 10) - Number.parseInt(a.created_at, 10))
                    ?.filter((x) => !isSameAddress(x.identity, wallet?.address))
                    .map((x) => (
                        <>
                            {walletItem(
                                wallet?.name ?? '',
                                selectedWallet,
                                x.identity,
                                false,
                                () => onClick(x.identity),
                                () => noop,
                                true,
                                true,
                            )}
                            <Divider className={classes.divider} />
                        </>
                    ))}

                <MenuItem
                    key="settings"
                    onClick={() => {
                        openPopupsWindow?.()
                        onClose()
                    }}>
                    <ListItemIcon>
                        <WalletSettingIcon className={classes.icon} />
                    </ListItemIcon>
                    <Typography fontSize={14} fontWeight={700}>
                        {t.wallet_settings()}
                    </Typography>
                    <Verify2Icon style={{ marginLeft: 24 }} />
                </MenuItem>
            </ShadowRootMenu>
        </Stack>
    )
}
