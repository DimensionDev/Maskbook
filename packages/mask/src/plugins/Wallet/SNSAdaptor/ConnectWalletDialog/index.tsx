import { useCallback, useEffect, useState } from 'react'
import { useAsyncRetry } from 'react-use'
import { DialogContent } from '@mui/material'
import { makeStyles, usePopupCustomSnackbar } from '@masknet/theme'
import { delay } from '@dimensiondev/kit'
import { ChainId, getChainDetailedCAIP, NetworkType, ProviderType } from '@masknet/web3-shared-evm'
import { Web3Plugin, useWeb3State, NetworkPluginID } from '@masknet/plugin-infra/web3'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { InjectedDialog } from '@masknet/shared'
import { CrossIsolationMessages, isPopupPage } from '@masknet/shared-base'
import { WalletMessages } from '../../messages'
import { useI18N } from '../../../../utils'
import { ConnectionProgress } from './ConnectionProgress'
import Services from '../../../../extension/service'
import { LoadingPlaceholder } from '../../../../extension/popups/components/LoadingPlaceholder'

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

export function ConnectWalletDialog() {
    const { classes } = useStyles()
    const { t } = useI18N()
    const [networkPluginId, setNetworkPluginId] = useState<NetworkPluginID | undefined>()
    const [providerType, setProviderType] = useState<Web3Plugin.ProviderDescriptor['type'] | undefined>()
    const [networkType, setNetworkType] = useState<Web3Plugin.NetworkDescriptor['type'] | undefined>()
    const { Utils, Shared } = useWeb3State(networkPluginId)
    // #region remote controlled dialog
    const {
        open,
        closeDialog,
        setDialog: setConnectWalletDialog,
    } = useRemoteControlledDialog(CrossIsolationMessages.events.connectWalletDialogUpdated, (ev) => {
        if (!ev.open) return
        setProviderType(ev.providerType)
        setNetworkType(ev.networkType)
        setNetworkPluginId(ev.networkPluginId as NetworkPluginID)
    })
    // #endregion

    // #region walletconnect
    const { setDialog: setWalletConnectDialog } = useRemoteControlledDialog(
        WalletMessages.events.walletConnectQRCodeDialogUpdated,
    )
    // #endregion

    const connectTo = useCallback(async () => {
        if (!networkType) throw new Error('Unknown network type.')
        if (!providerType) throw new Error('Unknown provider type.')
        if (!networkPluginId) throw new Error('Unknown network plugin id.')

        // read the chain detailed from the built-in chain list
        const expectedChainId = Utils?.resolveChainIdFromNetworkType?.(networkType) ?? ChainId.Mainnet
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
            case 'Phantom' as ProviderType:
                account = Shared?.account?.getCurrentValue()
                chainId = Shared?.chainId?.getCurrentValue()
                break
            case ProviderType.CustomNetwork:
                throw new Error('To be implemented.')
            default:
                throw new Error('To be implemented.')
        }

        // connection failed
        if (!account || !networkType)
            throw new Error(`Failed to connect to ${Utils?.resolveProviderName?.(providerType)}.`)

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
                throw new Error(`Make sure your wallet is on the ${Utils?.resolveNetworkName?.(networkType)} network.`)
            }
        }

        return {
            account,
            chainId: expectedChainId,
            networkType,
            providerType: providerType as string,
            networkPluginId: networkPluginId as string,
        }
    }, [networkType, providerType, networkPluginId])

    const connection = useAsyncRetry<true>(async () => {
        if (!open) return true

        setConnectWalletDialog({
            open: false,
            result: await connectTo(),
        })

        return true
    }, [open, connectTo, setConnectWalletDialog])

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

    if (!providerType || !networkPluginId || !networkType) return null

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
        <InjectedDialog title={t('plugin_wallet_dialog_title')} open={open} onClose={closeDialog}>
            <DialogContent className={classes.content}>
                <ConnectionProgress
                    networkPluginId={networkPluginId}
                    networkType={networkType}
                    providerType={providerType}
                    connection={connection}
                />
            </DialogContent>
        </InjectedDialog>
    )
}
