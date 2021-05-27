import { useCallback } from 'react'
import {
    Box,
    makeStyles,
    Theme,
    DialogContent,
    ImageList,
    ImageListItem,
    List,
    ListItem,
    Typography,
    Link,
    DialogActions,
} from '@material-ui/core'
import { unreachable } from '@dimensiondev/maskbook-shared'
import { isEnvironment, Environment } from '@dimensiondev/holoflows-kit'
import { useWalletsOfProvider } from '@dimensiondev/web3-shared'
import { useHistory } from 'react-router-dom'
import { useI18N } from '../../../../utils/i18n-next-ui'
import { useStylesExtends } from '../../../../components/custom-ui-helper'
import { Provider } from '../Provider'
import { MetaMaskIcon } from '../../../../resources/MetaMaskIcon'
import { MaskbookIcon } from '../../../../resources/MaskbookIcon'
import { SuccessIcon } from '@dimensiondev/icons'
import { WalletConnectIcon } from '../../../../resources/WalletConnectIcon'
import Services from '../../../../extension/service'
import { useRemoteControlledDialog } from '../../../../utils/hooks/useRemoteControlledDialog'
import { WalletMessages } from '../../messages'
import { DashboardRoute } from '../../../../extension/options-page/Route'
import { ProviderType, WalletNetworkType } from '../../../../web3/types'
import { useValueRef } from '../../../../utils/hooks/useValueRef'
import { Flags } from '../../../../utils/flags'
import { InjectedDialog } from '../../../../components/shared/InjectedDialog'
import { NetworkIcon } from '../../../../components/shared/NetworkIcon'
import { currentSelectedWalletNetworkSettings } from '../../settings'

const useStyles = makeStyles((theme: Theme) => ({
    paper: {
        width: '750px !important',
        maxWidth: 'unset',
    },
    content: {
        padding: theme.spacing(4, 4.5, 2),
    },
    step: {
        flexGrow: 1,
    },
    stepTitle: {
        fontSize: 16,
    },
    networkList: {
        display: 'flex',
        gap: 32,
    },
    network: {
        position: 'relative',
        cursor: 'pointer',
        width: 'auto',
        padding: 0,
    },
    networkIcon: {
        height: 48,
        width: 48,
    },
    checkedBadge: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        width: 16,
        height: 16,
        background: '#fff',
        borderRadius: '50%',
        border: '2px solid #fff',
    },
    grid: {
        width: '100%',
        margin: theme.spacing(2, 0, 0),
    },
    icon: {
        fontSize: 45,
    },
    tip: {
        fontSize: 12,
    },
}))

const networks = [
    WalletNetworkType.Ethereum,
    Flags.bsc_enabled ? WalletNetworkType.Binance : undefined,
    Flags.polygon_enabled ? WalletNetworkType.Polygon : undefined,
].filter(Boolean) as WalletNetworkType[]

interface SelectProviderDialogUIProps extends withClasses<never> {}

function SelectProviderDialogUI(props: SelectProviderDialogUIProps) {
    const { t } = useI18N()
    const selectedNetwork = useValueRef(currentSelectedWalletNetworkSettings)
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

    const wallets = useWalletsOfProvider(ProviderType.Maskbook)
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
                <Box className={classes.step}>
                    <Typography className={classes.stepTitle} variant="h2" component="h2">
                        1. Choose Network
                    </Typography>
                    <List className={classes.networkList}>
                        {networks.map((network) => (
                            <ListItem
                                className={classes.network}
                                key={network}
                                onClick={() => {
                                    currentSelectedWalletNetworkSettings.value = network
                                    // TODO
                                }}>
                                <NetworkIcon networkType={network} />
                                {selectedNetwork === network && <SuccessIcon className={classes.checkedBadge} />}
                            </ListItem>
                        ))}
                    </List>
                </Box>
                <Box className={classes.step}>
                    <Typography className={classes.stepTitle} variant="h2" component="h2">
                        {`${Flags.bsc_enabled ? '2.' : ''} Choose Wallet`}
                    </Typography>
                    <ImageList className={classes.grid} gap={16} cols={3} rowHeight={183}>
                        <ImageListItem>
                            <Provider
                                logo={<MaskbookIcon className={classes.icon} viewBox="0 0 45 45" />}
                                name="Mask Network"
                                onClick={() => onConnect(ProviderType.Maskbook)}
                            />
                        </ImageListItem>
                        {Flags.metamask_support_enabled ? (
                            <ImageListItem>
                                <Provider
                                    logo={<MetaMaskIcon className={classes.icon} viewBox="0 0 45 45" />}
                                    name="MetaMask"
                                    onClick={() => onConnect(ProviderType.MetaMask)}
                                />
                            </ImageListItem>
                        ) : null}
                        <ImageListItem>
                            <Provider
                                logo={<WalletConnectIcon className={classes.icon} viewBox="0 0 45 45" />}
                                name="WalletConnect"
                                onClick={() => onConnect(ProviderType.WalletConnect)}
                            />
                        </ImageListItem>
                    </ImageList>
                </Box>
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
