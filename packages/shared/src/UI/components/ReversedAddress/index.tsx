import { memo } from 'react'
import type { NetworkPluginID } from '@masknet/shared-base'
import { useReverseAddress, useWeb3State } from '@masknet/web3-hooks-base'
import { Typography, TypographyProps } from '@mui/material'
import { ShadowRootTooltip } from '@masknet/theme'
import { isSameAddress } from '@masknet/web3-shared-base'

export interface ReverseAddressProps {
    address: string
    pluginID?: NetworkPluginID
    size?: number
    TypographyProps?: TypographyProps
    isInline?: boolean
}

export const ReversedAddress = memo<ReverseAddressProps>(({ address, pluginID, size = 4, TypographyProps = {} }) => {
    const { value: domain } = useReverseAddress(pluginID, address)
    const { Others } = useWeb3State(pluginID)

    const showDomain = !!domain && !!Others?.formatDomainName
    const uiLabel = showDomain ? Others.formatDomainName(domain) : Others?.formatAddress?.(address, size) ?? address
    const hasEllipsis = showDomain ? uiLabel !== domain : !isSameAddress(uiLabel, address)

    const node = (
        <Typography fontSize="14px" fontWeight={700} {...TypographyProps}>
            {uiLabel}
        </Typography>
    )

    return hasEllipsis ? <ShadowRootTooltip title={domain || address}>{node}</ShadowRootTooltip> : node
})
