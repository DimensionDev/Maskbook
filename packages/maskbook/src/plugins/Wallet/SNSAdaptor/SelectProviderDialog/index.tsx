import { useCallback, useEffect, useState } from 'react'
import {
    Box,
    DialogContent,
    ImageList,
    ImageListItem,
    List,
    ListItem,
    makeStyles,
    Theme,
    Typography,
} from '@material-ui/core'
import { useValueRef } from '@masknet/shared'
import { unreachable } from '@dimensiondev/kit'
import { SuccessIcon } from '@masknet/icons'
import { Environment, isEnvironment } from '@dimensiondev/holoflows-kit'
import {
    getChainIdFromNetworkType,
    NetworkType,
    ProviderType,
    useAccount,
    useChainId,
    useWallets,
} from '@masknet/web3-shared'
import { useHistory } from 'react-router-dom'
import classnames from 'classnames'
import { useI18N } from '../../../../utils/i18n-next-ui'
import { useStylesExtends } from '../../../../components/custom-ui-helper'
import { Provider } from '../Provider'
import { MetaMaskIcon } from '../../../../resources/MetaMaskIcon'
import { MaskbookIcon } from '../../../../resources/MaskbookIcon'
import { WalletConnectIcon } from '../../../../resources/WalletConnectIcon'
import Services from '../../../../extension/service'
import { useRemoteControlledDialog } from '@masknet/shared'
import { WalletMessages } from '../../messages'
import { DashboardRoute } from '../../../../extension/options-page/Route'
import { InjectedDialog } from '../../../../components/shared/InjectedDialog'
import { NetworkIcon } from '../../../../components/shared/NetworkIcon'
import { currentNetworkSettings, currentProviderSettings } from '../../settings'
import { Flags } from '../../../../utils'

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
        marginTop: 21,
        '&:first-child': {
            marginTop: 0,
        },
    },
    stepTitle: {
        fontSize: 19,
        fontWeight: 'bold',
    },
    stepContent: {
        marginTop: 21,
    },
    networkDisabled: {
        opacity: 0.5,
    },
    networkList: {
        display: 'flex',
        gap: 32,
    },
    networkItem: {
        width: 'auto',
        padding: 0,
    },
    iconWrapper: {
        position: 'relative',
        cursor: 'pointer',
        height: 48,
        width: 48,
        borderRadius: 48,
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey['900'] : '#F7F9FA',
    },
    networkIcon: {
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey['900'] : '#F7F9FA',
    },
    checkedBadge: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        width: 14,
        height: 14,
        background: '#fff',
        borderRadius: '50%',
    },
    alert: {
        fontSize: 12,
        display: 'flex',
        alignItems: 'center',
        marginTop: theme.spacing(1),
    },
    grid: {
        width: '100%',
        margin: theme.spacing(2, 0, 0),
    },
    providerIcon: {
        fontSize: 45,
    },
    tip: {
        fontSize: 12,
    },
}))

const networks = [
    NetworkType.Ethereum,
    Flags.bsc_enabled ? NetworkType.Binance : undefined,
    Flags.polygon_enabled ? NetworkType.Polygon : undefined,
].filter(Boolean) as NetworkType[]

interface SelectProviderDialogUIProps extends withClasses<never> {}

