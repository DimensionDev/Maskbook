import { PluginWeb3Context, useNetworkDescriptors } from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { MaskTabList, useTabs } from '@masknet/theme'
import type { NetworkPluginID } from '@masknet/shared-base'
import TabContext from '@mui/lab/TabContext'
import { Stack, Tab, Typography } from '@mui/material'
import { WalletIcon } from '@masknet/shared'
import { useUpdateEffect } from 'react-use'
import React, { useContext } from 'react'

interface NetworkTabProps<T extends NetworkPluginID>
    extends withClasses<'tab' | 'tabs' | 'tabPanel' | 'indicator' | 'focusTab' | 'tabPaper'> {
    chains: Array<Web3Helper.Definition[T]['ChainId']>
}

export function NetworkTab<T extends NetworkPluginID = NetworkPluginID.PLUGIN_EVM>(props: NetworkTabProps<T>) {
    const { chains } = props
    const { chainId, setChainId, networkPluginID } = useContext(PluginWeb3Context)

    const networks = useNetworkDescriptors(networkPluginID)
    const usedNetworks = networks.filter((x) => chains.find((c) => c === x.chainId))
    const networkIds = usedNetworks.map((x) => x.chainId.toString())
    const [currentTab, , , setTab] = useTabs(chainId?.toString() ?? networkIds[0], ...networkIds)

    useUpdateEffect(() => {
        setTab((prev) => {
            if (chainId && prev !== chainId?.toString()) return chainId.toString()
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
