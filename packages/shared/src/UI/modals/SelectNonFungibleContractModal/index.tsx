import { forwardRef, useState } from 'react'
import type { Web3Helper } from '@masknet/web3-helpers'
import { type SingletonModalRefCreator, NetworkPluginID } from '@masknet/shared-base'
import type { NonFungibleCollection } from '@masknet/web3-shared-base'
import { useSingletonModal } from '../../../hooks/useSingletonModal.js'
import { SelectNonFungibleContractDialog } from './SelectNonFungibleContractDialog.js'

export interface SelectNonFungibleContractModalOpenProps<T extends NetworkPluginID = NetworkPluginID> {
    pluginID: T
    chainId?: Web3Helper.Definition[T]['ChainId']
    title?: string
    onSubmit?(
        collection: NonFungibleCollection<Web3Helper.Definition[T]['ChainId'], Web3Helper.Definition[T]['SchemaType']>,
    ): void
}

export interface SelectNonFungibleContractModalProps {}

export const SelectNonFungibleContractModal = forwardRef<
    SingletonModalRefCreator<SelectNonFungibleContractModalOpenProps>,
    SelectNonFungibleContractModalProps
>((props, ref) => {
    const [pluginID, setPluginID] = useState(NetworkPluginID.PLUGIN_EVM)
    const [chainId, setChainId] = useState<Web3Helper.ChainIdAll>()
    const [title, setTitle] = useState<string>()
    const [onSubmit, setOnSubmit] =
        useState<(collection: NonFungibleCollection<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>) => void>()
    const [open, dispatch] = useSingletonModal(ref, {
        onOpen(props) {
            setPluginID(props.pluginID)
            setChainId(props.chainId)
            setTitle(props.title)
            setOnSubmit(() => props.onSubmit)
        },
    })

    if (!open) return null
    return (
        <SelectNonFungibleContractDialog
            open
            onClose={() => dispatch?.close()}
            title={title}
            chainId={chainId}
            pluginID={pluginID}
            onSubmit={onSubmit}
        />
    )
})
