import { Tooltip as MuiTooltip, type TooltipProps } from '@mui/material'
import { cloneElement, memo, type ReactElement, type ReactNode } from 'react'
import type { ShadowRootTooltip } from '../../entry.js'
import { useDetectOverflow } from '../../hooks/index.js'

interface TextOverflowTooltipProps extends TooltipProps {
    as?: typeof MuiTooltip | typeof ShadowRootTooltip
    // eslint-disable-next-line @typescript-eslint/ban-types cloneElement is used.
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
