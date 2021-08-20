import { FormattedAddress, useRemoteControlledDialog, useValueRef } from '@masknet/shared'
import {
    ProviderType,
    resolveAddressLinkOnExplorer,
    useChainId,
    useChainIdValid,
    useWallet,
} from '@masknet/web3-shared'
import { Button, DialogActions, DialogContent, Link, Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import ErrorIcon from '@material-ui/icons/Error'
import classNames from 'classnames'
import { useCallback } from 'react'
import { Copy, Edit3, ExternalLink } from 'react-feather'
import { useCopyToClipboard } from 'react-use'
import { InjectedDialog } from '../../../../components/shared/InjectedDialog'
import { WalletIcon } from '../../../../components/shared/WalletIcon'
import { useSnackbarCallback } from '../../../../extension/options-page/DashboardDialogs/Base'
import Services from '../../../../extension/service'
import { useI18N } from '../../../../utils'
import { WalletMessages } from '../../messages'
import { currentProviderSettings } from '../../settings'
import { RecentTransactionList } from './RecentTransactionList'
import { getMaskColor } from '@masknet/theme'

const useStyles = makeStyles()((theme) => ({
    content: {
        padding: theme.spacing(2, 4, 3),
    },
    currentAccount: {
        padding: theme.spacing(2, 3),
        marginBottom: theme.spacing(2),
        display: 'flex',
        backgroundColor: getMaskColor(theme).twitterBackground,
        borderRadius: 8,
        alignItems: 'center',
    },
    accountInfo: {
        fontSize: 16,
        flexGrow: 1,
        marginLeft: theme.spacing(1),
    },
    accountName: {
        fontSize: 16,
        marginRight: 6,
    },
    infoRow: {
        display: 'flex',
        alignItems: 'center',
    },
    footer: {
        fontSize: 12,
        textAlign: 'left',
        padding: theme.spacing(2),
        borderTop: `1px solid ${theme.palette.divider}`,
        justifyContent: 'flex-start',
    },
    transactionList: {
        alignItems: 'center',
    },
    actions: {},
    actionButton: {
        fontSize: 12,
        marginLeft: theme.spacing(1),
    },
    changeButton: {
        borderRadius: 20,
    },
    iconWrapper: {
        position: 'relative',
        height: 48,
        width: 48,
        marginRight: theme.spacing(1.5),
    },
    tip: {
        flex: 1,
        fontSize: 14,
    },
    address: {
        fontSize: 16,
        marginRight: theme.spacing(1),
        display: 'inline-block',
    },
    link: {
        color: theme.palette.text.secondary,
        fontSize: 14,
        display: 'flex',
        alignItems: 'center',
    },
    linkIcon: {
        marginRight: theme.spacing(1),
    },
}))

export interface WalletStatusDialogProps {}

export function WalletStatusDialog(props: WalletStatusDialogProps) {
    const { t } = useI18N()

    const { classes } = useStyles()
    const chainId = useChainId()
    const chainIdValid = useChainIdValid()
    const selectedWallet = useWallet()
    const selectedProviderType = useValueRef(currentProviderSettings)

    //#region copy addr to clipboard
    const [, copyToClipboard] = useCopyToClipboard()
    const onCopy = useSnackbarCallback(
        async (ev: React.MouseEvent<HTMLAnchorElement>) => {
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

    const { setDialog: setRenameDialog } = useRemoteControlledDialog(WalletMessages.events.walletRenameDialogUpdated)

    const onDisconnect = useCallback(async () => {
        if (selectedProviderType !== ProviderType.WalletConnect) return
        closeDialog()
        setWalletConnectDialog({
            open: true,
            uri: await Services.Ethereum.createConnectionURI(),
        })
    }, [selectedProviderType, closeDialog, setWalletConnectDialog])
    const onChange = useCallback(() => {
        closeDialog()
        openSelectProviderDialog()
    }, [closeDialog, openSelectProviderDialog])

    if (!selectedWallet) return null

    return (
        <InjectedDialog title={t('wallet_status_title')} open={open} onClose={closeDialog} maxWidth="sm">
            <DialogContent className={classes.content}>
                <section className={classes.currentAccount}>
                    <WalletIcon size={48} badgeSize={18} />
                    <div className={classes.accountInfo}>
                        <div className={classes.infoRow}>
                            <Typography className={classes.accountName}>{selectedWallet.name}</Typography>
                            <Link
                                className={classes.link}
                                component="button"
                                onClick={() => {
                                    setRenameDialog({
                                        open: true,
                                        wallet: selectedWallet,
                                    })
                                }}>
                                <Edit3 size={16} color="currentcolor" />
                            </Link>
                        </div>
                        <div className={classes.infoRow}>
                            <Typography className={classes.address} variant="body2">
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
                                href={resolveAddressLinkOnExplorer(chainId, selectedWallet.address)}
                                target="_blank"
                                title={t('plugin_wallet_view_on_explorer')}
                                rel="noopener noreferrer">
                                <ExternalLink className={classes.linkIcon} size={14} />
                            </Link>
                        </div>
                    </div>
                    <section className={classes.actions}>
                        {selectedProviderType === ProviderType.WalletConnect ? (
                            <Button
                                className={classes.actionButton}
                                color="primary"
                                size="small"
                                variant="outlined"
                                onClick={onDisconnect}>
                                {t('wallet_status_button_disconnect')}
                            </Button>
                        ) : null}
                        <Button
                            className={classNames(classes.actionButton)}
                            color="primary"
                            variant="contained"
                            size="small"
                            onClick={onChange}>
                            {t('wallet_status_button_change')}
                        </Button>
                    </section>
                </section>
                <section className={classes.transactionList}>
                    <RecentTransactionList />
                </section>
            </DialogContent>
            {!chainIdValid ? (
                <DialogActions className={classes.footer}>
                    <ErrorIcon color="secondary" fontSize="small" sx={{ marginRight: 1 }} />
                    <Typography color="secondary" variant="body2">
                        {t('plugin_wallet_wrong_network_tip')}
                    </Typography>
                </DialogActions>
            ) : null}
        </InjectedDialog>
    )
}
