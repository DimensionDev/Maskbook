import { FC, memo } from 'react'
import { Box, Button, Stack, Typography } from '@mui/material'
import { EMPTY_LIST, ProviderType, TransactionStatusType } from '@masknet/web3-shared-evm'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { FormattedAddress, LoadingAnimation, WalletIcon } from '@masknet/shared'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import {
    useNetworkDescriptor,
    useProviderDescriptor,
    useWallet,
    useWeb3State,
    Web3Plugin,
    useReverseAddress,
} from '@masknet/plugin-infra'
import { PluginMessages } from '../../../../API'
import { useRecentTransactions } from '../../hooks/useRecentTransactions'
import { useDashboardI18N } from '../../../../locales'
import { useNetworkSelector } from './useNetworkSelector'

const useStyles = makeStyles()((theme) => ({
    bar: {
        minWidth: 80,
        lineHeight: '28px',
        height: '28px',
        cursor: 'pointer',
        position: 'relative',
        '&::after': {
            borderRadius: 30,
            pointerEvents: 'none',
            content: '""',
            inset: 0,
            margin: 'auto',
            position: 'absolute',
            backgroundColor: 'var(--network-icon-color, transparent)',
            opacity: 0.1,
            zIndex: 0,
        },
        '& > span': {
            position: 'relative',
            zIndex: 1,
        },
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
    domain: {
        fontSize: 14,
        marginLeft: 20,
        background: theme.palette.mode === 'dark' ? 'rgba(73, 137, 255, 0.2)' : 'rgba(28, 104, 243, 0.1)',
        padding: '2px 8px',
        borderRadius: 4,
    },
}))

export const WalletStateBar = memo(() => {
    const t = useDashboardI18N()

    const wallet = useWallet()
    const networkDescriptor = useNetworkDescriptor()
    const providerDescriptor = useProviderDescriptor()
    const { value: pendingTransactions = EMPTY_LIST } = useRecentTransactions({
        status: TransactionStatusType.NOT_DEPEND,
    })

    const { openDialog: openWalletStatusDialog } = useRemoteControlledDialog(
        PluginMessages.Wallet.events.walletStatusDialogUpdated,
    )

    const { openDialog: openConnectWalletDialog } = useRemoteControlledDialog(
        PluginMessages.Wallet.events.selectProviderDialogUpdated,
    )

    const [menu, openMenu] = useNetworkSelector()

    const { value: domain } = useReverseAddress(wallet?.address)

    if (!wallet) {
        return <Button onClick={openConnectWalletDialog}>{t.wallets_connect_wallet_connect()}</Button>
    }
    return (
        <WalletStateBarUI
            isPending={!!pendingTransactions.length}
            wallet={wallet}
            domain={domain}
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
    domain?: string
    openConnectWalletDialog(): void
    openMenu: ReturnType<typeof useNetworkSelector>[1]
}

export const WalletStateBarUI: FC<WalletStateBarUIProps> = ({
    isPending,
    network,
    provider,
    wallet,
    domain,
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
                sx={{ '--network-icon-color': network.iconColor, px: 2, mr: 1 }}
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
                    sx={{
                        borderRadius: 9999,
                        px: 2,
                        background: MaskColorVar.orangeMain.alpha(0.1),
                        color: MaskColorVar.orangeMain,
                    }}
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
                    {provider.type !== ProviderType.MaskWallet ? (
                        <Box fontSize={16} display="flex" alignItems="center">
                            {domain && Utils?.formatDomainName ? Utils.formatDomainName(domain) : provider.name}
                        </Box>
                    ) : (
                        <Box fontSize={16} display="flex" alignItems="center">
                            {wallet.name}
                            {domain && Utils?.formatDomainName ? (
                                <Typography className={classes.domain}>{Utils.formatDomainName(domain)}</Typography>
                            ) : null}
                        </Box>
                    )}

                    <Box fontSize={12}>
                        <FormattedAddress address={wallet.address} size={10} formatter={Utils?.formatAddress} />
                    </Box>
                </Box>
            </Stack>
            {children}
        </Stack>
    )
}
