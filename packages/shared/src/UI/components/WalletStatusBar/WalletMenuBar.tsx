import { useAccount, useChainId, useCurrentWeb3NetworkPluginID, useWallet } from '@masknet/plugin-infra/web3'
import { makeStyles, MaskColorVar, ShadowRootMenu, useStylesExtends } from '@masknet/theme'
import { isSameAddress, NetworkPluginID } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import { Button, Divider, ListItemIcon, MenuItem, Stack, Typography, useTheme } from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import { useSharedI18N } from '../../../locales'
import { WalletSettingIcon } from '../../assets/setting'
import { Verify2Icon } from '../../assets/Verify2'
import type { WalletMenuActionProps } from './types'
import { WalletItem } from './WalletItem'
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
        borderColor: theme.palette.mode === 'dark' ? '#2F3336' : theme.palette.maskColor?.line,
        marginLeft: 16,
        marginRight: 16,
    },
    paper: {
        width: 335,
        backgroundColor: theme.palette.mode === 'dark' ? '#000000' : theme.palette.maskColor?.white,
    },
}))

interface WalletMenuBarProps extends withClasses<'root'> {
    onChange?: (address: string, pluginId: NetworkPluginID, chainId: ChainId) => void
    iconSize?: number
    badgeSize?: number
    actionProps?: WalletMenuActionProps
}

export function WalletMenuBar(props: WalletMenuBarProps) {
    const { onChange, iconSize, badgeSize, actionProps } = props
    const classes = useStylesExtends(useStyles(), props)
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
    const onClose = () => setAnchorEl(null)
    const onOpen = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget)
    const t = useSharedI18N()
    const currentPluginId = useCurrentWeb3NetworkPluginID()
    const wallet = useWallet(currentPluginId)
    const account = useAccount(currentPluginId)
    const [selectedWallet, setSelectedWallet] = useState(account || (actionProps?.nextIDWallets?.[0]?.identity ?? ''))
    const chainId = useChainId(currentPluginId)
    const theme = useTheme()

    const onClick = useCallback((address: string, pluginId: NetworkPluginID, chainId: ChainId) => {
        onChange?.(address, pluginId, chainId)
        setSelectedWallet(address)
        onClose()
    }, [])

    useEffect(() => {
        if (!account && !actionProps?.nextIDWallets?.length) return
        setSelectedWallet((account || actionProps?.nextIDWallets?.[0]?.identity) ?? '')
    }, [account, actionProps?.nextIDWallets])

    return (
        <Stack className={classes.root}>
            <Stack
                onClick={actionProps?.haveMenu ? onOpen : actionProps?.onConnectWallet}
                direction="row"
                alignItems="center"
                className={classes.wrapper}>
                <WalletUI
                    name={wallet?.name ?? ''}
                    iconSize={iconSize}
                    badgeSize={badgeSize}
                    address={selectedWallet}
                    isETH={
                        actionProps?.nextIDWallets?.some((x) => isSameAddress(x.identity, selectedWallet)) ||
                        currentPluginId === NetworkPluginID.PLUGIN_EVM
                    }
                    showMenuDrop
                    pending={actionProps?.pending}
                    showWalletIcon
                />
            </Stack>
            {actionProps?.haveMenu ? (
                <ShadowRootMenu
                    open={Boolean(anchorEl)}
                    anchorEl={anchorEl}
                    onClose={onClose}
                    disableRestoreFocus
                    PaperProps={{
                        style: { backgroundColor: theme.palette.mode === 'dark' ? '#000000' : 'white', width: 335 },
                    }}>
                    {account ? (
                        <WalletItem
                            walletName={wallet?.name ?? ''}
                            selectedWallet={selectedWallet}
                            wallet={account}
                            nextIDWallets={actionProps.nextIDWallets}
                            chainId={chainId as ChainId}
                            onConnectWallet={actionProps.onConnectWallet}
                            onSelectedWallet={onClick}
                            haveChangeWallet={Boolean(account)}
                        />
                    ) : (
                        <MenuItem key="Wallet Connect">
                            <Button
                                fullWidth
                                onClick={actionProps?.onConnectWallet}
                                sx={{ width: 311, padding: 1, borderRadius: 9999 }}>
                                {t.connect_your_wallet()}
                            </Button>
                        </MenuItem>
                    )}
                    <Divider className={classes.divider} />
                    {actionProps.nextIDWallets
                        ?.sort((a, b) => Number.parseInt(b.created_at, 10) - Number.parseInt(a.created_at, 10))
                        ?.filter((x) => !isSameAddress(x.identity, wallet?.address))
                        .map((x, i) => (
                            <>
                                <WalletItem
                                    key={i}
                                    walletName=""
                                    selectedWallet={selectedWallet}
                                    wallet={x.identity}
                                    nextIDWallets={actionProps.nextIDWallets ?? []}
                                    chainId={chainId as ChainId}
                                    onSelectedWallet={onClick}
                                />

                                <Divider className={classes.divider} />
                            </>
                        ))}

                    <MenuItem
                        key="settings"
                        onClick={() => {
                            actionProps?.openPopupsWindow?.()
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
            ) : null}
        </Stack>
    )
}
