import { forwardRef, useState } from 'react'
import type { SingletonModalRefCreator } from '../../libs/SingletonModal.js'
import { useSingletonModal } from '../../hooks/useSingletonModal.js'
import type { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { SelectProviderDomal } from './SelectProvider.js'

export interface SelectProviderDialogOpenProps {
    requiredSupportPluginID?: NetworkPluginID
    requiredSupportChainIds?: Web3Helper.ChainIdAll[]
    walletConnectedCallback?: () => void
}

export interface SelectProviderDialogProps {}

export const SelectProviderModal = forwardRef<
    SingletonModalRefCreator<SelectProviderDialogOpenProps>,
    SelectProviderDialogProps
>((props, ref) => {
    const [requiredSupportPluginID, setRequiredSupportPluginID] = useState<NetworkPluginID | undefined>()
    const [requiredSupportChainIds, setRequiredSupportChainIds] = useState<Web3Helper.ChainIdAll[] | undefined>()
    const [walletConnectedCallback, setWalletConnectedCallback] = useState<(() => void) | undefined>()

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
        <SelectProviderDomal
            requiredSupportPluginID={requiredSupportPluginID}
            requiredSupportChainIds={requiredSupportChainIds}
            walletConnectedCallback={walletConnectedCallback}
            open
            onClose={() => dispatch?.close()}
        />
    )
})
