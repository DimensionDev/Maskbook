import { Tooltip as MuiTooltip, type TooltipProps } from '@mui/material'
import { cloneElement, memo, type FC, type ReactElement } from 'react'
import type { ShadowRootTooltip } from '../../entry.js'
import { useDetectOverflow } from '../../hooks/index.js'

interface TextOverflowTooltipProps extends TooltipProps {
    as?: typeof MuiTooltip | typeof ShadowRootTooltip
    children: ReactElement
}

export const TextOverflowTooltip: FC<TextOverflowTooltipProps> = memo(({ children, as, ...rest }) => {
    const [overflow, ref] = useDetectOverflow()

    const Tooltip = as ?? MuiTooltip
    return (
        <Tooltip {...rest} title={overflow ? rest.title : ''}>
            {cloneElement(children, { ...children.props, ref })}
        </Tooltip>
    )
})

TextOverflowTooltip.displayName = 'TextOverflowTooltip'
