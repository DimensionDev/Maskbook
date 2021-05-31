import { useCallback, useState } from 'react'
import { useAsyncRetry } from 'react-use'
import { makeStyles, DialogContent } from '@material-ui/core'
import { useStylesExtends } from '../../../../components/custom-ui-helper'
import { InjectedDialog } from '../../../../components/shared/InjectedDialog'
import { delay, useI18N, useRemoteControlledDialog, useValueRef } from '../../../../utils'
import {
    NetworkType,
    ProviderType,
    getChainIdFromNetworkType,
    resolveProviderName,
    useAccount,
    useChainId,
    ChainId,
} from '@dimensiondev/web3-shared'
import { WalletMessages } from '../../messages'
import { ConnectionProgress } from './ConnectionProgress'
import Services from '../../../../extension/service'
import CHAINS from '../../../../web3/assets/chains.json'
import { safeUnreachable } from '@dimensiondev/maskbook-shared'

const useStyles = makeStyles((theme) => ({
    content: {
        padding: theme.spacing(5),
    },
}))

export interface ConnectWalletDialogProps {}

export function ConnectWalletDialog(props: ConnectWalletDialogProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    const account = useAccount()
    const chainId = useChainId()
    const [providerType, setProviderType] = useState<ProviderType | undefined>()
    const [networkType, setNetworkType] = useState<NetworkType | undefined>()

    //#region remote controlled dialog
    const { open, closeDialog } = useRemoteControlledDialog(WalletMessages.events.connectWalletDialogUpdated, (ev) => {
        if (!ev.open) return
        setProviderType(ev.providerType)
        setNetworkType(ev.networkType)
    })
    //#endregion

    //#region wallet status dialog
    const { openDialog: openWalletStatusDialog } = useRemoteControlledDialog(
        WalletMessages.events.walletStatusDialogUpdated,
    )
    //#endregion

    //#region walletconnect
    const { setDialog: setWalletConnectDialog } = useRemoteControlledDialog(
        WalletMessages.events.walletConnectQRCodeDialogUpdated,
    )
    //#endregion

    const connectToMetamask = useCallback(async () => {
        try {
            // unknown network type
            if (!networkType) throw new Error('Unknown network type.')

            // read the chain detailed from the built-in chain list
            const chainDetailed = CHAINS.find((x) => x.chainId === getChainIdFromNetworkType(networkType))
            if (!chainDetailed) throw new Error('The selected network is not supported.')

            // request to connect with metamask
            const { account, chainId } = await Services.Ethereum.connectMetaMask()
            if (!account || !networkType) throw new Error('Failed to connect MetaMask.')

            // it's unable to send a request for switching to ethereum networks
            if (networkType === NetworkType.Ethereum) {
                if (chainId !== ChainId.Mainnet)
                    throw new Error("Make sure you've selected the Ethereum Mainnet on MetaMask.")
                return true
            }

            // request ethereum-compatiable network
            await Services.Ethereum.addEthereumChain(account, {
                chainId: `0x${chainDetailed.chainId.toString(16)}`,
                chainName: chainDetailed.name,
                nativeCurrency: chainDetailed.nativeCurrency,
                rpcUrls: chainDetailed.rpc,
                blockExplorerUrls: [
                    chainDetailed.explorers && chainDetailed.explorers.length > 0 && chainDetailed.explorers[0].url
                        ? chainDetailed.explorers[0].url
                        : chainDetailed.infoURL,
                ],
            })

            // wait for settings to be synced
            await delay(1000)

            return true as const
        } catch (e) {
            throw new Error(e.message)
        }
    }, [account, chainId, networkType])

    const connectToWalletConnect = useCallback(async () => {
        // a short time loading brings a better user experience
        const [uri_] = await Promise.allSettled([Services.Ethereum.createConnectionURI(), delay(1000)])

        // create wallet connect QR code URI
        const uri = uri_.status === 'fulfilled' ? uri_.value : ''
        if (!uri) throw new Error('Failed to create connection URI.')

        setWalletConnectDialog({
            open: true,
            uri,
        })
        return true as const
    }, [])

    const connection = useAsyncRetry<true>(async () => {
        if (!open) return true
        if (!providerType) throw new Error('Unknown provider type.')
        switch (providerType) {
            case ProviderType.Maskbook:
                throw new Error('Unable to create connection on Mask wallet.')
            case ProviderType.MetaMask:
                await connectToMetamask()
                break
            case ProviderType.WalletConnect:
                await connectToWalletConnect()
                break
            case ProviderType.CustomNetwork:
                throw new Error('To be implemented.')
            default:
                safeUnreachable(providerType)
                throw new Error('Unknown provider type.')
        }

        // switch to the wallet status dialog
        closeDialog()
        openWalletStatusDialog()

        return true
    }, [open, providerType, connectToMetamask, openWalletStatusDialog])

    if (!providerType) return null

    return (
        <InjectedDialog title={`Connect to ${resolveProviderName(providerType)}`} open={open} onClose={closeDialog}>
            <DialogContent className={classes.content}>
                <ConnectionProgress providerType={providerType} connection={connection} />
            </DialogContent>
        </InjectedDialog>
    )
}
