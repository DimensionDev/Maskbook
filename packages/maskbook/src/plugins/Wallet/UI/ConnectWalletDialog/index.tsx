import { useCallback, useState } from 'react'
import { useAsyncRetry } from 'react-use'
import { makeStyles, DialogContent } from '@material-ui/core'
import { useStylesExtends } from '../../../../components/custom-ui-helper'
import { InjectedDialog } from '../../../../components/shared/InjectedDialog'
import { delay, useI18N, useRemoteControlledDialog, useValueRef } from '../../../../utils'
import { NetworkType, ProviderType } from '../../../../web3/types'
import { WalletMessages } from '../../messages'
import { ConnectionProgress } from './ConnectionProgress'
import Services from '../../../../extension/service'
import { useChainId } from '../../../../web3/hooks/useChainId'
import {
    currentMaskbookChainIdSettings,
    currentMetaMaskChainIdSettings,
    currentSelectedWalletNetworkSettings,
    currentSelectedWalletProviderSettings,
} from '../../settings'
import { useAccount } from '../../../../web3/hooks/useAccount'
import { resolveNetworkChainId, resolveProviderName } from '../../../../web3/pipes'
import CHAINS from '../../../../web3/assets/chains.json'

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

    const selectedNetworkType = useValueRef(currentSelectedWalletNetworkSettings)
    const selectedProviderType = useValueRef(currentSelectedWalletProviderSettings)

    //#region remote controlled dialog
    const { open, closeDialog } = useRemoteControlledDialog(WalletMessages.events.connectWalletDialogUpdated, (ev) => {
        if (!ev.open) return
        setProviderType(ev.providerType)
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
            const account = await Services.Ethereum.connectMetaMask()
            if (!account) throw new Error('Failed to connect MetaMask.')

            // read the chain detailed from the built-in chain list
            const chainDetailed = CHAINS.find((x) => x.chainId === resolveNetworkChainId(selectedNetworkType))
            if (!chainDetailed) throw new Error('The selected network is not supported.')

            // it's unable to send a request for switching to ethereum networks
            if (selectedNetworkType === NetworkType.Ethereum) {
                if (chainDetailed.chain === 'ETH') return true
                else throw new Error('Make sure your wallet is on the Ethereum network.')
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
            return true as const
        } catch (e) {
            throw new Error(e.message)
        }
    }, [account, chainId, selectedNetworkType, selectedProviderType])

    const connectToWalletConnect = useCallback(async () => {
        const [uri_] = await Promise.allSettled([await Services.Ethereum.createConnectionURI(), delay(1000)])

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
        switch (providerType) {
            case ProviderType.MetaMask:
                await connectToMetamask()
                break
            case ProviderType.WalletConnect:
                await connectToWalletConnect()
                break
            default:
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
