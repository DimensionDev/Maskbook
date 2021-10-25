import { makeStyles } from '@masknet/theme'
import { useStylesExtends } from '@masknet/shared'
import AbstractTab, { AbstractTabProps } from './AbstractTab'
import { ChainId, getNetworkName } from '@masknet/web3-shared-evm'
import { useActivatedPluginSNSAdaptorWithOperatingChainSupportedNets } from '@masknet/plugin-infra'
import { useMemo } from 'react'

const useStyles = makeStyles()(() => ({}))
interface NetworkTabProps extends withClasses<'tab' | 'tabs' | 'tabPanel' | 'indicator' | 'focusTab' | 'tabPaper'> {
    setChainId: (chainId: ChainId) => void
    chainId: ChainId
    pluginId?: string
}

const defaultTabs = [ChainId.Mainnet, ChainId.BSC, ChainId.Matic, ChainId.Arbitrum, ChainId.xDai]

export function NetworkTab(props: NetworkTabProps) {
    const classes = useStylesExtends(useStyles(), props)
    const { chainId, setChainId, pluginId } = props

    const allInitChains = useActivatedPluginSNSAdaptorWithOperatingChainSupportedNets()
    const tabs = useMemo(() => {
        if (!pluginId) return defaultTabs
        const supportedTabs = allInitChains[pluginId]
        if (!supportedTabs || supportedTabs.length === 0) return defaultTabs

        return supportedTabs
    }, [chainId, allInitChains])

    const createTabItem = (name: string, chainId: ChainId) => ({
        label: <span>{name}</span>,
        sx: { p: 0 },
        cb: () => setChainId(chainId),
    })

    const tabProps: AbstractTabProps = {
        tabs: tabs.map((x) => createTabItem(getNetworkName(x) ?? '', x)),
        index: tabs.indexOf(chainId),
        classes,
        hasOnlyOneChild: true,
    }

    return <AbstractTab {...tabProps} />
}
