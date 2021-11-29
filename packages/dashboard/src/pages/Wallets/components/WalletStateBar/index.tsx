import { FC, memo } from 'react'
import { Box, Button, Stack, Typography } from '@mui/material'
import { TransactionStatusType } from '@masknet/web3-shared-evm'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { FormattedAddress, LoadingAnimation, useRemoteControlledDialog, WalletIcon } from '@masknet/shared'
import { useNetworkDescriptor, useProviderDescriptor, useWallet, useWeb3State, Web3Plugin } from '@masknet/plugin-infra'
import { PluginMessages } from '../../../../API'
import { useRecentTransactions } from '../../hooks/useRecentTransactions'
import { useDashboardI18N } from '../../../../locales'
import { useNetworkSelector } from './useNetworkSelector'

const useStyles = makeStyles()((theme) => ({
    bar: {
        minWidth: 80,
        borderRadius: 30,
        lineHeight: '28px',
        height: '28px',
        cursor: 'pointer',
    },
    dot: {
        position: 'relative',
        top: 0,
        display: 'inline-block',
        marginRight: theme.spacing(0.8),
        lineHeight: '28px',
        width: 10,
        height: 10,
        borderRadius: 5,
    },
}))

export const WalletStateBar = memo(() => {
    const t = useDashboardI18N()

    const wallet = useWallet()
    const networkDescriptor = useNetworkDescriptor()
    const providerDescriptor = useProviderDescriptor()

    const { value: pendingTransactions = [] } = useRecentTransactions(TransactionStatusType.NOT_DEPEND)

    const { openDialog: openWalletStatusDialog } = useRemoteControlledDialog(
        PluginMessages.Wallet.events.walletStatusDialogUpdated,
    )

    const { openDialog: openConnectWalletDialog } = useRemoteControlledDialog(
        PluginMessages.Wallet.events.selectProviderDialogUpdated,
    )

    const [menu, openMenu] = useNetworkSelector()

    if (!wallet) {
        return <Button onClick={openConnectWalletDialog}>{t.wallets_connect_wallet_connect()}</Button>
    }
    return (
        <WalletStateBarUI
            isPending={!!pendingTransactions.length}
            wallet={wallet}
            network={networkDescriptor}
            provider={providerDescriptor}
            openConnectWalletDialog={openWalletStatusDialog}
            openMenu={openMenu}>
            {menu}
        </WalletStateBarUI>
    )
})

interface WalletStateBarUIProps {
    isPending: boolean
    network?: Web3Plugin.NetworkDescriptor
    provider?: Web3Plugin.ProviderDescriptor
    wallet?: Web3Plugin.Wallet
    openConnectWalletDialog(): void
    openMenu: ReturnType<typeof useNetworkSelector>[1]
}

export const WalletStateBarUI: FC<WalletStateBarUIProps> = ({
    isPending,
    network,
    provider,
    wallet,
    openConnectWalletDialog,
    openMenu,
    children,
}) => {
    const t = useDashboardI18N()
    const { classes } = useStyles()
    const { Utils } = useWeb3State()

    if (!wallet || !network || !provider) return null

    return (
        <Stack justifyContent="center" direction="row" alignItems="center">
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="center"
                sx={{ background: network.iconColor.replace(')', ', 0.1)'), px: 2, mr: 1 }}
                color={network.iconColor ?? ''}
                className={classes.bar}
                onClick={openMenu}>
                <Typography component="span" sx={{ backgroundColor: network.iconColor }} className={classes.dot} />
                <Typography component="span" fontSize={12}>
                    {network.name}
                </Typography>
            </Stack>
            {isPending && (
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="center"
                    sx={{ px: 2, background: MaskColorVar.orangeMain.alpha(0.1), color: MaskColorVar.orangeMain }}
                    className={classes.bar}>
                    <LoadingAnimation sx={{ fontSize: 12, mr: 0.8, color: MaskColorVar.orangeMain }} />
                    <Typography component="span" fontSize={12} display="inline-block">
                        {t.wallet_transactions_pending()}
                    </Typography>
                </Stack>
            )}
            <Stack direction="row" onClick={openConnectWalletDialog} sx={{ cursor: 'pointer' }}>
                <Stack mx={1} justifyContent="center">
                    <WalletIcon providerIcon={provider.icon} inverse size={38} />
                </Stack>
                <Box sx={{ userSelect: 'none' }}>
                    <Box fontSize={16}>{wallet.name}</Box>
                    <Box fontSize={12}>
                        <FormattedAddress address={wallet.address} size={10} formatter={Utils?.formatAddress} />
                    </Box>
                </Box>
            </Stack>
            {children}
        </Stack>
    )
}
