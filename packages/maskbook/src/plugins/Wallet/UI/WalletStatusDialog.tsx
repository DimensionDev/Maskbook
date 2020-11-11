import { Button, createStyles, DialogContent, makeStyles, Typography } from '@material-ui/core'
import React, { useCallback } from 'react'
import { Copy, ExternalLink } from 'react-feather'
import { useCopyToClipboard } from 'react-use'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { ProviderIcon } from '../../../components/shared/ProviderIcon'
import { useSnackbarCallback } from '../../../extension/options-page/DashboardDialogs/Base'
import Services from '../../../extension/service'
import { currentWalletConnectConnectedSettings } from '../../../settings/settings'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useChainId } from '../../../web3/hooks/useChainState'
import { resolveLinkOnEtherscan, resolveProviderName } from '../../../web3/pipes'
import { ProviderType } from '../../../web3/types'
import { formatEthereumAddress } from '../formatter'
import { useWallet } from '../hooks/useWallet'
import { WalletMessageCenter } from '../messages'

const useStyles = makeStyles((theme) =>
    createStyles({
        content: {
            padding: theme.spacing(2, 4),
        },
        section: {
            display: 'flex',
            alignItems: 'center',
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
            color: theme.palette.common.white,
            fontSize: 24,
            padding: theme.spacing(1, 0),
        },
        button: {
            color: theme.palette.text.secondary,
            fontSize: 14,
            marginRight: theme.spacing(1),
        },
    }),
)

export interface WalletStatusDialogProps {}

export function WalletStatusDialog(props: WalletStatusDialogProps) {
    const { t } = useI18N()
    const classes = useStyles()

    const chainId = useChainId()
    const selectedWallet = useWallet()
    const currentWalletConnectConnected = useValueRef(currentWalletConnectConnectedSettings)

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
    const [open, setWalletStatusDialogOpen] = useRemoteControlledDialog(
        WalletMessageCenter,
        'walletStatusDialogUpdated',
    )
    const onClose = useCallback(() => {
        setWalletStatusDialogOpen({
            open: false,
        })
    }, [setWalletStatusDialogOpen])
    //#endregion

    //#region change provider
    const [, setSelectProviderDialogOpen] = useRemoteControlledDialog(
        WalletMessageCenter,
        'selectProviderDialogUpdated',
    )
    //#endregion

    //#region walletconnect
    const [, setWalletConnectDialogOpen] = useRemoteControlledDialog(
        WalletMessageCenter,
        'walletConnectQRCodeDialogUpdated',
    )
    //#endregion

    const onConnect = useCallback(async () => {
        if (selectedWallet?.provider !== ProviderType.WalletConnect) return
        const uri = await Services.Ethereum.createConnectionURI()
        setWalletStatusDialogOpen({
            open: false,
        })
        if (currentWalletConnectConnected)
            setSelectProviderDialogOpen({
                open: true,
            })
        else
            setWalletConnectDialogOpen({
                open: true,
                uri,
            })
    }, [currentWalletConnectConnected, selectedWallet])
    const onChange = useCallback(() => {
        setWalletStatusDialogOpen({
            open: false,
        })
        setSelectProviderDialogOpen({
            open: true,
        })
    }, [setWalletStatusDialogOpen, setSelectProviderDialogOpen])

    if (!selectedWallet) return null

    return (
        <InjectedDialog title="Account" open={open} onExit={onClose} DialogProps={{ maxWidth: 'xs' }}>
            <DialogContent className={classes.content}>
                <section className={classes.section}>
                    <Typography className={classes.tip} color="textSecondary">
                        Connected with {resolveProviderName(selectedWallet.provider)}
                    </Typography>
                    <section className={classes.actions}>
                        {selectedWallet.provider === ProviderType.WalletConnect ? (
                            <Button
                                className={classes.actionButton}
                                color="primary"
                                size="small"
                                variant="outlined"
                                onClick={onConnect}>
                                {currentWalletConnectConnected ? 'Disconnect' : 'Connect'}
                            </Button>
                        ) : null}
                        <Button
                            className={classes.actionButton}
                            color="primary"
                            size="small"
                            variant="outlined"
                            onClick={onChange}>
                            Change
                        </Button>
                    </section>
                </section>
                <section className={classes.section}>
                    <ProviderIcon classes={{ icon: classes.icon }} size={14} providerType={selectedWallet.provider} />
                    <Typography className={classes.address}>
                        {formatEthereumAddress(selectedWallet.address, 4)}
                    </Typography>
                </section>
                <section>
                    <Button className={classes.button} variant="text" startIcon={<Copy size={14} />} onClick={onCopy}>
                        Copy Address
                    </Button>
                    <Button
                        className={classes.button}
                        variant="text"
                        startIcon={<ExternalLink size={14} />}
                        href={`${resolveLinkOnEtherscan(chainId)}/address/${selectedWallet.address}`}
                        target="_blank"
                        rel="noopener noreferrer">
                        View on Etherscan
                    </Button>
                </section>
            </DialogContent>
        </InjectedDialog>
    )
}
