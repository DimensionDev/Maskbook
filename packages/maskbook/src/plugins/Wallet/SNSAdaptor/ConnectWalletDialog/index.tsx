import { useCallback, useState } from 'react'
import { useAsyncRetry } from 'react-use'
import { DialogContent, makeStyles } from '@material-ui/core'
import { safeUnreachable } from '@dimensiondev/kit'
import {
    ChainId,
    getChainDetailedCAIP,
    getChainIdFromNetworkType,
    NetworkType,
    ProviderType,
    resolveNetworkName,
    resolveProviderName,
} from '@masknet/web3-shared'
import { useStylesExtends } from '../../../../components/custom-ui-helper'
import { InjectedDialog } from '../../../../components/shared/InjectedDialog'
import { delay } from '../../../../utils'
import { useRemoteControlledDialog } from '@masknet/shared'
import { WalletMessages } from '../../messages'
import { ConnectionProgress } from './ConnectionProgress'
import Services from '../../../../extension/service'

const useStyles = makeStyles((theme) => ({
    content: {
        padding: theme.spacing(5),
    },
}))

export interface ConnectWalletDialogProps {}

export function ConnectWalletDialog(props: ConnectWalletDialogProps) {
    const classes = useStylesExtends(useStyles(), props)

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

    const connectTo = useCallback(
        async (providerType: ProviderType) => {
            // unknown network type
            if (!networkType) throw new Error('Unknown network type.')

            // read the chain detailed from the built-in chain list
            const chainDetailedCAIP = getChainDetailedCAIP(getChainIdFromNetworkType(networkType))
            if (!chainDetailedCAIP) throw new Error('Unknown network type.')

            // a short time loading makes the user fells better
            await delay(1000)

            let account: string | undefined
            let chainId: ChainId | undefined

            switch (providerType) {
                case ProviderType.Maskbook:
                    throw new Error('Not necessary!')
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
                case ProviderType.CustomNetwork:
                    throw new Error('To be implemented.')
                default:
                    safeUnreachable(providerType)
                    break
            }

            // connection failed
            if (!account || !networkType) throw new Error(`Failed to connect ${resolveProviderName(providerType)}.`)

            if (networkType === NetworkType.Ethereum) {
                // it's unable to send a request for switching to ethereum networks
                if (chainId !== ChainId.Mainnet) throw new Error('Make sure your wallet is on the Ethereum Mainnet.')
                return true
            } else if (chainId === Number.parseInt(chainDetailedCAIP.chainId)) return true

            // request ethereum-compatiable network
            try {
                await Promise.race([
                    (async () => {
                        await delay(30 /* seconds */ * 1000 /* milliseconds */)
                        throw new Error('Timeout!')
                    })(),
                    Services.Ethereum.addEthereumChain(chainDetailedCAIP, account),
                ])
            } catch (e) {
                throw new Error(`Make sure your wallet is on the ${resolveNetworkName(networkType)} network.`)
            }

            // wait for settings to be synced
            await delay(1000)

            return true as const
        },
        [networkType],
    )

    const connection = useAsyncRetry<true>(async () => {
        if (!open) return true
        if (!providerType) throw new Error('Unknown provider type.')

        // connect to the specific provider
        await connectTo(providerType)

        // switch to the wallet status dialog
        closeDialog()
        openWalletStatusDialog()

        return true
    }, [open, providerType, connectTo, openWalletStatusDialog])

    if (!providerType) return null

    return (
        <InjectedDialog title={`Connect to ${resolveProviderName(providerType)}`} open={open} onClose={closeDialog}>
            <DialogContent className={classes.content}>
                <ConnectionProgress providerType={providerType} connection={connection} />
            </DialogContent>
        </InjectedDialog>
    )
}
