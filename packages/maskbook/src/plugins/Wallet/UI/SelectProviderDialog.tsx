import { useCallback } from 'react'
import { MoreHorizontal } from 'react-feather'
import {
    makeStyles,
    Theme,
    DialogContent,
    ImageList,
    ImageListItem,
    Typography,
    Link,
    DialogActions,
} from '@material-ui/core'
import { isEnvironment, Environment } from '@dimensiondev/holoflows-kit'
import { useHistory } from 'react-router-dom'
import { useRemoteControlledDialog, useI18N, unreachable, Flags } from '../../../utils'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { Provider } from './Provider'
import { MetaMaskIcon } from '../../../resources/MetaMaskIcon'
import { MaskbookIcon } from '../../../resources/MaskbookIcon'
import { WalletConnectIcon } from '../../../resources/WalletConnectIcon'
import Services from '../../../extension/service'
import { WalletMessages } from '../messages'
import { DashboardRoute } from '../../../extension/options-page/Route'
import { ProviderType } from '../../../web3/types'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { useWallets } from '../hooks/useWallet'

const useStyles = makeStyles((theme: Theme) => ({
    paper: {
        width: '750px !important',
        maxWidth: 'unset',
    },
    content: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        overflow: 'hidden',
        padding: theme.spacing(4, 4.5, 2),
    },
    grid: {
        width: '100%',
        margin: 0,
    },
    icon: {
        fontSize: 45,
    },
    tip: {
        fontSize: 12,
    },
}))

interface SelectProviderDialogUIProps extends withClasses<never> {}

function SelectProviderDialogUI(props: SelectProviderDialogUIProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)
    const history = useHistory()

    //#region remote controlled dialog logic
    const { open, closeDialog } = useRemoteControlledDialog(WalletMessages.events.selectProviderDialogUpdated)
    //#endregion

    //#region select wallet dialog
    const { openDialog: openSelectWalletDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectWalletDialogUpdated,
    )
    //#endregion

    //#region wallet connect QR code dialog
    const { setDialog: setWalletConnectDialog } = useRemoteControlledDialog(
        WalletMessages.events.walletConnectQRCodeDialogUpdated,
    )
    //#endregion

    const wallets = useWallets(ProviderType.Maskbook)
    const onConnect = useCallback(
        async (providerType: ProviderType) => {
            closeDialog()
            switch (providerType) {
                case ProviderType.Maskbook:
                    if (wallets.length > 0) {
                        openSelectWalletDialog()
                        return
                    }
                    if (isEnvironment(Environment.ManifestOptions))
                        history.push(`${DashboardRoute.Wallets}?create=${Date.now()}`)
                    else await Services.Welcome.openOptionsPage(DashboardRoute.Wallets, `create=${Date.now()}`)
                    break
                case ProviderType.MetaMask:
                    await Services.Ethereum.connectMetaMask()
                    break
                case ProviderType.WalletConnect:
                    setWalletConnectDialog({
                        open: true,
                        uri: await Services.Ethereum.createConnectionURI(),
                    })
                    break
                case ProviderType.CustomNetwork:
                    break
                default:
                    unreachable(providerType)
            }
        },
        [wallets, history, closeDialog, openSelectWalletDialog, setWalletConnectDialog],
    )

    return (
        <InjectedDialog title={t('plugin_wallet_select_provider_dialog_title')} open={open} onClose={closeDialog}>
            <DialogContent className={classes.content}>
                <ImageList className={classes.grid} gap={16} rowHeight={183}>
                    <ImageListItem>
                        <Provider
                            logo={<MaskbookIcon className={classes.icon} viewBox="0 0 45 45" />}
                            name="Mask"
                            description={t('plugin_wallet_connect_to_mask')}
                            onClick={() => onConnect(ProviderType.Maskbook)}
                        />
                    </ImageListItem>
                    {Flags.metamask_support_enabled ? (
                        <ImageListItem>
                            <Provider
                                logo={<MetaMaskIcon className={classes.icon} viewBox="0 0 45 45" />}
                                name="MetaMask"
                                description={t('plugin_wallet_connect_to_metamask')}
                                onClick={() => onConnect(ProviderType.MetaMask)}
                            />
                        </ImageListItem>
                    ) : null}
                    <ImageListItem>
                        <Provider
                            logo={<WalletConnectIcon className={classes.icon} viewBox="0 0 45 45" />}
                            name="WalletConnect"
                            description={t(
                                process.env.architecture === 'web'
                                    ? 'plugin_wallet_connect_to_walletconnect_on_web'
                                    : 'plugin_wallet_connect_to_walletconnect_on_app',
                            )}
                            onClick={() => onConnect(ProviderType.WalletConnect)}
                        />
                    </ImageListItem>
                    <ImageListItem>
                        <Provider
                            logo={
                                <MoreHorizontal
                                    className={classes.icon}
                                    viewBox="0 0 22.5 22.5"
                                    width={45}
                                    height={45}
                                />
                            }
                            name={t('plugin_wallet_connect_more')}
                            description={t('plugin_wallet_connect_more_description')}
                            ButtonBaseProps={{ disabled: true }}
                        />
                    </ImageListItem>
                </ImageList>
            </DialogContent>
            <DialogActions>
                <Typography className={classes.tip} color="textSecondary">
                    {t('plugin_wallet_connect_new_ethereum')}
                    <Link
                        color="primary"
                        target="_blank"
                        rel="noopener noreferrer"
                        href="https://ethereum.org/en/wallets/">
                        {t('plugin_wallet_connect_learn_more_wallets')}
                    </Link>
                </Typography>
            </DialogActions>
        </InjectedDialog>
    )
}

export interface SelectProviderDialogProps extends SelectProviderDialogUIProps {}

export function SelectProviderDialog(props: SelectProviderDialogProps) {
    return <SelectProviderDialogUI {...props} />
}
