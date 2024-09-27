import { delay, getEnumAsArray } from '@masknet/kit'
import { getRegisteredWeb3Providers, MaskWalletProvider } from '@masknet/web3-providers'
import { ConnectWalletModal, InjectedDialog } from '@masknet/shared'
import { NetworkPluginID, Sniffings } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { ProviderType } from '@masknet/web3-shared-evm'
import { DialogContent } from '@mui/material'
import { memo, useCallback, useMemo, useState } from 'react'
import { PluginProviderRender } from './PluginProviderRender.js'
import { GuideDialog } from './GuideDialog.js'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    dialog: {
        width: 600,
        height: 620,
    },
    content: {
        padding: theme.spacing(0),
        minHeight: 430,
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
}))

interface SelectProviderProps {
    open: boolean
    requiredSupportPluginID?: NetworkPluginID
    requiredSupportChainIds?: Web3Helper.ChainIdAll[]
    onConnect?: () => void
    onClose: () => void
    createWallet(): void
}
export const SelectProvider = memo(function SelectProvider(props: SelectProviderProps) {
    const { open, requiredSupportPluginID, requiredSupportChainIds, onConnect, onClose, createWallet } = props
    const { classes } = useStyles()
    // Guiding provider
    const [provider, setProvider] = useState<Web3Helper.ProviderDescriptorAll>()

    const handleSelect = useCallback(
        async (network: Web3Helper.NetworkDescriptorAll, provider: Web3Helper.ProviderDescriptorAll) => {
            setProvider(undefined)
            // Create wallet first if no wallets yet.
            if (
                provider.type === ProviderType.MaskWallet &&
                !MaskWalletProvider.subscription.wallets.getCurrentValue().length
            ) {
                createWallet()
                return
            }
            // Do not close the dialog for WalletConnect until the wallet gets connected
            const isNotWalletConnect = provider.type !== ProviderType.WalletConnect

            if (isNotWalletConnect) {
                onClose()
            }
            await delay(500)

            const connected = await ConnectWalletModal.openAndWaitForClose({
                pluginID: network.networkSupporterPluginID,
                networkType: network.type,
                providerType: provider.type,
            })

            if (connected) onConnect?.()
            else if (isNotWalletConnect) onClose()
        },
        [onConnect, onClose],
    )
    const providers = useMemo(() => {
        if (Sniffings.is_dashboard_page) return getRegisteredWeb3Providers(NetworkPluginID.PLUGIN_EVM)
        if (requiredSupportPluginID) return getRegisteredWeb3Providers(requiredSupportPluginID)
        return getEnumAsArray(NetworkPluginID).flatMap((x) => getRegisteredWeb3Providers(x.value))
    }, [requiredSupportPluginID])

    if (provider) {
        return (
            <GuideDialog
                classes={{ paper: classes.dialog }}
                open
                provider={provider}
                titleBarIconStyle="back"
                onClose={() => {
                    setProvider(undefined)
                }}
            />
        )
    }

    return (
        <InjectedDialog
            classes={{ paper: classes.dialog }}
            title={<Trans>Connect Wallet</Trans>}
            open={open}
            onClose={onClose}>
            <DialogContent className={classes.content}>
                <PluginProviderRender
                    providers={providers}
                    requiredSupportChainIds={requiredSupportChainIds}
                    requiredSupportPluginID={requiredSupportPluginID}
                    onSelect={handleSelect}
                    onOpenGuide={setProvider}
                />
            </DialogContent>
        </InjectedDialog>
    )
})
