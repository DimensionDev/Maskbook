import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { ReasonableNetwork } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import type { ChainId as FlowChainId } from '@masknet/web3-shared-flow'
import type { ChainId as SolanaChainId } from '@masknet/web3-shared-solana'
import { noop } from 'lodash-es'
import {
    createContext,
    memo,
    useContext,
    useMemo,
    useState,
    type Dispatch,
    type PropsWithChildren,
    type SetStateAction,
} from 'react'
import { useAssetsNetworks } from './useAssetsNetworks.js'
import { NFTSCAN_CHAIN_IDS } from '@masknet/web3-providers'

interface ChainRuntimeOptions {
    pluginID: NetworkPluginID
    defaultChainId?: Web3Helper.ChainIdAll
    account: string
    chainId?: Web3Helper.ChainIdAll
    setChainId: Dispatch<SetStateAction<ChainId | FlowChainId | SolanaChainId | undefined>>
    networks: Array<ReasonableNetwork<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll, Web3Helper.NetworkTypeAll>>
    chainWhiteList?: ChainId[]
}

const ChainRuntimeContext = createContext<ChainRuntimeOptions>({
    pluginID: NetworkPluginID.PLUGIN_EVM,
    account: '',
    setChainId: noop,
    networks: EMPTY_LIST,
})
ChainRuntimeContext.displayName = 'ChainRuntimeContext'

export interface ChainRuntimeProviderProps
    extends Pick<ChainRuntimeOptions, 'pluginID' | 'defaultChainId' | 'account' | 'chainWhiteList'> {}

export const ChainRuntimeProvider = memo<PropsWithChildren<ChainRuntimeProviderProps>>(function ChainRuntimeProvider({
    pluginID,
    account,
    defaultChainId,
    chainWhiteList,
    children,
}) {
    const [chainId, setChainId] = useState<Web3Helper.ChainIdAll>()
    const assetsNetworks = useAssetsNetworks(pluginID)

    const networks = useMemo(() => {
        const list =
            pluginID === NetworkPluginID.PLUGIN_SOLANA ?
                assetsNetworks
            :   assetsNetworks.filter((x) => NFTSCAN_CHAIN_IDS.includes(x.chainId as ChainId))
        return chainWhiteList?.length ? list.filter((x) => chainWhiteList.includes(x.chainId as ChainId)) : list
    }, [chainWhiteList, assetsNetworks])

    const currentChainId = chainId ?? defaultChainId ?? networks?.[0]?.chainId

    const value = useMemo(
        () => ({ pluginID, account, defaultChainId, chainId: currentChainId, setChainId, networks, chainWhiteList }),
        [pluginID, account, defaultChainId, currentChainId, networks, chainWhiteList],
    )

    return <ChainRuntimeContext value={value}>{children}</ChainRuntimeContext>
})

export function useChainRuntime() {
    return useContext(ChainRuntimeContext)
}
