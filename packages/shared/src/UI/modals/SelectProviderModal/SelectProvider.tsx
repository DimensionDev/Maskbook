import { delay, getEnumAsArray } from '@masknet/kit'
import { getRegisteredWeb3Providers } from '@masknet/web3-providers'
import { ConnectWalletModal, InjectedDialog, useSharedTrans } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { ProviderType } from '@masknet/web3-shared-evm'
import { DialogContent } from '@mui/material'
import { memo, useCallback, useMemo, useState } from 'react'
import { PluginProviderRender } from './PluginProviderRender.js'
import { GuideDialog } from './GuideDialog.js'

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
    const { open, requiredSupportPluginID, requiredSupportChainIds, onConnect, onClose } = props
    const t = useSharedTrans()
    const { classes } = useStyles()
    // Guiding provider
    const [provider, setProvider] = useState<Web3Helper.ProviderDescriptorAll>()

    const handleSelect = useCallback(
        async (network: Web3Helper.NetworkDescriptorAll, provider: Web3Helper.ProviderDescriptorAll) => {
            setProvider(undefined)
            onClose()
            await delay(500)

            const connected = await ConnectWalletModal.openAndWaitForClose({
                pluginID: network.networkSupporterPluginID,
                networkType: network.type,
                providerType: provider.type,
            })

            if (connected) onConnect?.()
            onClose()
        },
        [onConnect, onClose],
    )
    const providers = useMemo(() => {
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
            title={t.plugin_wallet_select_provider_dialog_title()}
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
