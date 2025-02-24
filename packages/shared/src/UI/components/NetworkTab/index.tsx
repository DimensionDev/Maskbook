import type { NetworkPluginID } from '@masknet/shared-base'
import { MaskTabList, useTabs, type MaskTabListProps } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import {
    useChainContext,
    useNetworkContext,
    useNetworkDescriptors,
    useSmartPayChainId,
    useWallet,
    useWeb3Utils,
} from '@masknet/web3-hooks-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { TabContext } from '@mui/lab'
import { Stack, Tab, Typography } from '@mui/material'
import { memo, useMemo } from 'react'
import { useUpdateEffect } from 'react-use'
import { WalletIcon } from '../WalletIcon/index.js'

interface NetworkTabProps extends Omit<MaskTabListProps, 'onChange'> {
    chains: Web3Helper.ChainIdAll[]
    pluginID: NetworkPluginID

    onChange?(chainId: Web3Helper.ChainIdAll): void

    requireChains?: boolean
}

export const NetworkTab = memo(function NetworkTab({
    chains,
    pluginID,
    onChange,
    requireChains,
    ...rest
}: NetworkTabProps) {
    const { pluginID: networkPluginID } = useNetworkContext(pluginID)
    const { chainId, setChainId, setNetworkType } = useChainContext()
    const networks = useNetworkDescriptors(networkPluginID)
    const wallet = useWallet()
    const Utils = useWeb3Utils()
    const smartPaySupportChainId = useSmartPayChainId()

    const supportedChains = useMemo(() => {
        if (!wallet?.owner || requireChains) return chains
        return chains.filter((x) => x === smartPaySupportChainId)
    }, [smartPaySupportChainId, wallet, chains, requireChains])

    const usedNetworks = networks.filter((x) => supportedChains.find((c) => c === x.chainId))
    const networkIds = usedNetworks.map((x) => x.chainId.toString())

    const isValidChainId = useMemo(() => chains.includes(chainId), [chains, chainId])
    const [tab, , , setTab] = useTabs(
        !isValidChainId ? networkIds[0] : (chainId?.toString() ?? networkIds[0]),
        ...networkIds,
    )

    useUpdateEffect(() => {
        setTab((prev) => {
            if (isValidChainId && chainId && prev !== chainId?.toString()) return chainId.toString()
            return prev
        })

        if (!isValidChainId) setChainId(ChainId.Mainnet)
    }, [chainId, isValidChainId])

    return (
        <TabContext value={tab}>
            <MaskTabList
                {...rest}
                variant="flexible"
                onChange={(_, v) => {
                    const chainId = Number.parseInt(v, 10)
                    const networkType = Utils.chainResolver.networkType(chainId)
                    setChainId?.(chainId)
                    if (networkType) setNetworkType?.(networkType)
                    onChange?.(chainId)
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
                                        fontWeight={tab === x.chainId.toString() ? 700 : 400}>
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
})
