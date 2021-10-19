import { FormattedAddress, useRemoteControlledDialog, useValueRef, useSnackbarCallback } from '@masknet/shared'
import {
    ProviderType,
    resolveAddressLinkOnExplorer,
    useChainId,
    useChainIdValid,
    useWallet,
} from '@masknet/web3-shared-evm'
import { Button, DialogActions, DialogContent, Link, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import ErrorIcon from '@mui/icons-material/Error'
import classNames from 'classnames'
import { useCallback } from 'react'
import { Copy, ExternalLink } from 'react-feather'
import { useCopyToClipboard } from 'react-use'
import { InjectedDialog } from '../../../../components/shared/InjectedDialog'
import { MaskApplicationBox } from '../../../../components/shared/MaskApplicationBox'
import { WalletIcon } from '../../../../components/shared/WalletIcon'
import Services from '../../../../extension/service'
import { useI18N } from '../../../../utils'
import { WalletMessages } from '../../messages'
import { currentProviderSettings } from '../../settings'
import { getMaskColor } from '@masknet/theme'

const useStyles = makeStyles()((theme) => ({
    content: {
        padding: theme.spacing(2, 3, 3),
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
        backgroundColor: theme.palette.mode === 'light' ? '#111418' : 'rgb(29, 155, 240)',
        ...(theme.palette.mode === 'light'
            ? {
                  '&:hover': {
                      backgroundColor: '#2f3640',
                  },
              }
            : {}),
        padding: theme.spacing(1, 2),
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
        color: '#1C68F3',
    },
    subTitle: {
        fontSize: 18,
        lineHeight: '24px',
        fontWeight: 600,
        marginBottom: 11.5,
        color: theme.palette.text.primary,
    },
    networkIcon: {
        backgroundColor: '#fff !important',
    },
    providerIcon: {
        backgroundColor: '#F7F9FA !important',
    },
    applicationBox: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: getMaskColor(theme).twitterBackground,
        borderRadius: '8px',
        cursor: 'pointer',
        height: 100,
        '&:hover': {
            transform: 'translateX(2.5px) translateY(-2px)',
            boxShadow: `0px 12px 28px ${
                theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.02)'
            }`,
        },
    },
    applicationWrapper: {
        display: 'grid',
        gridTemplateColumns: '123px 123px 123px 123px',
        gridTemplateRows: '100px',
        rowGap: 12,
        justifyContent: 'space-between',
        height: 324,
    },
    applicationImg: {
        width: 36,
        height: 36,
        marginBottom: 10,
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
        <InjectedDialog title="Mask Network" open={open} onClose={closeDialog} maxWidth="sm">
            <DialogContent className={classes.content}>
                <Typography className={classes.subTitle}>{t('wallets')}</Typography>
                <section className={classes.currentAccount}>
                    <WalletIcon
                        size={48}
                        badgeSize={18}
                        classes={{
                            networkIcon: classes.networkIcon,
                            providerIcon: classes.providerIcon,
                        }}
                    />
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
                                {/* <Edit3 size={16} color="currentcolor" /> */}
                            </Link>
                        </div>
                        <div className={classes.infoRow}>
                            <Typography className={classes.address} variant="body2">
                                <FormattedAddress address={selectedWallet.address} size={9} />
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
                <Typography className={classes.subTitle}>{t('applications')}</Typography>
                <MaskApplicationBox closeDialog={closeDialog} />
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
