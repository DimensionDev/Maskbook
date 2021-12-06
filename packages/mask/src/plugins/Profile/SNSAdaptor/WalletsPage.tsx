import { useMemo } from 'react'
import { Trans } from 'react-i18next'
import { useCopyToClipboard } from 'react-use'
import { Copy, ExternalLink } from 'react-feather'
import { RewardIcon } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { WalletMessages } from '@masknet/plugin-wallet'
import { NetworkPluginID, useNetworkDescriptor } from '@masknet/plugin-infra'
import { ImageIcon, useRemoteControlledDialog, useSnackbarCallback } from '@masknet/shared'
import { formatEthereumAddress, resolveAddressLinkOnExplorer, useChainId, useWallets } from '@masknet/web3-shared-evm'
import { Button, Link, List, ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material'
import { useI18N } from '../../../utils'

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
    const { classes } = useStyles()
    const { t } = useI18N()
    const chainId = useChainId()
    const wallets = useWallets()
    const networkDescriptor = useNetworkDescriptor(undefined, NetworkPluginID.PLUGIN_EVM)
    const { openDialog: openSelectWalletDialog } = useRemoteControlledDialog(
        WalletMessages.events.walletStatusDialogUpdated,
    )

    //#region copy addr to clipboard
    const [, copyToClipboard] = useCopyToClipboard()
    const onCopy = useSnackbarCallback({
        executor: async (ev: React.MouseEvent<HTMLAnchorElement>, address) => copyToClipboard(address),
        deps: [],
        successText: t('copy_success_of_wallet_addr'),
    })
    //#endregion

    const walletsList = useMemo(() => {
        return (
            <List>
                {wallets.map((wallet, i) => (
                    <ListItem key={i}>
                        <ListItemIcon className={classes.icon}>
                            <ImageIcon size={20} icon={networkDescriptor?.icon} />
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
                            {t('tip')}
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
                        {t('plugin_wallet_on_connect')}
                    </Button>
                </div>
            ) : (
                walletsList
            )}
        </>
    )
}
