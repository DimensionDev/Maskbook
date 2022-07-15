import { memo } from 'react'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { useReverseAddress, useWeb3State } from '@masknet/plugin-infra/web3'
import { Typography } from '@mui/material'

export interface ReverseAddressProps {
    address: string
    pluginId?: NetworkPluginID
    domainSize?: number
    size?: number
    fontSize?: string
    fontWeight?: number
}

export const ReversedAddress = memo<ReverseAddressProps>(
    ({ address, pluginId, domainSize, size = 5, fontSize = '14px', fontWeight = 700 }) => {
        const { value: domain } = useReverseAddress(pluginId, address)
        const { Others } = useWeb3State(pluginId)

        if (!domain || !Others?.formatDomainName)
            return (
                <Typography fontSize={fontSize} fontWeight={fontWeight}>
                    {Others?.formatAddress?.(address, size) ?? address}
                </Typography>
            )

        return (
            <Typography fontSize={fontSize} fontWeight={fontWeight}>
                {Others.formatDomainName(domain, domainSize)}
            </Typography>
        )
    },
)
