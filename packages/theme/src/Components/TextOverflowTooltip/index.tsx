import { Tooltip as MuiTooltip, TooltipProps } from '@mui/material'
import { cloneElement, FC, memo, ReactElement, useLayoutEffect, useRef, useState } from 'react'
import type { ShadowRootTooltip } from '../../entry.js'

interface TextOverflowTooltipProps extends TooltipProps {
    as?: typeof MuiTooltip | typeof ShadowRootTooltip
    children: ReactElement
}

export const TextOverflowTooltip: FC<TextOverflowTooltipProps> = memo(({ children, as, ...rest }) => {
    const ref = useRef<HTMLElement>(null)
    const [overflow, setOverflow] = useState(false)
    useLayoutEffect(() => {
        if (!ref.current) return
        setOverflow(ref.current.scrollWidth !== ref.current.offsetWidth)
    }, [ref.current])
    const Tooltip = as ?? MuiTooltip
    return (
        <Tooltip {...rest} title={overflow ? rest.title : ''}>
            {cloneElement(children, { ...children.props, ref })}
        </Tooltip>
    )
})
