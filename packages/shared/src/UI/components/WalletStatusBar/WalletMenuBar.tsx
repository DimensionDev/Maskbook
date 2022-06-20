import {
    useAccount,
    useChainId,
    useCurrentWeb3NetworkPluginID,
    useRecentTransactions,
    useWallet,
    useWeb3Connection,
} from '@masknet/plugin-infra/web3'
import { makeStyles, MaskColorVar, ShadowRootMenu, useStylesExtends } from '@masknet/theme'
import { isSameAddress, NetworkPluginID, TransactionStatusType } from '@masknet/web3-shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { Button, CircularProgress, Divider, ListItemIcon, MenuItem, Stack, Typography, useTheme } from '@mui/material'
import classNames from 'classnames'
import { useCallback, useEffect, useState } from 'react'
import { useSharedI18N } from '../../../locales'
import { CheckedIcon, UncheckIcon } from '../../assets/Check'
import { WalletSettingIcon } from '../../assets/setting'
import { Verify2Icon } from '../../assets/Verify2'
import { useNextIDWallets } from '../../hooks'
import type { WalletMenuActionProps } from './types'
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
    const { value: wallets = [], loading } = useNextIDWallets(actionProps?.userId)
    const [selectedWallet, setSelectedWallet] = useState(account || wallets[0]?.identity || '')
    const chainId = useChainId(currentPluginId)
    const theme = useTheme()
    const expectedConnection = useWeb3Connection(currentPluginId)

    const pendingTransactions = useRecentTransactions(currentPluginId, TransactionStatusType.NOT_DEPEND)

    function renderButtonText() {
        if (pendingTransactions.length <= 0) return
        return (
            <>
                <Typography fontSize={14} fontWeight={400} style={{ color: '#FFB100', marginRight: 2 }}>
                    {t.pending()}
                </Typography>
                <CircularProgress thickness={6} size={12} style={{ color: '#FFB100' }} />
            </>
        )
    }

    const onClick = useCallback((address: string, pluginId: NetworkPluginID, chainId: ChainId) => {
        onChange?.(address, pluginId, chainId)
        setSelectedWallet(address)
        onClose()
    }, [])

    useEffect(() => {
        if (!account && !wallets.length) return
        setSelectedWallet((account || wallets[0].identity) ?? '')
    }, [account, wallets])

    const onConnectWallet = useCallback(async () => {
        await expectedConnection.connect({ chainId })
        console.log('----------------')
    }, [expectedConnection])

    const walletItem = (
        walletName: string,
        selectedWallet: string,
        wallet: string,
        enableChange: boolean,
        verify?: boolean,
        isETH?: boolean,
        onChange?: () => void,
    ) => (
        <MenuItem
            value={wallet}
            onClick={() =>
                onClick(
                    wallet,
                    isETH ? NetworkPluginID.PLUGIN_EVM : currentPluginId,
                    wallets?.some((x) => isSameAddress(x.identity, wallet)) ? ChainId.Mainnet : (chainId as ChainId),
                )
            }>
            <ListItemIcon>
                {selectedWallet === wallet ? (
                    <>
                        <CheckedIcon className={classNames(classes.icon, classes.iconShadow)} />
                    </>
                ) : (
                    <UncheckIcon className={classes.icon} />
                )}
            </ListItemIcon>
            <WalletUI name={walletName} address={wallet} verify={verify} isETH={isETH} />
            {enableChange && (
                <Button size="small" className={classes.change} onClick={onChange}>
                    {t.change()}
                </Button>
            )}
        </MenuItem>
    )

    return (
        <Stack className={classes.root}>
            <Stack
                onClick={actionProps?.haveMenu ? onOpen : onConnectWallet}
                direction="row"
                alignItems="center"
                className={classes.wrapper}>
                <WalletUI
                    name={wallet?.name ?? ''}
                    iconSize={iconSize}
                    badgeSize={badgeSize}
                    address={selectedWallet}
                    isETH={
                        wallets?.some((x) => isSameAddress(x.identity, selectedWallet)) ||
                        currentPluginId === NetworkPluginID.PLUGIN_EVM
                    }
                    showMenuDrop
                    pending={renderButtonText()}
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
                        walletItem(
                            wallet?.name ?? '',
                            selectedWallet,
                            account,
                            Boolean(account),
                            wallets.some((x) => isSameAddress(x.identity, account)),
                            wallets.some((x) => isSameAddress(x.identity, account)) ||
                                currentPluginId === NetworkPluginID.PLUGIN_EVM,
                            onConnectWallet,
                        )
                    ) : (
                        <MenuItem key="Wallet Connect">
                            <Button
                                fullWidth
                                onClick={onConnectWallet}
                                sx={{ width: 311, padding: 1, borderRadius: 9999 }}>
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
                                {walletItem(wallet?.name ?? '', selectedWallet, x.identity, false, true, true)}
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
