import { memo } from 'react'
import { NetworkPluginID, useReverseAddress, useWeb3State } from '@masknet/plugin-infra'

interface ReverseAddressProps {
    address: string
    pluginId?: NetworkPluginID
    domainSize?: number
    addressSize?: number
}

export const ReverseAddress = memo<ReverseAddressProps>(({ address, pluginId, domainSize, addressSize }) => {
    const { value: domain } = useReverseAddress(address, pluginId)
    const { Utils } = useWeb3State(pluginId)

    if (!domain || !Utils?.formatDomainName) return <>{Utils?.formatAddress?.(address, addressSize) ?? address}</>

    return <>{Utils.formatDomainName(domain, domainSize)}</>
})
