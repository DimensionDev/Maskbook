import { Tooltip as MuiTooltip, type TooltipProps } from '@mui/material'
import { cloneElement, memo, type ReactElement } from 'react'
import type { ShadowRootTooltip } from '../index.js'
import { useDetectOverflow } from '../../hooks/index.js'

interface TextOverflowTooltipProps<T> extends TooltipProps {
    as?: typeof MuiTooltip | typeof ShadowRootTooltip
    // cloneElement is used.
    // eslint-disable-next-line @typescript-eslint/no-restricted-types
    children: ReactElement<T & { ref: (ref: HTMLDivElement | null) => void }>
}

export const TextOverflowTooltip = memo(function <T>({ children, as, ...rest }: TextOverflowTooltipProps<T>) {
    const [overflow, ref] = useDetectOverflow()

    const Tooltip = as ?? MuiTooltip
    return (
        <Tooltip {...rest} title={overflow ? rest.title : ''}>
            {cloneElement(children, { ...children.props, ref })}
        </Tooltip>
    )
})

TextOverflowTooltip.displayName = 'TextOverflowTooltip'
