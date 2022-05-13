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
    // #endregion

    // #region walletconnect
    const { setDialog: setWalletConnectDialog } = useRemoteControlledDialog(
        WalletMessages.events.walletConnectQRCodeDialogUpdated,
    )
    // #endregion

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

    if (!providerType) return null

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
        <InjectedDialog title={`Connect to ${resolveProviderName(providerType)}`} open={open} onClose={closeDialog}>
            <DialogContent className={classes.content}>
                <ConnectionProgress providerType={providerType} connection={connection} />
            </DialogContent>
        </InjectedDialog>
    )
}