function SelectProviderDialogUI(props: SelectProviderDialogUIProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    const account = useAccount()
    const chainId = useChainId()
    const history = useHistory()

    //#region remote controlled dialog logic
    const { open, closeDialog } = useRemoteControlledDialog(WalletMessages.events.selectProviderDialogUpdated)
    //#endregion

    //#region wallet status dialog
    const { openDialog: openWalletStatusDialog } = useRemoteControlledDialog(
        WalletMessages.events.walletStatusDialogUpdated,
    )
    //#endregion

    //#region select wallet dialog
    const { setDialog: setSelectWalletDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectWalletDialogUpdated,
    )
    //#endregion

    //#region connect wallet dialog
    const { setDialog: setConnectWalletDialog } = useRemoteControlledDialog(
        WalletMessages.events.connectWalletDialogUpdated,
    )
    //#endregion

    //#region wallet connect QR code dialog
    const { setDialog: setWalletConnectDialog } = useRemoteControlledDialog(
        WalletMessages.events.walletConnectQRCodeDialogUpdated,
    )
    //#endregion

    const wallets = useWallets(ProviderType.Maskbook)
    const selectedNetworkType = useValueRef(currentNetworkSettings)
    const selectedProviderType = useValueRef(currentProviderSettings)

    //#region undetermined network type
    const [undeterminedNetworkType, setUndeterminedNetworkType] = useState(selectedNetworkType)
    useEffect(() => {
        if (!open) return
        setUndeterminedNetworkType(selectedNetworkType)
    }, [open])
    //#endregion

    const onConnectProvider = useCallback(
        async (providerType: ProviderType) => {
            closeDialog()

            switch (providerType) {
                case ProviderType.Maskbook:
                    // choose a wallet
                    if (wallets.length > 0) {
                        setSelectWalletDialog({
                            open: true,
                            networkType: undeterminedNetworkType,
                        })
                        return
                    }
                    // create a new wallet
                    if (isEnvironment(Environment.ManifestOptions))
                        history.push(`${DashboardRoute.Wallets}?create=${Date.now()}`)
                    else await Services.Welcome.openOptionsPage(DashboardRoute.Wallets, `create=${Date.now()}`)
                    break
                case ProviderType.MetaMask:
                case ProviderType.WalletConnect:
                    if (
                        account &&
                        providerType === selectedProviderType &&
                        getChainIdFromNetworkType(undeterminedNetworkType) === chainId
                    ) {
                        openWalletStatusDialog()
                    } else {
                        setConnectWalletDialog({
                            open: true,
                            providerType,
                            networkType: undeterminedNetworkType,
                        })
                    }
                    break
                case ProviderType.CustomNetwork:
                    throw new Error('To be implemented.')
                default:
                    unreachable(providerType)
            }
        },
        [
            account,
            chainId,
            wallets,
            history,
            closeDialog,
            undeterminedNetworkType,
            selectedProviderType,
            openWalletStatusDialog,
            setSelectWalletDialog,
            setWalletConnectDialog,
        ],
    )

    return (
        <InjectedDialog title={t('plugin_wallet_select_provider_dialog_title')} open={open} onClose={closeDialog}>
            <DialogContent className={classes.content}>
                <Box className={classes.step}>
                    <Typography className={classes.stepTitle} variant="h2" component="h2">
                        1. Choose Network
                    </Typography>
                    <List className={classnames(classes.networkList, classes.stepContent)}>
                        {networks.map((network) => (
                            <ListItem
                                className={classes.networkItem}
                                key={network}
                                onClick={() => {
                                    setUndeterminedNetworkType(network)
                                }}>
                                <div className={classes.iconWrapper}>
                                    <NetworkIcon classes={{ icon: classes.networkIcon }} networkType={network} />
                                    {undeterminedNetworkType === network && (
                                        <SuccessIcon className={classes.checkedBadge} />
                                    )}
                                </div>
                            </ListItem>
                        ))}
                    </List>
                </Box>
                <Box className={classes.step}>
                    <Typography className={classes.stepTitle} variant="h2" component="h2">
                        {`${Flags.bsc_enabled ? '2. ' : ''}Choose Wallet`}
                    </Typography>
                    <ImageList
                        className={classnames(classes.stepContent, classes.grid)}
                        gap={16}
                        cols={3}
                        rowHeight={151}>
                        <ImageListItem>
                            <Provider
                                logo={<MaskbookIcon className={classes.providerIcon} viewBox="0 0 45 45" />}
                                name="Mask Network"
                                onClick={() => onConnectProvider(ProviderType.Maskbook)}
                            />
                        </ImageListItem>
                        {Flags.metamask_support_enabled ? (
                            <ImageListItem>
                                <Provider
                                    logo={<MetaMaskIcon className={classes.providerIcon} viewBox="0 0 45 45" />}
                                    name="MetaMask"
                                    onClick={() => onConnectProvider(ProviderType.MetaMask)}
                                />
                            </ImageListItem>
                        ) : null}
                        <ImageListItem>
                            <Provider
                                logo={<WalletConnectIcon className={classes.providerIcon} viewBox="0 0 45 45" />}
                                name="WalletConnect"
                                onClick={() => onConnectProvider(ProviderType.WalletConnect)}
                            />
                        </ImageListItem>
                    </ImageList>
                </Box>
            </DialogContent>
        </InjectedDialog>
    )
}

export interface SelectProviderDialogProps extends SelectProviderDialogUIProps {}

export function SelectProviderDialog(props: SelectProviderDialogProps) {
    return <SelectProviderDialogUI {...props} />
}
