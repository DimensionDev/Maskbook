import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { ChainId } from '@masknet/web3-shared-evm'
import { ChainId as FlowChainId } from '@masknet/web3-shared-flow'
import { noop, sortBy } from 'lodash-es'
import { ChainId as SolanaChainId } from '@masknet/web3-shared-solana'
import { useNetworkDescriptors } from '@masknet/web3-hooks-base'
import {
    createContext,
    memo,
    useMemo,
    type PropsWithChildren,
    useState,
    type SetStateAction,
    type Dispatch,
    useContext,
} from 'react'
import type { NetworkDescriptor } from '@masknet/web3-shared-base'

interface ChainRuntimeOptions {
    pluginID: NetworkPluginID
    defaultChainId?: Web3Helper.ChainIdAll
    account: string
    chainId?: Web3Helper.ChainIdAll
    setChainId: Dispatch<SetStateAction<ChainId | FlowChainId | SolanaChainId | undefined>>
    networks: Array<NetworkDescriptor<Web3Helper.ChainIdAll, Web3Helper.NetworkTypeAll>>
}

const ChainRuntimeContext = createContext<ChainRuntimeOptions>({
    pluginID: NetworkPluginID.PLUGIN_EVM,
    account: '',
    setChainId: noop,
    networks: EMPTY_LIST,
})

const SimpleHashSupportedChains: Record<NetworkPluginID, number[]> = {
    [NetworkPluginID.PLUGIN_EVM]: [
        ChainId.Mainnet,
        ChainId.BSC,
        ChainId.Matic,
        ChainId.Arbitrum,
        ChainId.Optimism,
        ChainId.Avalanche,
        ChainId.xDai,
    ],
    [NetworkPluginID.PLUGIN_SOLANA]: [SolanaChainId.Mainnet],
    [NetworkPluginID.PLUGIN_FLOW]: [FlowChainId.Mainnet],
}

export interface ChainRuntimeProviderProps
    extends Pick<ChainRuntimeOptions, 'pluginID' | 'defaultChainId' | 'account'> {}

export const ChainRuntimeProvider = memo<PropsWithChildren<ChainRuntimeProviderProps>>(function ChainRuntimeProvider({
    pluginID,
    account,
    defaultChainId,
    children,
}) {
    const [chainId, setChainId] = useState<Web3Helper.ChainIdAll>()
    const allNetworks = useNetworkDescriptors(pluginID)

    const networks = useMemo(() => {
        const supported = SimpleHashSupportedChains[pluginID]
        return sortBy(
            allNetworks.filter((x) => x.isMainnet && supported.includes(x.chainId)),
            (x) => supported.indexOf(x.chainId),
        )
    }, [allNetworks, pluginID])

    const currentChainId = chainId ?? defaultChainId ?? (networks.length === 1 ? networks[0].chainId : chainId)

    const value = useMemo(
        () => ({ pluginID, account, defaultChainId, chainId: currentChainId, setChainId, networks }),
        [pluginID, account, defaultChainId, currentChainId, networks],
    )

    return <ChainRuntimeContext.Provider value={value}>{children}</ChainRuntimeContext.Provider>
})

export function useChainRuntime() {
    return useContext(ChainRuntimeContext)
}
