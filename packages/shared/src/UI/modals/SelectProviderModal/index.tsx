import { forwardRef, useState } from 'react'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { NetworkPluginID, SingletonModalRefCreator } from '@masknet/shared-base'
import { SelectProvider } from './SelectProvider.js'
import { useSingletonModal } from '../../../hooks/useSingletonModal.js'

export type SelectProviderModalOpenProps = {
    requiredSupportPluginID?: NetworkPluginID
    requiredSupportChainIds?: Web3Helper.ChainIdAll[]
    walletConnectedCallback?: () => void
} | void

export interface SelectProviderModalProps {}

export const SelectProviderModal = forwardRef<
    SingletonModalRefCreator<SelectProviderModalOpenProps>,
    SelectProviderModalProps
>((props, ref) => {
    const [requiredSupportPluginID, setRequiredSupportPluginID] = useState<NetworkPluginID>()
    const [requiredSupportChainIds, setRequiredSupportChainIds] = useState<Web3Helper.ChainIdAll[]>()
    const [walletConnectedCallback, setWalletConnectedCallback] = useState<() => void>()

    const [open, dispatch] = useSingletonModal(ref, {
        onOpen(props) {
            setWalletConnectedCallback(() => props?.walletConnectedCallback)
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
            requiredSupportPluginID={requiredSupportPluginID}
            requiredSupportChainIds={requiredSupportChainIds}
            walletConnectedCallback={walletConnectedCallback}
            onClose={() => dispatch?.close()}
        />
    )
})
