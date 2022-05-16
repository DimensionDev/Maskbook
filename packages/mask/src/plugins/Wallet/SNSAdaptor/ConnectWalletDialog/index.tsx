<<<<<<< HEAD
import { useState } from 'react'
import { useAsyncRetry } from 'react-use'
import { DialogContent } from '@mui/material'
import { InjectedDialog } from '@masknet/shared'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { useWeb3State, Web3Helper } from '@masknet/plugin-infra/web3'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { WalletMessages } from '../../messages'
import { ConnectionProgress } from './ConnectionProgress'
import { currentNetworkSettings } from '../../settings'
import { pluginIDSettings } from '../../../../settings/settings'
=======
import { useCallback, useEffect, useState } from 'react'
import { useAsyncRetry } from 'react-use'
import { DialogContent } from '@mui/material'
import { makeStyles, usePopupCustomSnackbar } from '@masknet/theme'
import { safeUnreachable, delay } from '@dimensiondev/kit'
import {
    ChainId,
    getChainDetailedCAIP,
    getChainIdFromNetworkType,
    NetworkType,
    ProviderType,
    resolveNetworkName,
    resolveProviderName,
} from '@masknet/web3-shared-evm'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { InjectedDialog } from '@masknet/shared'
import { WalletMessages } from '../../messages'
import { ConnectionProgress } from './ConnectionProgress'
import Services from '../../../../extension/service'
import { isPopupPage } from '@masknet/shared-base'
import { LoadingPlaceholder } from '../../../../extension/popups/components/LoadingPlaceholder'
import { useI18N } from '../../../../utils'
>>>>>>> develop

const useStyles = makeStyles()((theme) => ({
    content: {
        padding: theme.spacing(2.5),
    },
    popupDialog: {
        width: 200,
        margin: 'auto',
    },
    popupDialogPaper: {
        backgroundColor: 'transparent',
    },
    popupDialogContent: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
}))

export interface ConnectWalletDialogProps {}

