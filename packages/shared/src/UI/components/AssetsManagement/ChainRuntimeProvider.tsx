import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { CHAIN_DESCRIPTORS, ChainId, type NetworkType, type SchemaType } from '@masknet/web3-shared-evm'
import { ChainId as FlowChainId } from '@masknet/web3-shared-flow'
import { noop, sortBy } from 'lodash-es'
import { ChainId as SolanaChainId } from '@masknet/web3-shared-solana'
import { useNetworks } from '@masknet/web3-hooks-base'
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
import type { ReasonableNetwork } from '@masknet/web3-shared-base'

interface ChainRuntimeOptions {
    pluginID: NetworkPluginID
    defaultChainId?: Web3Helper.ChainIdAll
    account: string
    chainId?: Web3Helper.ChainIdAll
    setChainId: Dispatch<SetStateAction<ChainId | FlowChainId | SolanaChainId | undefined>>
    networks: Array<ReasonableNetwork<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll, Web3Helper.NetworkTypeAll>>
}

const ChainRuntimeContext = createContext<ChainRuntimeOptions>({
    pluginID: NetworkPluginID.PLUGIN_EVM,
    account: '',
    setChainId: noop,
    networks: EMPTY_LIST,
})

// https://docs.simplehash.com/reference/chains
// sync `resolveChainId` and `ChainNameMap` in `web3-providers/src/SimpleHash/helpers.ts`
const SimpleHashSupportedChains: Record<NetworkPluginID, number[]> = {
    [NetworkPluginID.PLUGIN_EVM]: [
        ChainId.Mainnet,
        ChainId.BSC,
        ChainId.Base,
        ChainId.Polygon,
        ChainId.Arbitrum,
        ChainId.Optimism,
        ChainId.Avalanche,
        ChainId.xDai,
        ChainId.Scroll,
        ChainId.Zora,
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
    const allNetworks = useNetworks(pluginID, true)

    const networks = useMemo(() => {
        const supported = SimpleHashSupportedChains[pluginID]
        const networks = allNetworks.filter(
            (x) => (x.network === 'mainnet' || x.isCustomized) && supported.includes(x.chainId),
        )
        // hard-coded for Zora
        if (pluginID === NetworkPluginID.PLUGIN_EVM) {
            const zora = CHAIN_DESCRIPTORS.find((x) => x.chainId === ChainId.Zora)
            if (zora) networks.push(zora as ReasonableNetwork<ChainId, SchemaType, NetworkType>)
        }
        return sortBy(networks, (x) => supported.indexOf(x.chainId))
    }, [allNetworks, pluginID])

    const currentChainId = chainId ?? defaultChainId ?? (networks.length === 1 ? networks[0].chainId : chainId)

    const value = useMemo(
        () => ({ pluginID, account, defaultChainId, chainId: currentChainId, setChainId, networks }),
        [pluginID, account, defaultChainId, currentChainId, networks],
    )

    return <ChainRuntimeContext value={value}>{children}</ChainRuntimeContext>
})

export function useChainRuntime() {
    return useContext(ChainRuntimeContext)
}
