import { memo } from 'react'
import { Box, Button, Stack, Typography } from '@material-ui/core'
import {
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
    network: {
        minWidth: 80,
        borderRadius: 30,
        textAlign: 'center',
        lineHeight: '28px',
        height: '28px',
    },
    pending: {
        minWidth: 80,
        borderRadius: 30,
        verticalAlign: 'middle',
        lineHeight: '28px',
        height: '28px',
        background: MaskColorVar.orangeMain.alpha(0.1),
        color: MaskColorVar.orangeMain,
        '&>svg': {
            color: MaskColorVar.orangeMain,
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
}))

export const WalletStateBar = memo(() => {
    const t = useDashboardI18N()
    const { classes } = useStyles()

    const wallet = useWallet()
    const chainColor = useChainColor()
    const { providerType } = useWeb3StateContext()
    const chainDetailed = useChainDetailed()
    const { value: pendingTransactions = [] } = useRecentTransactions(TransactionStatusType.NOT_DEPEND)

    const { openDialog: openConnectWalletDialog } = useRemoteControlledDialog(
        PluginMessages.Wallet.events.selectProviderDialogUpdated,
    )

    if (!wallet) {
        return <Button onClick={openConnectWalletDialog}>Connect Wallet</Button>
    }
    return (
        <Stack justifyContent="center" direction="row" alignItems="center">
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="center"
                sx={{ background: chainColor.replace(')', ', 0.1)'), px: 2, mr: 1 }}
                color={chainColor}
                className={classes.network}
                onClick={openConnectWalletDialog}>
                <Typography component="span" sx={{ background: chainColor }} className={classes.dot} />
                <Typography component="span" fontSize={12}>
                    {chainDetailed?.chain}
                </Typography>
            </Stack>
            {!!pendingTransactions.length && (
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="center"
                    sx={{ px: 2 }}
                    className={classes.pending}>
                    <LoadingIcon sx={{ fontSize: 12, mr: 0.8 }} />
                    <Typography component="span" fontSize={12} display="inline-block">
                        {t.wallet_transactions_pending()}
                    </Typography>
                </Stack>
            )}
            <Box mr={1}>
                <ProviderIcon providerType={providerType} />
            </Box>
            <Box>
                <Box fontSize={16}>{wallet.name}</Box>
                <Box fontSize={12}>
                    <FormattedAddress address={wallet.address} size={10} />
                </Box>
            </Box>
        </Stack>
    )
})
