import type { Web3Helper } from '@masknet/web3-helpers'
import { useWeb3Others } from '@masknet/web3-hooks-base'
import type { NetworkPluginID } from '@masknet/shared-base'
import { ImageIcon, type ImageIconProps } from '../ImageIcon/index.js'

export interface NetworkIconProps {
    pluginID: NetworkPluginID
    chainId: Web3Helper.ChainIdAll
    ImageIconProps?: Partial<ImageIconProps>
}

export function NetworkIcon(props: NetworkIconProps) {
    const { pluginID, chainId, ImageIconProps } = props
    const Others = useWeb3Others(pluginID)
    const networkType = Others.chainResolver.networkType(chainId)
    const networkIcon = networkType ? Others.networkResolver.networkIcon(networkType) : undefined

    if (networkIcon) return <ImageIcon icon={networkIcon} size={20} {...ImageIconProps} />
    return null
}
