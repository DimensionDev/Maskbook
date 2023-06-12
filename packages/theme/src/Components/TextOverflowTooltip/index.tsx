import { Tooltip as MuiTooltip, type TooltipProps } from '@mui/material'
import { cloneElement, memo, type ReactElement } from 'react'
import type { ShadowRootTooltip } from '../../Components/index.js'
import { useDetectOverflow } from '../../hooks/index.js'

interface TextOverflowTooltipProps extends TooltipProps {
    as?: typeof MuiTooltip | typeof ShadowRootTooltip
    // cloneElement is used.
    // eslint-disable-next-line @typescript-eslint/ban-types
    children: ReactElement
}

export const TextOverflowTooltip = memo(({ children, as, ...rest }: TextOverflowTooltipProps) => {
    const [overflow, ref] = useDetectOverflow()

    const Tooltip = as ?? MuiTooltip
    return (
        <Tooltip {...rest} title={overflow ? rest.title : ''}>
            {cloneElement(children, { ...children.props, ref })}
        </Tooltip>
    )
})

TextOverflowTooltip.displayName = 'TextOverflowTooltip'
