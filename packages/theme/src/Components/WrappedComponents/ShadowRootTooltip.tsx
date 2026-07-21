import { mergeSlotProps, Tooltip, type TooltipProps } from '@mui/material'
import { usePortalShadowRoot } from '../../ShadowRoot/index.js'

export function ShadowRootTooltip(props: TooltipProps) {
    return usePortalShadowRoot((container) => (
        <Tooltip
            {...props}
            slotProps={{
                ...props.slotProps,
                popper: mergeSlotProps(props.slotProps?.popper, { container }),
            }}
        />
    ))
}
ShadowRootTooltip.displayName = 'ShadowRootTooltip'
