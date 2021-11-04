import { useCallback, useEffect, useState } from 'react'
import { useAsync } from 'react-use'
import { getMaskColor, makeStyles } from '@masknet/theme'
import { Box, ImageList, ImageListItem, List, ListItem, Typography } from '@mui/material'
import { getChainIdFromNetworkType, ProviderType, useAccount, useChainId, useWallets } from '@masknet/web3-shared-evm'
import { useValueRef, useRemoteControlledDialog, useStylesExtends, NetworkIcon } from '@masknet/shared'
import { unreachable } from '@dimensiondev/kit'
import { SuccessIcon } from '@masknet/icons'
import { PopupRoutes } from '@masknet/shared-base'
import { WalletMessages } from '@masknet/plugin-wallet'
import { useHistory } from 'react-router-dom'
import classnames from 'classnames'
import { Flags, useI18N } from '../../../../utils'
import Services from '../../../../extension/service'
import { currentNetworkSettings, currentProviderSettings } from '../../../Wallet/settings'
import { WalletRPC } from '../../../Wallet/messages'
import { MaskIcon } from '../../../../resources/MaskIcon'
import { MetaMaskIcon } from '../../../../resources/MetaMaskIcon'
import { WalletConnectIcon } from '../../../../resources/WalletConnectIcon'
import { Provider } from './Provider'

const useStyles = makeStyles()((theme) => ({
    paper: {
        width: '750px !important',
        maxWidth: 'unset',
    },
    content: {
        padding: theme.spacing(0),
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
        backgroundColor: getMaskColor(theme).twitterBackground,
    },
    networkIcon: {
        backgroundColor: getMaskColor(theme).twitterBackground,
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

export interface PluginPanelProps {}

export function PluginPanel(props: PluginPanelProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    const chainId = useChainId()

    //#region remote controlled dialog logic
    const { open, closeDialog } = useRemoteControlledDialog(WalletMessages.events.selectProviderDialogUpdated)
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

    const wallets = useWallets(ProviderType.MaskWallet)
    const selectedNetworkType = useValueRef(currentNetworkSettings)

    //#region undetermined network type
    const [undeterminedNetworkType, setUndeterminedNetworkType] = useState(selectedNetworkType)
    useEffect(() => {
        if (!open) return
        setUndeterminedNetworkType(selectedNetworkType)
    }, [open])
    //#endregion

    const { value: networks } = useAsync(async () => WalletRPC.getSupportedNetworks(), [])

    const onConnectProvider = useCallback(
        async (providerType: ProviderType) => {
            closeDialog()

            switch (providerType) {
                case ProviderType.MaskWallet:
                    await Services.Helper.openPopupWindow(wallets.length > 0 ? PopupRoutes.SelectWallet : undefined, {
                        chainId: getChainIdFromNetworkType(undeterminedNetworkType),
                    })
                    break
                case ProviderType.MetaMask:
                case ProviderType.WalletConnect:
                    setConnectWalletDialog({
                        open: true,
                        providerType,
                        networkType: undeterminedNetworkType,
                    })
                    break
                case ProviderType.CustomNetwork:
                    throw new Error('To be implemented.')
                default:
                    unreachable(providerType)
            }
        },
        [
            chainId,
            wallets,
            closeDialog,
            undeterminedNetworkType,
            setWalletConnectDialog,
        ],
    )

    return (
        <>
            <Box className={classes.step}>
                <Typography className={classes.stepTitle} variant="h2" component="h2">
                    1. Choose Network
                </Typography>
                <List className={classnames(classes.networkList, classes.stepContent)}>
                    {networks?.map((network) => (
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
                    2. Choose Wallet
                </Typography>
                <ImageList className={classnames(classes.stepContent, classes.grid)} gap={16} cols={3} rowHeight={151}>
                    <ImageListItem>
                        <Provider
                            logo={<MaskIcon size={45} />}
                            name="Mask Network"
                            onClick={() => onConnectProvider(ProviderType.MaskWallet)}
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
        </>
    )
}
