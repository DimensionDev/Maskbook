import React, { useCallback, useEffect } from 'react'
import { MoreHorizontal } from 'react-feather'
import { makeStyles, Theme, createStyles, DialogContent, GridList, GridListTile, Typography } from '@material-ui/core'
import { isEnvironment, Environment } from '@dimensiondev/holoflows-kit'
import { useHistory } from 'react-router-dom'
import { useSnackbar } from 'notistack'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { Provider } from './Provider'
import { MetaMaskIcon } from '../../../resources/MetaMaskIcon'
import { MaskbookIcon } from '../../../resources/MaskbookIcon'
import { WalletConnectIcon } from '../../../resources/WalletConnectIcon'
import Services from '../../../extension/service'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import { WalletMessages } from '../messages'
import { useBlurContext } from '../../../extension/options-page/DashboardContexts/BlurContext'
import { DashboardRoute } from '../../../extension/options-page/Route'
import { ProviderType } from '../../../web3/types'
import { unreachable } from '../../../utils/utils'
import { MaskMessage } from '../../../utils/messages'
import { Flags } from '../../../utils/flags'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { useIsChainIdValid } from '../../../web3/hooks/useChainState'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        paper: {
            width: '750px !important',
            maxWidth: 'unset',
        },
        content: {
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-around',
            overflow: 'hidden',
            padding: theme.spacing(4, 2),
        },
        grid: {
            width: '100%',
        },
        icon: {
            fontSize: 45,
        },
    }),
)

interface SelectProviderDialogUIProps extends withClasses<never> {}

function SelectProviderDialogUI(props: SelectProviderDialogUIProps) {
    const { t } = useI18N()
    const { enqueueSnackbar, closeSnackbar } = useSnackbar()
    const classes = useStylesExtends(useStyles(), props)
    const history = useHistory()

    //#region remote controlled dialog logic
    const [open, setOpen] = useRemoteControlledDialog(WalletMessages.events.selectProviderDialogUpdated)
    const onClose = useCallback(() => {
        setOpen({
            open: false,
        })
    }, [setOpen])
    //#endregion

    //#region wallet connect QR code dialog
    const [_, setWalletConnectDialogOpen] = useRemoteControlledDialog(
        WalletMessages.events.walletConnectQRCodeDialogUpdated,
    )
    //#endregion

    // render in dashboard
    useBlurContext(open)

    const onConnect = useCallback(
        async (providerType: ProviderType) => {
            onClose()
            switch (providerType) {
                case ProviderType.Maskbook:
                    if (isEnvironment(Environment.ManifestOptions))
                        history.push(`${DashboardRoute.Wallets}?create=${Date.now()}`)
                    else await Services.Welcome.openOptionsPage(DashboardRoute.Wallets, `create=${Date.now()}`)
                    break
                case ProviderType.MetaMask:
                    await Services.Ethereum.connectMetaMask()
                    break
                case ProviderType.WalletConnect:
                    setWalletConnectDialogOpen({
                        open: true,
                        uri: await Services.Ethereum.createConnectionURI(),
                    })
                    break
                default:
                    unreachable(providerType)
            }
        },
        [history, onClose, setWalletConnectDialogOpen],
    )

    // TODO:
    // Show error message when click metamask would be better
    useEffect(
        () =>
            MaskMessage.events.metamaskDisconnected.on(async () => {
                enqueueSnackbar(t('metamask_not_install'), {
                    key: 'metamask_not_install',
                    variant: 'error',
                    preventDuplicate: true,
                })
            }),
        [enqueueSnackbar, t],
    )

    //#region chain id is not valid
    const chainIdValid = useIsChainIdValid()
    if (!chainIdValid)
        return (
            <InjectedDialog title={t('plugin_wallet_wrong_network')} open={open} onExit={onClose}>
                <DialogContent className={classes.content}>
                    <Typography>Please connect to the appropriate Ethereum network.</Typography>
                </DialogContent>
            </InjectedDialog>
        )
    //#endregion

    return (
        <InjectedDialog title={t('plugin_wallet_select_provider_dialog_title')} open={open} onExit={onClose}>
            <DialogContent className={classes.content}>
                <GridList className={classes.grid} spacing={16} cellHeight={183}>
                    <GridListTile>
                        <Provider
                            logo={<MaskbookIcon className={classes.icon} viewBox="0 0 45 45" />}
                            name="Maskbook"
                            description="Create wallet with Maskbook"
                            onClick={() => onConnect(ProviderType.Maskbook)}
                        />
                    </GridListTile>
                    {Flags.metamask_support_enabled ? (
                        <GridListTile>
                            <Provider
                                logo={<MetaMaskIcon className={classes.icon} viewBox="0 0 45 45" />}
                                name="MetaMask"
                                description="Connect to your MetaMask Wallet"
                                onClick={() => onConnect(ProviderType.MetaMask)}
                            />
                        </GridListTile>
                    ) : null}
                    {Flags.wallet_connect_support_enabled ? (
                        <GridListTile>
                            <Provider
                                logo={<WalletConnectIcon className={classes.icon} viewBox="0 0 45 45" />}
                                name="WalletConnect"
                                description="Scan with WalletConnect to connect"
                                onClick={() => onConnect(ProviderType.WalletConnect)}
                            />
                        </GridListTile>
                    ) : null}
                    <GridListTile>
                        <Provider
                            logo={
                                <MoreHorizontal
                                    className={classes.icon}
                                    viewBox="0 0 22.5 22.5"
                                    width={45}
                                    height={45}
                                />
                            }
                            name="More"
                            description="Comming soon…"
                            ButtonBaseProps={{ disabled: true }}
                        />
                    </GridListTile>
                </GridList>
            </DialogContent>
        </InjectedDialog>
    )
}

export interface SelectProviderDialogProps extends SelectProviderDialogUIProps {}

export function SelectProviderDialog(props: SelectProviderDialogProps) {
    return <SelectProviderDialogUI {...props} />
}
