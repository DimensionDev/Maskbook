import { useCallback } from 'react'
import { Copy, ExternalLink, XCircle, RotateCcw, Edit3 } from 'react-feather'
import { useCopyToClipboard } from 'react-use'
import ErrorIcon from '@material-ui/icons/Error'
import { Button, DialogActions, DialogContent, Link, makeStyles, Typography, List, ListItem } from '@material-ui/core'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { ProviderIcon } from '../../../components/shared/ProviderIcon'
import { useSnackbarCallback } from '../../../extension/options-page/DashboardDialogs/Base'
import Services from '../../../extension/service'
import { useRemoteControlledDialog, useValueRef, useI18N } from '../../../utils'
import { useChainId, useChainIdValid } from '../../../web3/hooks/useChainId'
import { resolveAddressLinkOnExplorer } from '../../../web3/pipes'
import { ChainId, ProviderType } from '../../../web3/types'
import { EthereumChainChip } from '../../../web3/UI/EthereumChainChip'
import { useWallet } from '../hooks/useWallet'
import { WalletMessages } from '../messages'
import { currentSelectedWalletProviderSettings } from '../settings'
import { FormattedAddress } from '@dimensiondev/maskbook-shared'

const useStyles = makeStyles((theme) => ({
    content: {
        padding: theme.spacing(2, 4, 3),
    },
    currentAccount: {
        padding: theme.spacing(2, 3),
        display: 'flex',
        backgroundColor: '#F7F9FA',
        borderRadius: 8,
    },
    accountInfo: {
        fontSize: 16,
    },
    accountName: {
        fontSize: 16,
    },
    infoRow: {},
    footer: {
        fontSize: 12,
        textAlign: 'left',
        padding: theme.spacing(2),
        borderTop: `1px solid ${theme.palette.divider}`,
        justifyContent: 'flex-start',
    },
    section: {
        alignItems: 'center',
        '&:last-child': {
            paddingTop: theme.spacing(0.5),
        },
    },
    actions: {},
    actionButton: {
        fontSize: 12,
        marginLeft: theme.spacing(1),
    },
    icon: {
        fontSize: 48,
        width: 48,
        height: 48,
        marginRight: theme.spacing(1),
    },
    tip: {
        flex: 1,
        fontSize: 14,
    },
    address: {
        fontSize: 16,
        padding: theme.spacing(1),
        marginRight: theme.spacing(1),
        display: 'inline-block',
    },
    link: {
        color: theme.palette.text.secondary,
        fontSize: 14,
    },
    linkIcon: {
        marginRight: theme.spacing(1),
    },
    sectionTitle: {
        display: 'flex',
        justifyContent: 'space-between',
    },
    sectionTitleText: {
        fontSize: '18px !important' as '18px',
    },
    clearAllButton: {
        fontSize: 14,
    },
    transaction: {
        fontSize: 14,
        padding: 0,
        marginTop: 6,
    },
    transactionButton: {
        marginLeft: 'auto',
    },
}))

export interface WalletStatusDialogProps {}

