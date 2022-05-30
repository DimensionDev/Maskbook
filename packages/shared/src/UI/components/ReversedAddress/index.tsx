import { memo } from 'react'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { useReverseAddress, useWeb3State } from '@masknet/plugin-infra/web3'

export interface ReverseAddressProps {
    address: string
    pluginId?: NetworkPluginID
    domainSize?: number
    size?: number
}

export const ReversedAddress = memo<ReverseAddressProps>(({ address, pluginId, domainSize, size = 5 }) => {
    const { value: domain } = useReverseAddress(pluginId, address)
    const { Others } = useWeb3State(pluginId)

    if (!domain || !Others?.formatDomainName) return <>{Others?.formatAddress?.(address, size) ?? address}</>

    return <>{Others.formatDomainName(domain, domainSize)}</>
})
