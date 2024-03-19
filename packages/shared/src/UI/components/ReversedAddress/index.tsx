import { type ComponentProps, memo } from 'react'
import { type NetworkPluginID } from '@masknet/shared-base'
import { useReverseAddress, useWeb3Utils } from '@masknet/web3-hooks-base'
import { Typography } from '@mui/material'
import { ShadowRootTooltip, useBoundedPopperProps } from '@masknet/theme'
import { isSameAddress } from '@masknet/web3-shared-base'

export interface ReverseAddressProps extends ComponentProps<typeof Typography> {
    address: string
    pluginID?: NetworkPluginID
    size?: number
}

export const ReversedAddress = memo<ReverseAddressProps>(({ address, pluginID, size = 4, ...rest }) => {
    const { data: domain } = useReverseAddress(pluginID, address)
    const Utils = useWeb3Utils(pluginID)

    const showDomain = !!domain && Utils.isValidDomain(domain)
    const uiLabel = showDomain ? Utils.formatDomainName(domain) : Utils.formatAddress(address, size) ?? address
    const hasEllipsis = showDomain ? uiLabel !== domain : !isSameAddress(uiLabel, address)
    const node = (
        <Typography fontWeight={700} {...rest}>
            {uiLabel}
        </Typography>
    )
    const popperProps = useBoundedPopperProps()

    return hasEllipsis ?
            <ShadowRootTooltip
                title={showDomain ? domain : address}
                PopperProps={{ ...popperProps, style: { whiteSpace: 'break-spaces' } }}>
                {node}
            </ShadowRootTooltip>
        :   node
})

ReversedAddress.displayName = 'ReversedAddress'