export function WalletStatusDialog(props: WalletStatusDialogProps) {
    const { t } = useI18N()
    const classes = useStyles()

    const chainId = useChainId()
    const chainIdValid = useChainIdValid()
    const selectedWallet = useWallet()
    const selectedWalletProvider = useValueRef(currentSelectedWalletProviderSettings)

    //#region copy addr to clipboard
    const [, copyToClipboard] = useCopyToClipboard()
    const onCopy = useSnackbarCallback(
        async (ev: React.MouseEvent<HTMLDivElement>) => {
            ev.stopPropagation()
            copyToClipboard(selectedWallet?.address ?? '')
        },
        [],
        undefined,
        undefined,
        undefined,
        t('copy_success_of_wallet_addr'),
    )
    //#endregion

    //#region remote controlled dialog logic
    const { open, closeDialog } = useRemoteControlledDialog(WalletMessages.events.walletStatusDialogUpdated)
    //#endregion

    //#region change provider
    const { openDialog: openSelectProviderDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectProviderDialogUpdated,
    )
    //#endregion

    //#region walletconnect
    const { setDialog: setWalletConnectDialog } = useRemoteControlledDialog(
        WalletMessages.events.walletConnectQRCodeDialogUpdated,
    )
    //#endregion

    const onDisconnect = useCallback(async () => {
        if (selectedWalletProvider !== ProviderType.WalletConnect) return
        closeDialog()
        setWalletConnectDialog({
            open: true,
            uri: await Services.Ethereum.createConnectionURI(),
        })
    }, [selectedWalletProvider, closeDialog, setWalletConnectDialog])
    const onChange = useCallback(() => {
        closeDialog()
        openSelectProviderDialog()
    }, [closeDialog, openSelectProviderDialog])

    if (!selectedWallet) return null

    return (
        <InjectedDialog
            title={t('wallet_status_title')}
            open={open}
            onClose={closeDialog}
            DialogProps={{ maxWidth: 'xs' }}>
            <DialogContent className={classes.content}>
                <section className={classes.currentAccount}>
                    <ProviderIcon classes={{ icon: classes.icon }} size={48} providerType={selectedWalletProvider} />
                    <div className={classes.accountInfo}>
                        <div className={classes.infoRow}>
                            <Typography className={classes.accountName}>{selectedWallet.name}</Typography>
                            <Link component="button">
                                <Edit3 color="currentcolor" />
                            </Link>
                        </div>
                        <div className={classes.infoRow}>
                            <Typography className={classes.address}>
                                <FormattedAddress address={selectedWallet.address} size={4} />
                            </Typography>
                            <Link
                                className={classes.link}
                                underline="none"
                                component="button"
                                title={t('wallet_status_button_copy_address')}
                                onClick={onCopy}>
                                <Copy className={classes.linkIcon} size={14} />
                            </Link>
                            <Link
                                className={classes.link}
                                href={`${resolveAddressLinkOnExplorer(chainId, selectedWallet.address)}`}
                                target="_blank"
                                title={t('plugin_wallet_view_on_etherscan')}
                                rel="noopener noreferrer">
                                <ExternalLink className={classes.linkIcon} size={14} />
                            </Link>
                        </div>
                    </div>
                    <section className={classes.actions}>
                        {selectedWalletProvider === ProviderType.WalletConnect ? (
                            <Button
                                className={classes.actionButton}
                                color="primary"
                                size="small"
                                variant="outlined"
                                onClick={onDisconnect}>
                                {t('wallet_status_button_disconnect')}
                            </Button>
                        ) : null}
                        <Button className={classes.actionButton} color="primary" size="small" onClick={onChange}>
                            {t('wallet_status_button_change')}
                        </Button>
                    </section>
                </section>
                <section className={classes.section}>
                    {chainIdValid && chainId !== ChainId.Mainnet ? (
                        <EthereumChainChip chainId={chainId} ChipProps={{ variant: 'outlined' }} />
                    ) : null}
                </section>
                <section className={classes.section}>
                    <div className={classes.sectionTitle}>
                        <Typography variant="h2" className={classes.sectionTitleText}>
                            {t('plugin_wallet_recent_transaction')}
                        </Typography>
                        <Button aria-label="Clear All" className={classes.clearAllButton}>
                            ({t('plugin_wallet_clear_all')})
                        </Button>
                    </div>
                    <List>
                        <ListItem className={classes.transaction}>
                            <Typography variant="body2">Add 2,000.00 USDT </Typography>
                            <ExternalLink className={classes.linkIcon} size={14} />
                            <Link component="button" className={classes.transactionButton}>
                                <RotateCcw size={12} />
                            </Link>
                        </ListItem>
                        <ListItem className={classes.transaction}>
                            <Typography variant="body2">Add 2,000.00 USDT </Typography>
                            <ExternalLink className={classes.linkIcon} size={14} />
                            <Link component="button" className={classes.transactionButton}>
                                <XCircle size={12} color="red" />
                            </Link>
                        </ListItem>
                    </List>
                </section>
            </DialogContent>
            {!chainIdValid ? (
                <DialogActions className={classes.footer}>
                    <ErrorIcon color="secondary" fontSize="small" />
                    <Typography color="secondary" variant="body2">
                        {t('plugin_wallet_wrong_network_tip')}
                    </Typography>
                </DialogActions>
            ) : null}
        </InjectedDialog>
    )
}
