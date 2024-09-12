import { type NetworkPluginID, type SingletonModalProps } from '@masknet/shared-base'
import { useSingletonModal } from '@masknet/shared-base-ui'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useOKXTokenList } from '@masknet/web3-hooks-evm'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useState } from 'react'
import { SelectFungibleTokenDialog, type SelectFungibleTokenDialogProps } from './SelectFungibleTokenDialog.js'

export interface SelectFungibleTokenModalOpenProps
    extends Omit<SelectFungibleTokenDialogProps, 'onClose' | 'open' | 'extendTokens'> {
    okxOnly?: boolean
}

export type SelectFungibleTokenModalCloseProps = Web3Helper.FungibleTokenAll | null

export function SelectFungibleTokenModal({
    ref,
}: SingletonModalProps<SelectFungibleTokenModalOpenProps, SelectFungibleTokenModalCloseProps>) {
    const [okxOnly, setOKXOnly] = useState<boolean>()
    const [enableManage, setEnableManage] = useState<boolean>()
    const [pluginID, setPluginID] = useState<NetworkPluginID>()
    const [chainId, setChainId] = useState<Web3Helper.ChainIdAll>()
    const [keyword, setKeyword] = useState<string>()
    const [whitelist, setWhitelist] = useState<string[]>()
    const [title, setTitle] = useState<string>()
    const [blacklist, setBlacklist] = useState<string[]>()
    const [disableSearchBar, setDisableSearchBar] = useState<boolean>()
    const [selectedChainId, setSelectedChainId] = useState<Web3Helper.ChainIdAll>()
    const [selectedTokens, setSelectedTokens] = useState<string[]>()
    const [chains, setChains] = useState<ChainId[]>()
    const [lockChainId, setLockChainId] = useState<boolean>()
    const { data: tokens, isPending } = useOKXTokenList(chainId as ChainId, okxOnly)

    const [open, dispatch] = useSingletonModal(ref, {
        onOpen(props) {
            setEnableManage(props.enableManage)
            setOKXOnly(props.okxOnly)
            setPluginID(props.pluginID)
            setChainId(props.chainId)
            setKeyword(props.keyword)
            setWhitelist(props.whitelist)
            setTitle(props.title)
            setBlacklist(props.blacklist)
            setDisableSearchBar(props.disableNativeToken)
            setSelectedChainId(props.chainId)
            setSelectedTokens(props.selectedTokens)
            setChains(props.chains)
            setLockChainId(props.lockChainId)
        },
    })

    if (!open) return null
    return (
        <SelectFungibleTokenDialog
            open
            enableManage={enableManage}
            pluginID={pluginID}
            chainId={chainId}
            lockChainId={lockChainId}
            keyword={keyword}
            whitelist={whitelist}
            title={title}
            blacklist={blacklist}
            tokens={tokens}
            extendTokens={okxOnly ? false : undefined}
            loading={okxOnly ? isPending : false}
            disableSearchBar={disableSearchBar}
            selectedChainId={selectedChainId}
            selectedTokens={selectedTokens}
            chains={chains}
            onClose={(token) => dispatch?.close(token)}
            onChainChange={setChainId}
        />
    )
}
