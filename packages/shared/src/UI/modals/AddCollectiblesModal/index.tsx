import { useState } from 'react'
import { NetworkPluginID, type SingletonModalProps } from '@masknet/shared-base'
import { useSingletonModal } from '@masknet/shared-base-ui'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { NonFungibleTokenContract } from '@masknet/web3-shared-base'
import { AddCollectiblesDialog } from './AddCollectiblesDialog.js'

export interface AddCollectiblesModalOpenProps {
    pluginID?: NetworkPluginID
    chainId?: Web3Helper.ChainIdAll
    /**
     * Specified account.
     * For example, in PFP, we can add collectibles from verified wallets if no wallet connected.
     */
    account?: string
}

export type AddCollectiblesModalCloseProps =
    | [contract: NonFungibleTokenContract<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>, tokenIds: string[]]
    | undefined

export function AddCollectiblesModal({
    ref,
}: SingletonModalProps<AddCollectiblesModalOpenProps, AddCollectiblesModalCloseProps>) {
    const [pluginID, setPluginID] = useState<NetworkPluginID>(NetworkPluginID.PLUGIN_EVM)
    const [chainId, setChainId] = useState<Web3Helper.ChainIdAll>()
    const [account, setAccount] = useState<string>()

    const [open, dispatch] = useSingletonModal(ref, {
        onOpen(props) {
            setPluginID(props.pluginID ?? NetworkPluginID.PLUGIN_EVM)
            setChainId(props.chainId)
            setAccount(props.account)
        },
    })

    if (!open) return null
    return (
        <AddCollectiblesDialog
            open
            onAdd={(results) => dispatch?.close(results)}
            pluginID={pluginID}
            account={account}
            chainId={chainId}
        />
    )
}
