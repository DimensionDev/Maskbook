import {
    PluginWeb3ContextProvider,
    useCurrentWeb3NetworkPluginID,
    useDefaultChainId,
    useNetworkDescriptors,
} from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { MaskTabList, useTabs } from '@masknet/theme'
import { NetworkPluginID } from '@masknet/shared-base'
import TabContext from '@mui/lab/TabContext'
import { Stack, Tab, Typography } from '@mui/material'
import { WalletIcon } from '@masknet/shared'
import { useUpdateEffect } from 'react-use'
import React, { createContext, useContext, useState } from 'react'
import { ChainId } from '@masknet/web3-shared-evm'
import { noop } from 'lodash-unified'

interface NetworkTabProps<T extends NetworkPluginID>
    extends withClasses<'tab' | 'tabs' | 'tabPanel' | 'indicator' | 'focusTab' | 'tabPaper'> {
    chains: Array<Web3Helper.Definition[T]['ChainId']>
}

export function NetworkTab<T extends NetworkPluginID = NetworkPluginID.PLUGIN_EVM>(props: NetworkTabProps<T>) {
    const { chains } = props
    const { chainId, setChainId, networkId } = useContext(NetworkTabContext)

    const networks = useNetworkDescriptors(networkId)
    const usedNetworks = networks.filter((x) => chains.find((c) => c === x.chainId))
    const networkIds = usedNetworks.map((x) => x.chainId.toString())
    const [currentTab, , , setTab] = useTabs(chainId.toString() ?? networkIds[0], ...networkIds)

    useUpdateEffect(() => {
        setTab((prev) => {
            if (prev !== chainId.toString()) return chainId.toString()
            return prev
        })
    }, [chainId])

    return (
        <TabContext value={currentTab}>
            <MaskTabList
                variant="flexible"
                onChange={(_, v) => {
                    setChainId(Number.parseInt(v, 10))
                    setTab(v)
                }}
                aria-label="Network Tabs">
                {usedNetworks.map((x) => {
                    return (
                        <Tab
                            aria-label={x.name}
                            key={x.chainId}
                            value={x.chainId.toString()}
                            label={
                                <Stack display="inline-flex" flexDirection="row" alignItems="center" gap={0.5}>
                                    <WalletIcon mainIcon={x.icon} size={18} />
                                    <Typography
                                        variant="body2"
                                        fontSize={14}
                                        fontWeight={currentTab === x.chainId.toString() ? 700 : 400}>
                                        {x.shortName ?? x.name}
                                    </Typography>
                                </Stack>
                            }
                        />
                    )
                })}
            </MaskTabList>
        </TabContext>
    )
}

interface NetworkTabContext<T extends NetworkPluginID> {
    networkId: NetworkPluginID
    chainId: Web3Helper.Definition[T]['ChainId']
    setChainId: (chainId: Web3Helper.Definition[T]['ChainId']) => void
}

export const NetworkTabContext = createContext<NetworkTabContext<NetworkPluginID>>({
    networkId: NetworkPluginID.PLUGIN_EVM,
    chainId: ChainId.Mainnet,
    setChainId: noop,
})

export function NetworkTabContextProvider<T extends NetworkPluginID>({
    value,
    children,
}: { pluginID: T } & React.ProviderProps<NetworkTabContext<T>['chainId']>) {
    const currentPluginId = useCurrentWeb3NetworkPluginID()
    const defaultChainId = useDefaultChainId(currentPluginId)
    const [selectedChainId, setSelectedChainId] = useState<Web3Helper.Definition[T]['ChainId']>(value ?? defaultChainId)

    return (
        <PluginWeb3ContextProvider value={{ chainId: selectedChainId }} pluginID={currentPluginId}>
            <NetworkTabContext.Provider
                value={{ chainId: selectedChainId, setChainId: setSelectedChainId, networkId: currentPluginId }}>
                {children}
            </NetworkTabContext.Provider>
        </PluginWeb3ContextProvider>
    )
}
