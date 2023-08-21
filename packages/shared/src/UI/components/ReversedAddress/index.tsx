import { type ComponentProps, memo } from 'react'
import { type NetworkPluginID } from '@masknet/shared-base'
import { useReverseAddress, useWeb3Others } from '@masknet/web3-hooks-base'
import { Typography } from '@mui/material'
import { ShadowRootTooltip, useBoundedPopperProps } from '@masknet/theme'
import { isSameAddress } from '@masknet/web3-shared-base'

export interface ReverseAddressProps extends ComponentProps<typeof Typography> {
    address: string
    pluginID?: NetworkPluginID
    size?: number
    // declare explicitly to avoid ts warning
    component?: string
}

export const ReversedAddress = memo<ReverseAddressProps>(({ address, pluginID, size = 4, ...rest }) => {
    const { data: domain } = useReverseAddress(pluginID, address)
    const Others = useWeb3Others(pluginID)

    const showDomain = !!domain && Others.isValidDomain(domain)
    const uiLabel = showDomain ? Others.formatDomainName(domain) : Others.formatAddress(address, size) ?? address
    const hasEllipsis = showDomain ? uiLabel !== domain : !isSameAddress(uiLabel, address)
    const node = (
        <Typography fontWeight={700} {...rest}>
            {uiLabel}
        </Typography>
    )
    const popperProps = useBoundedPopperProps()

    return hasEllipsis ? (
        <ShadowRootTooltip
            title={showDomain ? domain : address}
            PopperProps={{ ...popperProps, style: { whiteSpace: 'break-spaces', zIndex: 10 } }}>
            {node}
        </ShadowRootTooltip>
    ) : (
        node
    )
})

ReversedAddress.displayName = 'ReversedAddress'
