import { FormattedAddress, useRemoteControlledDialog, useValueRef, useSnackbarCallback } from '@masknet/shared'
import { WalletMessages } from '../../plugins/Wallet/messages'
import classNames from 'classnames'
import { currentProviderSettings } from '../../plugins/Wallet/settings'
import { useCopyToClipboard } from 'react-use'
import { Copy, ExternalLink } from 'react-feather'
import { useI18N } from '../../utils'
import Services from '../../extension/service'
import { ProviderType, resolveAddressLinkOnExplorer, useWallet, useChainId } from '@masknet/web3-shared-evm'
import { Button, Link, Typography } from '@mui/material'
import { makeStyles, getMaskColor } from '@masknet/theme'
import { WalletIcon } from './WalletIcon'
import { useCallback } from 'react'

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
    networkIcon: {
        backgroundColor: '#F6F8F8 !important',
        border: '1px solid #ffffff',
        borderRadius: '50%',
        position: 'absolute',
        right: -6,
        bottom: -4,
    },
    providerIcon: {
        backgroundColor: 'none !important',
    },
    connectButtonWrapper: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        margin: theme.spacing(2, 0),
    },
}))

export function WalletStatusBox() {
    const { t } = useI18N()
    const chainId = useChainId()
    const selectedWallet = useWallet()
    const { classes } = useStyles()
    const { setDialog: setRenameDialog } = useRemoteControlledDialog(WalletMessages.events.walletRenameDialogUpdated)
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
        if (selectedProviderType !== ProviderType.WalletConnect) return
        setWalletConnectDialog({
            open: true,
            uri: await Services.Ethereum.createConnectionURI(),
        })
    }, [selectedProviderType, setWalletConnectDialog])

    const onChange = useCallback(() => {
        openSelectProviderDialog()
    }, [openSelectProviderDialog])

    return selectedWallet ? (
        <section className={classes.currentAccount}>
            <WalletIcon
                size={18}
                badgeSize={48}
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
                        }}
                    />
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
            <section>
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
    ) : (
        <section className={classes.connectButtonWrapper}>
            <Button
                className={classNames(classes.actionButton)}
                color="primary"
                variant="contained"
                size="small"
                onClick={onChange}>
                {t('plugin_wallet_on_connect')}
            </Button>
        </section>
    )
}
