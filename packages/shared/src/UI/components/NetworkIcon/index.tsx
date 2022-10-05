import { useWeb3State } from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import type {} from '@masknet/web3-shared-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { ImageIcon, ImageIconProps } from '../ImageIcon/index.js'

export interface NetworkIconProps {
    pluginID: NetworkPluginID
    chainId: Web3Helper.ChainIdAll
    ImageIconProps?: Partial<ImageIconProps>
}

export function NetworkIcon(props: NetworkIconProps) {
    const { pluginID, chainId, ImageIconProps } = props
    const { Others } = useWeb3State(pluginID)
    const networkType = Others?.chainResolver.networkType(chainId)
    const networkIcon = networkType ? Others?.networkResolver.networkIcon(networkType) : undefined

    if (networkIcon) return <ImageIcon icon={networkIcon} size={20} {...ImageIconProps} />
    return null
}
