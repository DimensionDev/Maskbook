import { useCallback } from 'react'
import { Copy, ExternalLink } from 'react-feather'
import { useCopyToClipboard } from 'react-use'
import ErrorIcon from '@material-ui/icons/Error'
import { Button, createStyles, DialogActions, DialogContent, Link, makeStyles, Typography } from '@material-ui/core'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { ProviderIcon } from '../../../components/shared/ProviderIcon'
import { useSnackbarCallback } from '../../../extension/options-page/DashboardDialogs/Base'
import Services from '../../../extension/service'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useChainId, useChainIdValid } from '../../../web3/hooks/useChainState'
import { resolveLinkOnEtherscan, resolveProviderName } from '../../../web3/pipes'
import { ChainId, ProviderType } from '../../../web3/types'
import { EthereumChainChip } from '../../../web3/UI/EthereumChainChip'
import { formatEthereumAddress } from '../formatter'
import { useWallet } from '../hooks/useWallet'
import { WalletMessages } from '../messages'
import { currentSelectedWalletProviderSettings } from '../settings'
import { useBlurContext } from '../../../extension/options-page/DashboardContexts/BlurContext'

const useStyles = makeStyles((theme) =>
    createStyles({
        content: {
            padding: theme.spacing(2, 4, 3),
        },
        footer: {
            fontSize: 12,
            textAlign: 'left',
            padding: theme.spacing(2),
            borderTop: `1px solid ${theme.palette.divider}`,
            justifyContent: 'flex-start',
        },
        section: {
            display: 'flex',
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
            fontSize: 24,
            width: 24,
            height: 24,
            marginRight: theme.spacing(1),
        },
        tip: {
            flex: 1,
            fontSize: 14,
        },
        address: {
            fontSize: 24,
            padding: theme.spacing(1),
            marginRight: theme.spacing(1),
        },
        link: {
            display: 'flex',
            alignItems: 'center',
            color: theme.palette.text.secondary,
            fontSize: 14,
            marginRight: theme.spacing(2),
        },
        linkIcon: {
            marginRight: theme.spacing(1),
        },
    }),
)

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
    const [open, setOpen] = useRemoteControlledDialog(WalletMessages.events.walletStatusDialogUpdated)
    const onClose = useCallback(() => {
        setOpen({
            open: false,
        })
    }, [setOpen])
    //#endregion

    //#region change provider
    const [, setSelectProviderDialogOpen] = useRemoteControlledDialog(WalletMessages.events.selectProviderDialogUpdated)
    //#endregion

    //#region walletconnect
    const [, setWalletConnectDialogOpen] = useRemoteControlledDialog(
        WalletMessages.events.walletConnectQRCodeDialogUpdated,
    )
    //#endregion

    // render in dashboard
    useBlurContext(open)

    const onDisconnect = useCallback(async () => {
        if (selectedWalletProvider !== ProviderType.WalletConnect) return
        setOpen({
            open: false,
        })
        setWalletConnectDialogOpen({
            open: true,
            uri: await Services.Ethereum.createConnectionURI(),
        })
    }, [selectedWalletProvider, setOpen, setWalletConnectDialogOpen])
    const onChange = useCallback(() => {
        setOpen({
            open: false,
        })
        setSelectProviderDialogOpen({
            open: true,
        })
    }, [setOpen, setSelectProviderDialogOpen])

    if (!selectedWallet) return null

    return (
        <InjectedDialog title={t('wallet_status_title')} open={open} onClose={onClose} DialogProps={{ maxWidth: 'xs' }}>
            <DialogContent className={classes.content}>
                <section className={classes.section}>
                    <Typography className={classes.tip} color="textSecondary">
                        {t('wallet_status_connect_with', { provider: resolveProviderName(selectedWalletProvider) })}
                    </Typography>
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
                            className={classes.actionButton}
                            color="primary"
                            size="small"
                            variant="outlined"
                            onClick={onChange}>
                            {t('wallet_status_button_change')}
                        </Button>
                    </section>
                </section>
                <section className={classes.section}>
                    <ProviderIcon classes={{ icon: classes.icon }} size={14} providerType={selectedWalletProvider} />
                    <Typography className={classes.address}>
                        {formatEthereumAddress(selectedWallet.address, 4)}
                    </Typography>
                    {chainIdValid && chainId !== ChainId.Mainnet ? (
                        <EthereumChainChip chainId={chainId} ChipProps={{ variant: 'outlined' }} />
                    ) : null}
                </section>
                <section className={classes.section}>
                    <Link className={classes.link} underline="none" component="button" onClick={onCopy}>
                        <Copy className={classes.linkIcon} size={14} />
                        <Typography variant="body2">{t('wallet_status_button_copy_address')}</Typography>
                    </Link>
                    <Link
                        className={classes.link}
                        href={`${resolveLinkOnEtherscan(chainId)}/address/${selectedWallet.address}`}
                        target="_blank"
                        rel="noopener noreferrer">
                        <ExternalLink className={classes.linkIcon} size={14} />
                        <Typography variant="body2">{t('plugin_wallet_view_on_etherscan')}</Typography>
                    </Link>
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
