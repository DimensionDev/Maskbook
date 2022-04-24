import { memo } from 'react'
import { NetworkPluginID, useReverseAddress, useWeb3State } from '@masknet/plugin-infra/web3'

export interface ReverseAddressProps {
    address: string
    pluginId?: NetworkPluginID
    domainSize?: number
    size?: number
}

export const ReversedAddress = memo<ReverseAddressProps>(({ address, pluginId, domainSize, size = 5 }) => {
    const { value: domain } = useReverseAddress(pluginId, address)
    const { Utils } = useWeb3State(pluginId)

    if (!domain || !Utils?.formatDomainName) return <>{Utils?.formatAddress?.(address, size) ?? address}</>

    return <>{Utils.formatDomainName(domain, domainSize)}</>
})
