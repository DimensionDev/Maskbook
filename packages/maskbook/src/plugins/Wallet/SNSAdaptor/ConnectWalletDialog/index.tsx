import { useCallback, useState } from 'react'
import { useAsyncRetry } from 'react-use'
import { DialogContent } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
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
import { InjectedDialog } from '../../../../components/shared/InjectedDialog'
import { delay } from '../../../../utils'
import { useRemoteControlledDialog, useStylesExtends } from '@masknet/shared'
import { WalletMessages, WalletRPC } from '../../messages'
import { ConnectionProgress } from './ConnectionProgress'
import Services from '../../../../extension/service'

const useStyles = makeStyles()((theme) => ({
    content: {
        padding: theme.spacing(5),
    },
}))

export interface ConnectWalletDialogProps {}

export function ConnectWalletDialog(props: ConnectWalletDialogProps) {
    const classes = useStylesExtends(useStyles(), props)

    const [expectedChainId, setExpectedChainId] = useState<number>()
    const [expectedNetworkType, setExpectedNetworkType] = useState<NetworkType | undefined>()
    const [expectedProviderType, setExpectedProviderType] = useState<ProviderType | undefined>()

    //#region remote controlled dialog
    const { open, closeDialog } = useRemoteControlledDialog(WalletMessages.events.connectWalletDialogUpdated, (ev) => {
        if (!ev.open) return
        setExpectedChainId(ev.chainId)
        setExpectedNetworkType(ev.networkType)
        setExpectedProviderType(ev.providerType)
    })
    //#endregion

    //#region walletconnect
    const { setDialog: setWalletConnectDialog } = useRemoteControlledDialog(
        WalletMessages.events.walletConnectQRCodeDialogUpdated,
    )
    //#endregion

    const connectTo = useCallback(async () => {
        if (!expectedNetworkType) throw new Error('Unknown network type.')
        if (!expectedProviderType) throw new Error('Unknown provider type.')

        // read the chain detailed from the built-in chain list
        const expectedChainId_ = expectedChainId ?? getChainIdFromNetworkType(expectedNetworkType)
        const chainDetailedCAIP = getChainDetailedCAIP(expectedChainId_)
        if (!chainDetailedCAIP) throw new Error('Unknown network type.')

        // a short time loading makes the user fells better
        await delay(1000)

        let account: string | undefined
        let chainId: ChainId | undefined

        switch (expectedProviderType) {
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
                ;({ account, chainId } = await Services.Ethereum.connectCustomNetwork(expectedChainId_))
                break
            default:
                safeUnreachable(expectedProviderType)
                break
        }

        // connection failed
        if (!account || !expectedNetworkType)
            throw new Error(`Failed to connect ${resolveProviderName(expectedProviderType)}.`)

        // need to switch chain
        if (chainId !== expectedChainId_) {
            try {
                const overrides = {
                    chainId: expectedChainId_,
                    providerType: expectedProviderType,
                }
                await Promise.race([
                    (async () => {
                        await delay(30 /* seconds */ * 1000 /* milliseconds */)
                        throw new Error('Timeout!')
                    })(),
                    expectedNetworkType === NetworkType.Ethereum
                        ? Services.Ethereum.switchEthereumChain(ChainId.Mainnet, overrides)
                        : Services.Ethereum.addEthereumChain(chainDetailedCAIP, account, overrides),
                ])
            } catch {
                throw new Error(`Make sure your wallet is on the ${resolveNetworkName(expectedNetworkType)} network.`)
            }
        }

        // update account
        await WalletRPC.updateAccount({
            account,
            chainId: expectedChainId_,
            providerType: expectedProviderType,
            networkType: expectedNetworkType,
        })
        return true as const
    }, [expectedChainId, expectedNetworkType, expectedProviderType])

    const connection = useAsyncRetry<true>(async () => {
        if (!open) return true

        // connect to the specific provider
        await connectTo()

        // switch to the wallet status dialog
        closeDialog()

        return true
    }, [open, expectedProviderType, connectTo])

    if (!expectedProviderType) return null

    return (
        <InjectedDialog
            title={`Connect to ${resolveProviderName(expectedProviderType)}`}
            open={open}
            onClose={closeDialog}>
            <DialogContent className={classes.content}>
                <ConnectionProgress providerType={expectedProviderType} connection={connection} />
            </DialogContent>
        </InjectedDialog>
    )
}
