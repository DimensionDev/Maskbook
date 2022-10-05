import { memo } from 'react'

import { NetworkPluginID } from '@masknet/shared-base'
import { useReverseAddress, useWeb3State } from '@masknet/web3-hooks-base'
import { Typography, TypographyProps } from '@mui/material'

export interface ReverseAddressProps {
    address: string
    pluginId?: NetworkPluginID
    domainSize?: number
    size?: number
    TypographyProps?: TypographyProps
    isInline?: boolean
}

export const ReversedAddress = memo<ReverseAddressProps>(
    ({ address, pluginId, domainSize, size = 4, TypographyProps = { fontSize: '14px', fontWeight: 700 } }) => {
        const { value: domain } = useReverseAddress(pluginId, address)
        const { Others } = useWeb3State(pluginId)

        if (!domain || !Others?.formatDomainName)
            return <Typography {...TypographyProps}>{Others?.formatAddress?.(address, size) ?? address}</Typography>

        return <Typography {...TypographyProps}>{Others?.formatDomainName(domain, domainSize)}</Typography>
    },
)
