import { memo } from 'react'
import { Box, Button, Stack, Typography } from '@material-ui/core'
import {
    ProviderType,
    TransactionStatusType,
    useChainColor,
    useChainDetailed,
    useWallet,
    useWeb3StateContext,
} from '@masknet/web3-shared'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { FormattedAddress, ProviderIcon, useRemoteControlledDialog } from '@masknet/shared'
import { PluginMessages } from '../../../../API'
import { LoadingIcon } from '@masknet/icons'
import { useRecentTransactions } from '../../hooks/useRecentTransactions'
import { useDashboardI18N } from '../../../../locales'

const useStyles = makeStyles()((theme) => ({
    bar: {
        minWidth: 80,
        borderRadius: 30,
        lineHeight: '28px',
        height: '28px',
        cursor: 'default',
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
    const chainDetailed = useChainDetailed()
    const chainColor = useChainColor()

    const { value: pendingTransactions = [] } = useRecentTransactions(TransactionStatusType.NOT_DEPEND)

    const { openDialog: openConnectWalletDialog } = useRemoteControlledDialog(
        PluginMessages.Wallet.events.selectProviderDialogUpdated,
    )

    if (!wallet) {
        return <Button onClick={openConnectWalletDialog}>{t.wallets_connect_wallet_connect()}</Button>
    }
    return (
        <WalletStateBarUI
            isPending={!!pendingTransactions.length}
            chain={chainDetailed?.chain}
            chainColor={chainColor}
            providerType={providerType}
            openConnectWalletDialog={openConnectWalletDialog}
            walletName={wallet.name ?? ''}
            walletAddress={wallet.address}
        />
    )
})

interface WalletStateBarUIProps {
    chain?: string
    chainColor: string
    isPending: boolean
    providerType: ProviderType
    walletName: string
    walletAddress: string
    openConnectWalletDialog(): void
}

const WalletStateBarUI = memo<WalletStateBarUIProps>(
    ({ chain, isPending, providerType, chainColor, walletAddress, walletName, openConnectWalletDialog }) => {
        const t = useDashboardI18N()
        const { classes } = useStyles()

        return (
            <Stack justifyContent="center" direction="row" alignItems="center">
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="center"
                    sx={{ background: chainColor.replace(')', ', 0.1)'), px: 2, mr: 1 }}
                    color={chainColor}
                    className={classes.bar}>
                    <Typography component="span" sx={{ background: chainColor }} className={classes.dot} />
                    <Typography component="span" fontSize={12}>
                        {chain}
                    </Typography>
                </Stack>
                {isPending && (
                    <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="center"
                        sx={{ px: 2, background: MaskColorVar.orangeMain.alpha(0.1), color: MaskColorVar.orangeMain }}
                        className={classes.bar}>
                        <LoadingIcon sx={{ fontSize: 12, mr: 0.8, color: MaskColorVar.orangeMain }} />
                        <Typography component="span" fontSize={12} display="inline-block">
                            {t.wallet_transactions_pending()}
                        </Typography>
                    </Stack>
                )}
                <Stack mx={1} justifyContent="center" sx={{ cursor: 'pointer' }} onClick={openConnectWalletDialog}>
                    <ProviderIcon providerType={providerType} />
                </Stack>
                <Box sx={{ userSelect: 'none', cursor: 'pointer' }} onClick={openConnectWalletDialog}>
                    <Box fontSize={16}>{walletName}</Box>
                    <Box fontSize={12}>
                        <FormattedAddress address={walletAddress} size={10} />
                    </Box>
                </Box>
            </Stack>
        )
    },
)
