import type { Web3Helper } from '@masknet/web3-helpers'
import { useWeb3Others } from '@masknet/web3-hooks-base'
import type { NetworkPluginID } from '@masknet/shared-base'
import { ImageIcon, type ImageIconProps } from '../ImageIcon/index.js'
import { ChainIcon } from '../index.js'

export interface NetworkIconProps extends ImageIconProps {
    pluginID: NetworkPluginID
    chainId: Web3Helper.ChainIdAll
    name?: string
    /** Don't show image but name instead */
    preferName?: boolean
}

export function NetworkIcon(props: NetworkIconProps) {
    const { pluginID, chainId, name, icon, preferName, ...rest } = props
    const Others = useWeb3Others(pluginID)
    const networkType = Others.chainResolver.networkType(chainId)
    const networkIcon = networkType ? Others.networkResolver.networkIcon(networkType) : undefined
    const iconUrl = networkIcon || icon

    if (iconUrl && !preferName) return <ImageIcon size={20} {...rest} icon={iconUrl} />
    return <ChainIcon size={rest?.size || 20} name={name} color={rest.color} />
}
