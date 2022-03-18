import { useCallback, useState } from 'react'
import { useAsyncRetry } from 'react-use'
import { DialogContent } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'
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
import { InjectedDialog } from '../../../../components/shared/InjectedDialog'
import { WalletMessages, WalletRPC } from '../../messages'
import { ConnectionProgress } from './ConnectionProgress'
import { EVM_RPC } from '@masknet/plugin-evm/src/messages'

const useStyles = makeStyles()((theme) => ({
    content: {
        padding: theme.spacing(2.5),
    },
}))

export interface ConnectWalletDialogProps {}

export function ConnectWalletDialog(props: ConnectWalletDialogProps) {
    const classes = useStylesExtends(useStyles(), props)

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
    // #endregion

    const connectTo = useCallback<() => Promise<true>>(async () => {
        if (!networkType) throw new Error('Unknown network type.')
        if (!providerType) throw new Error('Unknown provider type.')

        // read the chain detailed from the built-in chain list
        const expectedChainId = getChainIdFromNetworkType(networkType)
        const chainDetailedCAIP = getChainDetailedCAIP(expectedChainId)
        if (!chainDetailedCAIP) throw new Error('Unknown network type.')

        // a short time loading makes the user fells better
        await delay(1000)

        const overrides = {
            chainId: expectedChainId,
            providerType,
        }

        // try to read the currently select chain id and account from the provider
        let account: string | undefined
        let chainId: ChainId | undefined

        switch (providerType) {
            case ProviderType.MaskWallet:
            case ProviderType.MetaMask:
            case ProviderType.WalletConnect:
            case ProviderType.Coin98:
            case ProviderType.WalletLink:
            case ProviderType.MathWallet:
            case ProviderType.Fortmatic:
                ;({ account, chainId } = await EVM_RPC.connect({
                    chainId: expectedChainId,
                    providerType,
                }))
                break
            case ProviderType.CustomNetwork:
                throw new Error('To be implemented.')
            default:
                safeUnreachable(providerType)
                break
        }

        // connection failed
        if (!account || !networkType) throw new Error(`Failed to connect to ${resolveProviderName(providerType)}.`)

        // switch to the expected chain automatically
        if (chainId !== expectedChainId) {
            try {
                const switchable =
                    // the coin98 wallet cannot handle add/switch RPC provider correctly
                    // it will always add a new RPC provider even if the network exists
                    providerType !== ProviderType.Coin98 &&
                    // to switch chain with walletconnect is not implemented widely
                    providerType !== ProviderType.WalletConnect

                if (switchable) {
                    await Promise.race([
                        (async () => {
                            await delay(30 /* seconds */ * 1000 /* milliseconds */)
                            throw new Error('Timeout!')
                        })(),
                        networkType === NetworkType.Ethereum
                            ? EVM_RPC.switchEthereumChain(ChainId.Mainnet, overrides)
                            : EVM_RPC.addEthereumChain(chainDetailedCAIP, account, overrides),
                    ])
                }

                // recheck
                const actualChainId = Number.parseInt(await EVM_RPC.getChainId(overrides), 16)
                if (actualChainId !== expectedChainId)
                    throw new Error('Failed to switch chain, please try again later.')
            } catch {
                throw new Error(`Make sure your wallet is on the ${resolveNetworkName(networkType)} network.`)
            }
        }

        // update account
        await WalletRPC.updateAccount({
            account,
            chainId: expectedChainId,
            networkType,
            providerType,
        })
        return true as const
    }, [networkType, providerType])

    const connection = useAsyncRetry<true>(async () => {
        if (!open) return true

        await connectTo()

        // delay for syncing settings
        await delay(1000)

        setConnectWalletDialog({
            open: false,
            result: true,
        })

        return true
    }, [open, connectTo, setConnectWalletDialog])

    if (!providerType) return null

    return (
        <InjectedDialog
            title={`Connect to ${resolveProviderName(providerType)}`}
            open={open}
            onClose={() => setConnectWalletDialog({ open: false, result: false })}>
            <DialogContent className={classes.content}>
                <ConnectionProgress providerType={providerType} connection={connection} />
            </DialogContent>
        </InjectedDialog>
    )
}
