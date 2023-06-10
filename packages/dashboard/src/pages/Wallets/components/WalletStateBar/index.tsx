import React, { type FC, memo } from 'react'
import { Box, Button, Stack, Typography } from '@mui/material'
import { ProviderType } from '@masknet/web3-shared-evm'
import { makeStyles, MaskColorVar, LoadingBase } from '@masknet/theme'
import { FormattedAddress, WalletIcon, SelectProviderDialog, WalletStatusDialog } from '@masknet/shared'
import {
    useNetworkDescriptor,
    useProviderDescriptor,
    useWallet,
    useReverseAddress,
    useRecentTransactions,
    useChainContext,
} from '@masknet/web3-hooks-base'
import { Others } from '@masknet/web3-providers'
import { NetworkPluginID } from '@masknet/shared-base'
import { TransactionStatusType } from '@masknet/web3-shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useDashboardI18N } from '../../../../locales/index.js'
import { useNetworkSelector } from './useNetworkSelector.js'

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

    const { account } = useChainContext()
    const wallet = useWallet()
    const networkDescriptor = useNetworkDescriptor()
    const providerDescriptor = useProviderDescriptor()
    const pendingTransactions = useRecentTransactions(NetworkPluginID.PLUGIN_EVM, TransactionStatusType.NOT_DEPEND)

    const [menu, openMenu] = useNetworkSelector()

    const { data: domain } = useReverseAddress(NetworkPluginID.PLUGIN_EVM, account)

    if (!account) {
        return <Button onClick={() => SelectProviderDialog.open()}>{t.wallets_connect_wallet_connect()}</Button>
    }
    return (
        <WalletStateBarUI
            isPending={!!pendingTransactions.length}
            name={wallet?.name ?? providerDescriptor?.name}
            address={account}
            domain={domain}
            network={networkDescriptor}
            provider={providerDescriptor}
            openConnectWalletDialog={WalletStatusDialog.open}
            openMenu={openMenu}>
            {menu}
        </WalletStateBarUI>
    )
})

interface WalletStateBarUIProps {
    isPending: boolean
    network?: Web3Helper.NetworkDescriptorAll
    provider?: Web3Helper.ProviderDescriptorAll
    name?: string
    address?: string
    domain?: string
    openConnectWalletDialog(): void
    openMenu: ReturnType<typeof useNetworkSelector>[1]
}

export const WalletStateBarUI: FC<React.PropsWithChildren<WalletStateBarUIProps>> = ({
    isPending,
    network,
    provider,
    name,
    address,
    domain,
    openConnectWalletDialog,
    openMenu,
    children,
}) => {
    const t = useDashboardI18N()
    const { classes } = useStyles()

    if (!network || !provider) return null

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
            {isPending ? (
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
                    <LoadingBase sx={{ fontSize: 12, mr: 0.8, color: MaskColorVar.orangeMain }} />
                    <Typography component="span" fontSize={12} display="inline-block">
                        {t.wallet_transactions_pending()}
                    </Typography>
                </Stack>
            ) : null}
            <Stack direction="row" onClick={openConnectWalletDialog} sx={{ cursor: 'pointer' }}>
                <Stack mx={1} justifyContent="center">
                    <WalletIcon mainIcon={provider.icon} size={38} />
                </Stack>
                <Box sx={{ userSelect: 'none' }}>
                    {provider.type !== ProviderType.MaskWallet ? (
                        <Box fontSize={16} display="flex" alignItems="center">
                            {domain ? Others.formatDomainName(domain) : provider.name}
                        </Box>
                    ) : (
                        <Box fontSize={16} display="flex" alignItems="center">
                            {name}
                            {domain ? (
                                <Typography className={classes.domain}>{Others.formatDomainName(domain)}</Typography>
                            ) : null}
                        </Box>
                    )}
                    <Box fontSize={12}>
                        <FormattedAddress address={address} size={4} formatter={Others.formatAddress} />
                    </Box>
                </Box>
            </Stack>
            {children}
        </Stack>
    )
}
