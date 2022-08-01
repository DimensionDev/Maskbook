import { memo } from 'react'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { useReverseAddress, useWeb3State } from '@masknet/plugin-infra/web3'
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
    ({
        address,
        pluginId,
        domainSize,
        size = 5,
        TypographyProps = { fontSize: '14px', fontWeight: 700 },
        isInline = false,
    }) => {
        const { value: domain } = useReverseAddress(pluginId, address)
        const { Others } = useWeb3State(pluginId)
        const { fontSize, fontWeight } = TypographyProps

        if (!domain || !Others?.formatDomainName)
            return isInline ? (
                <span style={{ fontSize: fontSize?.toString(), fontWeight: fontWeight?.toString() }}>
                    {Others?.formatAddress?.(address, size) ?? address}
                </span>
            ) : (
                <Typography {...TypographyProps}>{Others?.formatAddress?.(address, size) ?? address}</Typography>
            )

        return isInline ? (
            <span style={{ fontSize: fontSize?.toString(), fontWeight: fontWeight?.toString() }}>
                {Others.formatDomainName(domain, domainSize)}
            </span>
        ) : (
            <Typography {...TypographyProps}>{Others.formatDomainName(domain, domainSize)}</Typography>
        )
    },
)
