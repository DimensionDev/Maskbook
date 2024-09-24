import type { Web3Helper } from '@masknet/web3-helpers'
import { useNetwork } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { ImageIcon, type ImageIconProps } from '../ImageIcon/index.js'
import { ChainIcon } from '../index.js'
import { memo } from 'react'
import type { ReasonableNetwork } from '@masknet/web3-shared-base'
import { CHAIN_DESCRIPTORS as EVM_CHAIN_DESCRIPTORS } from '@masknet/web3-shared-evm'
import { CHAIN_DESCRIPTORS as SOLANA_CHAIN_DESCRIPTORS } from '@masknet/web3-shared-solana'
import { CHAIN_DESCRIPTORS as FLOW_CHAIN_DESCRIPTORS } from '@masknet/web3-shared-flow'

export interface NetworkIconProps extends ImageIconProps {
    pluginID: NetworkPluginID
    chainId: Web3Helper.ChainIdAll
    /**
     * It's allow to add custom network with duplicate chainIds. Network could
     * be specified with this prop.
     */
    network?: ReasonableNetwork<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll, Web3Helper.NetworkTypeAll>
}

const descriptorsMap = {
    [NetworkPluginID.PLUGIN_EVM]: EVM_CHAIN_DESCRIPTORS,
    [NetworkPluginID.PLUGIN_SOLANA]: SOLANA_CHAIN_DESCRIPTORS,
    [NetworkPluginID.PLUGIN_FLOW]: FLOW_CHAIN_DESCRIPTORS,
} as const

export const NetworkIcon = memo(function NetworkIcon(props: NetworkIconProps) {
    const { pluginID, chainId, icon, network: expectedNetwork, ...rest } = props
    const fallbackNetwork = useNetwork(pluginID, chainId)
    const network = expectedNetwork || fallbackNetwork
    const iconUrl = network?.iconUrl || icon || descriptorsMap[pluginID].find((x) => x.chainId === chainId)?.iconUrl

    if (iconUrl && !network?.isCustomized) return <ImageIcon size={20} {...rest} icon={iconUrl} />
    return (
        <ChainIcon
            {...rest}
            size={rest.size || 20}
            name={network?.name}
            color={rest.color || network?.color}
            className={rest.className}
        />
    )
})
