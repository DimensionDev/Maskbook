import { forwardRef, useState } from 'react'
import { type NetworkPluginID, type SingletonModalRefCreator } from '@masknet/shared-base'
import { useSingletonModal } from '../../../hooks/useSingletonModal.js'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { FungibleToken } from '@masknet/web3-shared-base'
import { SelectFungibleTokenDialog } from './SelectFungibleTokenDialog.js'

export interface SelectFungibleTokenModalOpenProps {
    enableManage?: boolean
    pluginID?: NetworkPluginID
    chainId?: Web3Helper.ChainIdAll
    keyword?: string
    whitelist?: string[]
    title?: string
    blacklist?: string[]
    tokens?: Array<FungibleToken<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>>
    disableSearchBar?: boolean
    disableNativeToken?: boolean
    selectedTokens?: string[]
}

export interface SelectFungibleTokenModalCloseProps {
    token?: Web3Helper.FungibleTokenAll | null
}

export interface SelectFungibleTokenModalProps {}

export const SelectFungibleTokenModal = forwardRef<
    SingletonModalRefCreator<SelectFungibleTokenModalOpenProps, SelectFungibleTokenModalCloseProps>,
    SelectFungibleTokenModalProps
>((props, ref) => {
    const [enableManage, setEnableManage] = useState<boolean>()
    const [pluginID, setPluginID] = useState<NetworkPluginID>()
    const [chainId, setChainId] = useState<Web3Helper.ChainIdAll>()
    const [keyword, setKeyword] = useState<string>()
    const [whitelist, setWhitelist] = useState<string[]>()
    const [title, setTitle] = useState<string>()
    const [blacklist, setBlacklist] = useState<string[]>()
    const [tokens, setTokens] = useState<Array<FungibleToken<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>>>()
    const [disableSearchBar, setDisableSearchBar] = useState<boolean>()
    const [selectedTokens, setSelectedTokens] = useState<string[]>()

    const [open, dispatch] = useSingletonModal(ref, {
        onOpen(props) {
            setEnableManage(props.enableManage)
            setPluginID(props.pluginID)
            setChainId(props.chainId)
            setKeyword(props.keyword)
            setWhitelist(props.whitelist)
            setTitle(props.title)
            setBlacklist(props.blacklist)
            setTokens(props.tokens)
            setDisableSearchBar(props.disableNativeToken)
            setSelectedTokens(props.selectedTokens)
        },
    })

    if (!open) return null
    return (
        <SelectFungibleTokenDialog
            open
            onClose={(token) => dispatch?.close({ token })}
            enableManage={enableManage}
            pluginID={pluginID}
            chainId={chainId}
            keyword={keyword}
            whitelist={whitelist}
            title={title}
            blacklist={blacklist}
            tokens={tokens}
            disableSearchBar={disableSearchBar}
            selectedTokens={selectedTokens}
        />
    )
})