export function ConnectWalletDialog(props: ConnectWalletDialogProps) {
<<<<<<< HEAD
    const classes = useStylesExtends(useStyles(), props)

    const [pluginID, setPluginID] = useState<NetworkPluginID>()
    const [providerType, setProviderType] = useState<Web3Helper.Definition[NetworkPluginID]['ProviderType']>()
    const [networkType, setNetworkType] = useState<Web3Helper.Definition[NetworkPluginID]['NetworkType']>()

    // #region remote controlled dialog
    const { open, setDialog: setConnectWalletDialog } = useRemoteControlledDialog(
        WalletMessages.events.connectWalletDialogUpdated,
        (ev) => {
            if (!ev.open) return
            setPluginID(ev.network.networkSupporterPluginID)
            setNetworkType(ev.network.type)
            setProviderType(ev.provider.type)
        },
    )
=======
    const { t } = useI18N()
    const { classes } = useStyles()
    const [providerType, setProviderType] = useState<ProviderType | undefined>()
    const [networkType, setNetworkType] = useState<NetworkType | undefined>()

    // #region remote controlled dialog
    const {
        open,
        closeDialog,
        setDialog: setConnectWalletDialog,
    } = useRemoteControlledDialog(WalletMessages.events.connectWalletDialogUpdated, (ev) => {
        if (!ev.open) return
        setProviderType(ev.providerType)
        setNetworkType(ev.networkType)
    })
>>>>>>> develop
    // #endregion

    const { Protocol, Others } = useWeb3State(pluginID) as Web3Helper.Web3StateAll

<<<<<<< HEAD
    const connection = useAsyncRetry<true>(async () => {
        if (!open) return true

        if (!networkType || !providerType || !Others || !Protocol) throw new Error('Failed to connect to provider.')

        const chainId = Others?.networkResovler.networkChainId(networkType)
        if (!chainId) throw new Error('Failed to connect to provider.')

        const connection = await Protocol.getConnection?.({
            chainId,
            providerType,
        })
        if (!connection) throw new Error('Failed to build connection.')
=======
    const connectTo = useCallback(async () => {
        if (!networkType) throw new Error('Unknown network type.')
        if (!providerType) throw new Error('Unknown provider type.')

        // read the chain detailed from the built-in chain list
        const expectedChainId = getChainIdFromNetworkType(networkType)
        const chainDetailedCAIP = getChainDetailedCAIP(expectedChainId)
        if (!chainDetailedCAIP) throw new Error('Unknown network type.')

        // a short time loading makes the user fells better
        await delay(1000)
        let account: string | undefined
        let chainId: ChainId | undefined

        switch (providerType) {
            case ProviderType.MaskWallet:
                ;({ account, chainId } = await Services.Ethereum.connectMaskWallet(expectedChainId))
                break
            case ProviderType.MetaMask:
                ;({ account, chainId } = await Services.Ethereum.connectMetaMask())
                break
            case ProviderType.WalletConnect:
                // create wallet connect QR code URI
                const uri = await Services.Ethereum.createConnectionURI()
                if (!uri) throw new Error('Failed to create connection URI.')

                // open the QR code dialog
                setWalletConnectDialog({
                    open: true,
                    uri,
                })

                // wait for walletconnect to be connected
                ;({ account, chainId } = await Services.Ethereum.connectWalletConnect())
                break
            case ProviderType.Coin98:
            case ProviderType.WalletLink:
            case ProviderType.MathWallet:
                ;({ account, chainId } = await Services.Ethereum.connectInjected())
                break
            case ProviderType.Fortmatic:
                ;({ account, chainId } = await Services.Ethereum.connectFortmatic(expectedChainId))
                break
            case ProviderType.CustomNetwork:
                throw new Error('To be implemented.')
            default:
                safeUnreachable(providerType)
                break
        }

        // connection failed
        if (!account || !networkType) throw new Error(`Failed to connect to ${resolveProviderName(providerType)}.`)

        // switch to the expected chain
        if (chainId !== expectedChainId) {
            try {
                const overrides = {
                    chainId: expectedChainId,
                    providerType,
                }

                // the coin98 wallet cannot handle add/switch RPC provider correctly
                // it will always add a new RPC provider even if the network exists
                if (providerType !== ProviderType.Coin98) {
                    await Promise.race([
                        delay(30 /* seconds */ * 1000 /* milliseconds */).then(() => {
                            throw new Error('Timeout!')
                        }),
                        networkType === NetworkType.Ethereum
                            ? Services.Ethereum.switchEthereumChain(ChainId.Mainnet, overrides)
                            : Services.Ethereum.addEthereumChain(chainDetailedCAIP, account, overrides),
                    ])
                }

                // recheck
                const chainIdHex = await Services.Ethereum.getChainId(overrides)
                if (Number.parseInt(chainIdHex, 16) !== expectedChainId) throw new Error('Failed to switch chain.')
            } catch {
                throw new Error(`Make sure your wallet is on the ${resolveNetworkName(networkType)} network.`)
            }
        }

        return {
            account,
            chainId: expectedChainId,
            networkType,
            providerType,
        }
    }, [networkType, providerType])
>>>>>>> develop

        await connection.connect()

        if (pluginID) {
            pluginIDSettings.value = pluginID
        }

        setConnectWalletDialog({
            open: false,
<<<<<<< HEAD
=======
            result: await connectTo(),
>>>>>>> develop
        })

        return true
    }, [open])

<<<<<<< HEAD
    if (!pluginID || !providerType) return null
=======
    const { showSnackbar } = usePopupCustomSnackbar()
    useEffect(() => {
        if (!isPopupPage() || !connection.error) return
        setConnectWalletDialog({
            open: false,
        })
        showSnackbar(connection.error.message, {
            variant: 'error',
        })
    }, [connection.error, showSnackbar])

    if (!providerType) return null
>>>>>>> develop

    if (isPopupPage()) {
        return (
            <InjectedDialog
                className={classes.popupDialog}
                open={open}
                hideBackdrop
                disableBackdropClick
                PaperProps={{
                    className: classes.popupDialogPaper,
                    elevation: 0,
                }}
                BackdropProps={{}}>
                <DialogContent className={classes.popupDialogContent}>
                    <LoadingPlaceholder title={t('connecting')} titleColor="#ffffff" iconColor="#ffffff" />
                </DialogContent>
            </InjectedDialog>
        )
    }

    return (
<<<<<<< HEAD
        <InjectedDialog
            title={`Connect to ${Others?.providerResolver.providerName(providerType)}`}
            open={open}
            onClose={() => setConnectWalletDialog({ open: false })}>
=======
        <InjectedDialog title={`Connect to ${resolveProviderName(providerType)}`} open={open} onClose={closeDialog}>
>>>>>>> develop
            <DialogContent className={classes.content}>
                <ConnectionProgress pluginID={pluginID} providerType={providerType} connection={connection} />
            </DialogContent>
        </InjectedDialog>
    )
}
