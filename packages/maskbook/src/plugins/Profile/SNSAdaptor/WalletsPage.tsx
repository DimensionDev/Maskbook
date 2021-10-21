import { RewardIcon } from '@masknet/icons'
import { WalletMessages } from '@masknet/plugin-wallet'
import { NetworkIcon, useRemoteControlledDialog, useSnackbarCallback } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import {
    formatEthereumAddress,
    getNetworkTypeFromChainId,
    resolveAddressLinkOnExplorer,
    useChainColor,
    useChainId,
    useWallets,
} from '@masknet/web3-shared-evm'
import { Button, Link, List, ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material'
import { useMemo } from 'react'
import { Trans } from 'react-i18next'
import { Copy, ExternalLink } from 'react-feather'
import { useCopyToClipboard } from 'react-use'

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
    icon: {
        width: 20,
        height: 20,
        minWidth: 'unset',
        marginRight: theme.spacing(1),
    },

    link: {
        color: theme.palette.text.secondary,
        fontSize: 14,
        display: 'flex',
        alignItems: 'center',
    },
    linkIcon: {
        marginLeft: theme.spacing(1),
    },
    address: {
        display: 'flex',
    },
}))
export function WalletsPage() {
    const wallets = useWallets()

    const chainId = useChainId()
    const { classes } = useStyles()
    const chainColor = useChainColor()
    const { openDialog: openSelectWalletDialog } = useRemoteControlledDialog(
        WalletMessages.events.walletStatusDialogUpdated,
    )

    //#region copy addr to clipboard
    const [, copyToClipboard] = useCopyToClipboard()
    const onCopy = useSnackbarCallback({
        executor: async (ev: React.MouseEvent<HTMLAnchorElement>, address) => copyToClipboard(address),
        deps: [],
        successText: 'Copy wallet address successfully!',
    })
    //#endregion

    const walletsList = useMemo(() => {
        return (
            <List>
                {wallets.map((wallet, i) => (
                    <ListItem key={i}>
                        <ListItemIcon className={classes.icon}>
                            <NetworkIcon size={20} networkType={getNetworkTypeFromChainId(chainId)} />
                        </ListItemIcon>
                        <ListItemIcon className={classes.address}>
                            <Typography variant="body1" color="textPrimary">
                                {formatEthereumAddress(wallet.address, 4)}
                            </Typography>
                            <Link
                                className={classes.link}
                                underline="none"
                                component="button"
                                title="Copy Address"
                                onClick={(e: React.MouseEvent<HTMLAnchorElement>) => onCopy(e, wallet.address)}>
                                <Copy className={classes.linkIcon} size={14} />
                            </Link>
                            <Link
                                className={classes.link}
                                href={resolveAddressLinkOnExplorer(chainId, wallet.address)}
                                target="_blank"
                                title="View on Explorer"
                                rel="noopener noreferrer">
                                <ExternalLink className={classes.linkIcon} size={14} />
                            </Link>
                        </ListItemIcon>
                        <ListItemText />
                        <ListItemIcon>
                            <RewardIcon />
                            Tip
                        </ListItemIcon>
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
