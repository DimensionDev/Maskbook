import { useState } from 'react'
import type { Web3Helper } from '@masknet/web3-helpers'
import { type SingletonModalProps, NetworkPluginID } from '@masknet/shared-base'
import { useSingletonModal } from '@masknet/shared-base-ui'
import type { NonFungibleCollection } from '@masknet/web3-shared-base'
import type { SchemaType } from '@masknet/web3-shared-evm'
import { SelectNonFungibleContractDialog } from './SelectNonFungibleContractDialog.js'

export interface SelectNonFungibleContractModalOpenProps<T extends NetworkPluginID = NetworkPluginID> {
    pluginID: T
    chainId?: Web3Helper.Definition[T]['ChainId']
    schemaType?: SchemaType
    title?: string
    collections?: Array<NonFungibleCollection<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>>
    selectedCollections?: Array<NonFungibleCollection<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>>
    multiple?: boolean
    maxCollections?: number
    onSubmit?(
        collection:
            | NonFungibleCollection<Web3Helper.Definition[T]['ChainId'], Web3Helper.Definition[T]['SchemaType']>
            | Array<NonFungibleCollection<Web3Helper.Definition[T]['ChainId'], Web3Helper.Definition[T]['SchemaType']>>,
    ): void
}

export function SelectNonFungibleContractModal({ ref }: SingletonModalProps<SelectNonFungibleContractModalOpenProps>) {
    const [pluginID, setPluginID] = useState(NetworkPluginID.PLUGIN_EVM)
    const [chainId, setChainId] = useState<Web3Helper.ChainIdAll>()
    const [schemaType, setSchemaType] = useState<SchemaType>()
    const [title, setTitle] = useState<string>()
    const [collections, setCollections] =
        useState<Array<NonFungibleCollection<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>>>()
    const [onSubmit, setOnSubmit] =
        useState<(collection: NonFungibleCollection<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>) => void>()
    const [multiple, setMultiple] = useState<boolean>()
    const [maxCollections, setMaxCollections] = useState<number>()
    const [selectedCollections, setSelectedCollections] =
        useState<Array<NonFungibleCollection<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>>>()

    const [open, dispatch] = useSingletonModal(ref, {
        onOpen(props) {
            setPluginID(props.pluginID)
            setChainId(props.chainId)
            setSchemaType(props.schemaType)
            setTitle(props.title)
            setOnSubmit(() => props.onSubmit)
            setCollections(props.collections)
            setMultiple(props.multiple)
            setMaxCollections(props.maxCollections)
            setSelectedCollections(props.selectedCollections)
        },
    })

    if (!open) return null
    return (
        <SelectNonFungibleContractDialog
            open
            onClose={() => dispatch?.close()}
            title={title}
            schemaType={schemaType}
            chainId={chainId}
            pluginID={pluginID}
            multiple={multiple}
            maxCollections={maxCollections}
            selectedCollections={selectedCollections}
            initialCollections={collections}
            onSubmit={onSubmit}
        />
    )
}
