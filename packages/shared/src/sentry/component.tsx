import { cloneElement, isValidElement, useCallback } from 'react'
import { useLoggerContext } from './context.js'

interface Logger extends React.PropsWithChildren {
    value: string | object
}

export const Logger = ({ children, value }: Logger) => {
    const { logger } = useLoggerContext()
    const handleClick = useCallback(
        (e: React.MouseEvent) => {
            if (!isValidElement(children)) return
            logger?.captureMessage(value)
            children.props.onClick?.(e)
        },
        [value],
    )

    return (
        <>{isValidElement(children) ? cloneElement(children, { ...children.props, onClick: handleClick }) : children}</>
    )
}
