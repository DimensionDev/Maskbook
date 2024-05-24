import { useState } from 'react'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { NetworkPluginID, SingletonModalProps } from '@masknet/shared-base'
import { useSingletonModal } from '@masknet/shared-base-ui'
import { SelectProvider } from './SelectProvider.js'

export type SelectProviderModalOpenProps = {
    requiredSupportPluginID?: NetworkPluginID
    requiredSupportChainIds?: Web3Helper.ChainIdAll[]
} | void

export type SelectProviderModalCloseProps = boolean

interface SelectProviderModalProps
    extends SingletonModalProps<SelectProviderModalOpenProps, SelectProviderModalCloseProps> {
    createWallet(): void
}

export function SelectProviderModal({ createWallet, ref }: SelectProviderModalProps) {
    const [requiredSupportPluginID, setRequiredSupportPluginID] = useState<NetworkPluginID>()
    const [requiredSupportChainIds, setRequiredSupportChainIds] = useState<Web3Helper.ChainIdAll[]>()

    const [open, dispatch] = useSingletonModal(ref, {
        onOpen(props) {
            setRequiredSupportChainIds(props?.requiredSupportChainIds)
            setRequiredSupportPluginID(props?.requiredSupportPluginID)
        },
        onClose(props) {
            setRequiredSupportChainIds(undefined)
            setRequiredSupportPluginID(undefined)
        },
    })

    if (!open) return null
    return (
        <SelectProvider
            open
            createWallet={createWallet}
            requiredSupportPluginID={requiredSupportPluginID}
            requiredSupportChainIds={requiredSupportChainIds}
            onConnect={() => dispatch?.close(true)}
            onClose={() => dispatch?.close(false)}
        />
    )
}
