import { useCallback } from 'react'
import { Copy, ExternalLink, Edit3 } from 'react-feather'
import { useCopyToClipboard } from 'react-use'
import classNames from 'classnames'
import ErrorIcon from '@material-ui/icons/Error'
import { FormattedAddress } from '@dimensiondev/maskbook-shared'
import { Button, DialogActions, DialogContent, Link, makeStyles, Typography } from '@material-ui/core'
import { InjectedDialog } from '../../../../components/shared/InjectedDialog'
import { ProviderIcon } from '../../../../components/shared/ProviderIcon'
import { useSnackbarCallback } from '../../../../extension/options-page/DashboardDialogs/Base'
import Services from '../../../../extension/service'
import { useRemoteControlledDialog } from '../../../../utils/hooks/useRemoteControlledDialog'
import { useValueRef } from '../../../../utils/hooks/useValueRef'
import { useI18N } from '../../../../utils/i18n-next-ui'
import { useChainId, useChainIdValid } from '../../../../web3/hooks/useChainId'
import { resolveAddressLinkOnExplorer } from '../../../../web3/pipes'
import { ChainId, ProviderType } from '../../../../web3/types'
import { EthereumChainChip } from '../../../../web3/UI/EthereumChainChip'
import { useWallet } from '../../hooks/useWallet'
import { WalletMessages, WalletRPC } from '../../messages'
import { currentSelectedWalletProviderSettings } from '../../settings'
import { RecentTransactionList } from './RecentTransactionList'
import { useAccount } from '../../../../web3/hooks/useAccount'

const useStyles = makeStyles((theme) => ({
    content: {
        padding: theme.spacing(2, 4, 3),
    },
    currentAccount: {
        padding: theme.spacing(2, 3),
        display: 'flex',
        backgroundColor: theme.palette.mode === 'dark' ? '#17191D' : '#F7F9FA',
        borderRadius: 8,
        alignItems: 'center',
    },
    accountInfo: {
        fontSize: 16,
        flexGrow: 1,
    },
    accountName: {
        fontSize: 16,
        marginRight: 6,
    },
    infoRow: {
        display: 'flex',
        alignItems: 'center',
        marginLeft: theme.spacing(1),
    },
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
    changeButton: {
        backgroundColor: '#1C68F3',
        borderRadius: 20,
        color: '#FFFFFF',
        '&:hover': {
            backgroundColor: '#1854c4',
        },
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
        marginRight: theme.spacing(1),
        display: 'inline-block',
    },
    link: {
        color: theme.palette.text.secondary,
        fontSize: 14,
    },
    linkIcon: {
        marginRight: theme.spacing(1),
        color: '#1C68F3',
    },
    sectionTitle: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: theme.spacing(1),
    },
    sectionTitleText: {
        fontSize: '18px',
        fontWeight: 500,
        fontFamily: 'Helvetica',
    },
    clearAllButton: {
        fontSize: 14,
        marginLeft: 'auto',
    },
}))

export interface WalletStatusDialogProps {}

export function WalletStatusDialog(props: WalletStatusDialogProps) {
    const { t } = useI18N()
    const classes = useStyles()

    const account = useAccount()
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

    //#region clear the most recent transactions
    const onClear = useSnackbarCallback(
        async (ev) => {
            await WalletRPC.clearRecentTransactions(account)
        },
        [],
        undefined,
        undefined,
        undefined,
        t('done'),
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
            DialogProps={{ maxWidth: 'sm' }}>
            <DialogContent className={classes.content}>
                <section className={classes.currentAccount}>
                    <ProviderIcon classes={{ icon: classes.icon }} size={48} providerType={selectedWalletProvider} />
                    <div className={classes.accountInfo}>
                        <div className={classes.infoRow}>
                            <Typography className={classes.accountName}>{selectedWallet.name}</Typography>
                            <Link
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
                        <Button
                            className={classNames(classes.actionButton, classes.changeButton)}
                            color="primary"
                            size="small"
                            onClick={onChange}>
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
                        <Link
                            aria-label="Clear All"
                            component="button"
                            className={classes.clearAllButton}
                            onClick={onClear}>
                            ({t('plugin_wallet_clear_all')})
                        </Link>
                    </div>
                    <RecentTransactionList />
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
