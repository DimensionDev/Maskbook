import { memo } from 'react'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { useReverseAddress, useWeb3State } from '@masknet/plugin-infra/web3'
import { ZERO_ADDRESS } from '@masknet/web3-shared-evm'

interface ReverseAddressProps {
    address?: string
    pluginId?: NetworkPluginID
    domainSize?: number
    size?: number
    fontSize?: string
    fontWeight?: number
}

export const ReversedAddress = memo<ReverseAddressProps>(
    ({ address = ZERO_ADDRESS, pluginId, domainSize, size = 5, fontSize = '14px', fontWeight = 400 }) => {
        const { value: domain } = useReverseAddress(pluginId, address)
        const { Others } = useWeb3State(pluginId)
        if (address === ZERO_ADDRESS) return null

        if (!domain || !Others?.formatDomainName)
            return <span style={{ fontSize, fontWeight }}>{Others?.formatAddress?.(address, size) ?? address}</span>

        return <span style={{ fontSize, fontWeight }}>{Others.formatDomainName(domain, domainSize)}</span>
    },
)
