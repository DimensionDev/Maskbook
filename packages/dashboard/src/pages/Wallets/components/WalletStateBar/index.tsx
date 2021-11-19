import { FC, memo } from 'react'
import { Box, Button, Stack, Typography } from '@mui/material'
import {
    getNetworkName,
    ProviderType,
    TransactionStatusType,
    useChainColor,
    useChainId,
    useWallet,
    useWeb3StateContext,
} from '@masknet/web3-shared-evm'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { FormattedAddress, LoadingAnimation, ImageIcon, useRemoteControlledDialog } from '@masknet/shared'
import { useWeb3State } from '@masknet/plugin-infra'
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
    const { providerType } = useWeb3StateContext()
    const chainId = useChainId()
    const chainColor = useChainColor()

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
            networkName={getNetworkName(chainId)}
            chainColor={chainColor}
            providerType={providerType}
            openConnectWalletDialog={openWalletStatusDialog}
            openMenu={openMenu}
            walletName={wallet.name ?? ''}
            walletAddress={wallet.address}>
            {menu}
        </WalletStateBarUI>
    )
})

interface WalletStateBarUIProps {
    networkName?: string
    chainColor: string
    isPending: boolean
    providerType: ProviderType
    walletName: string
    walletAddress: string
    openConnectWalletDialog(): void
    openMenu: ReturnType<typeof useNetworkSelector>[1]
}

export const WalletStateBarUI: FC<WalletStateBarUIProps> = ({
    networkName,
    isPending,
    providerType,
    chainColor,
    walletAddress,
    walletName,
    openConnectWalletDialog,
    openMenu,
    children,
}) => {
    const t = useDashboardI18N()
    const { classes } = useStyles()
    const { Utils } = useWeb3State()

    return (
        <Stack justifyContent="center" direction="row" alignItems="center">
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="center"
                sx={{ background: chainColor.replace(')', ', 0.1)'), px: 2, mr: 1 }}
                color={chainColor}
                className={classes.bar}
                onClick={openMenu}>
                <Typography component="span" sx={{ background: chainColor }} className={classes.dot} />
                <Typography component="span" fontSize={12}>
                    {networkName}
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
                    {/* <ImageIcon providerType={providerType} /> */}
                    <ImageIcon />
                </Stack>
                <Box sx={{ userSelect: 'none' }}>
                    <Box fontSize={16}>{walletName}</Box>
                    <Box fontSize={12}>
                        <FormattedAddress address={walletAddress} size={10} formatter={Utils?.formatAddress} />
                    </Box>
                </Box>
            </Stack>
            {children}
        </Stack>
    )
}
