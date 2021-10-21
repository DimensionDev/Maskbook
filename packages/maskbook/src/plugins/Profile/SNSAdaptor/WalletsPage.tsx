import { WalletMessages } from '@masknet/plugin-wallet'
import { NetworkIcon, useRemoteControlledDialog } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { formatEthereumAddress, getNetworkTypeFromChainId, useChainId, useWallets } from '@masknet/web3-shared-evm'
import { Button, List, ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material'
import { useMemo } from 'react'
import { Trans } from 'react-i18next'

const useStyles = makeStyles()((theme) => ({
    root: {
        justifyContent: 'center',
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'column',
    },
    connect: {
        borderRadius: 9999,
        marginTop: 32,
    },
    message: {
        marginTop: 32,
    },
}))
export function WalletsPage() {
    const wallets = useWallets()

    const chainId = useChainId()
    const { classes } = useStyles()

    const { openDialog: openSelectWalletDialog } = useRemoteControlledDialog(
        WalletMessages.events.walletStatusDialogUpdated,
    )
    const walletsList = useMemo(() => {
        return (
            <List>
                {wallets.map((wallet) => (
                    <ListItem>
                        <ListItemIcon>
                            <NetworkIcon size={20} networkType={getNetworkTypeFromChainId(chainId)} />
                        </ListItemIcon>
                        <ListItemText>
                            <Typography variant="body1" color="textPrimary">
                                {formatEthereumAddress(wallet.address, 4)}
                            </Typography>
                        </ListItemText>
                    </ListItem>
                ))}
            </List>
        )
    }, [wallets])

    return (
        <>
            {wallets.length === 0 ? (
                <div className={classes.root}>
                    <Typography variant="body1" color="textPrimary" align="center" className={classes.message}>
                        <Trans i18nKey="plugin_profile_no_wallets" />
                    </Typography>
                    <Button
                        className={classes.connect}
                        size="small"
                        variant="contained"
                        onClick={openSelectWalletDialog}>
                        Connect Wallet
                    </Button>
                </div>
            ) : (
                walletsList
            )}
        </>
    )
}
