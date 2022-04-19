import urlcat from 'urlcat'
import { useCallback, useState } from 'react'
import { useAsyncRetry } from 'react-use'
import type { NavigateFunction } from 'react-router-dom'
import { first } from 'lodash-unified'
import { DialogContent } from '@mui/material'
import { makeStyles } from '@masknet/theme'
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
import { isPopupPage, PopupRoutes } from '@masknet/shared-base'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { InjectedDialog } from '@masknet/shared'
import { WalletMessages } from '../../messages'
import { ConnectionProgress } from './ConnectionProgress'
import Services from '../../../../extension/service'
import { useSelectAccount } from '../../hooks/useSelectAccount'

const useStyles = makeStyles()((theme) => ({
    content: {
        padding: theme.spacing(2.5),
    },
}))

export interface ConnectWalletDialogProps {
    onNavigate?: NavigateFunction
}

export function ConnectWalletDialog(props: ConnectWalletDialogProps) {
    const { onNavigate } = props
    const { classes } = useStyles()
    const [onSelectAccountPrepare] = useSelectAccount()

    const [providerType, setProviderType] = useState<ProviderType | undefined>()
    const [networkType, setNetworkType] = useState<NetworkType | undefined>()

    // #region remote controlled dialog
    const { open, setDialog: setConnectWalletDialog } = useRemoteControlledDialog(
        WalletMessages.events.connectWalletDialogUpdated,
        (ev) => {
            if (!ev.open) return
            setProviderType(ev.providerType)
            setNetworkType(ev.networkType)
        },
    )
    const onClose = useCallback(() => {
        setConnectWalletDialog({ open: false })
    }, [])
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
                if (isPopupPage()) {
                    ;({ account, chainId } = await new Promise<{
                        account: string
                        chainId: ChainId
                    }>(async (resolve) => {
                        onSelectAccountPrepare(async (accounts, chainId) => {
                            resolve({
                                chainId,
                                account: first(accounts) ?? '',
                            })
                        })
                        onNavigate?.(
                            urlcat(PopupRoutes.SelectWallet, {
                                popup: true,
                            }),
                        )
                    }))
                } else {
                    ;({ account, chainId } = await Services.Ethereum.connectMaskWallet(expectedChainId))
                }
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
                        (async () => {
                            await delay(30 /* seconds */ * 1000 /* milliseconds */)
                            throw new Error('Timeout!')
                        })(),
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
    }, [networkType, providerType, onNavigate, onSelectAccountPrepare])

    const connection = useAsyncRetry<true>(async () => {
        if (!open) return true

        setConnectWalletDialog({
            open: false,
            result: await connectTo(),
        })

        return true
    }, [open, connectTo, setConnectWalletDialog])

    if (!providerType) return null

    // The connection state is transferring between pages when we connect Mask Wallet on the popup page
    if (isPopupPage() && providerType === ProviderType.MaskWallet) return null

    return (
        <InjectedDialog title={`Connect to ${resolveProviderName(providerType)}`} open={open} onClose={onClose}>
            <DialogContent className={classes.content}>
                <ConnectionProgress providerType={providerType} connection={connection} />
            </DialogContent>
        </InjectedDialog>
    )
}
