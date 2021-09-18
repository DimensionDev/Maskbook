import { useEffect, useState, forwardRef, useMemo, ReactNode } from 'react'
import { Button, ButtonProps } from '@mui/material'

export interface CountdownButtonProps extends ButtonProps {
    duration?: number
    repeatContent?: ReactNode | string
}

export const CountdownButton = forwardRef<HTMLButtonElement, CountdownButtonProps>((props, ref) => {
    const { duration = 60, children, repeatContent = 'Resend', onClick, disabled, ...others } = props
    const [countdown, setCountdown] = useState<number | undefined>(undefined)
    const handleClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        setCountdown(duration)
        onClick?.(event)
    }

    const content = useMemo(() => {
        if (countdown) {
            return `${children} (${countdown})`
        } else if (countdown === 0) {
            return repeatContent
        } else {
            return children
        }
    }, [countdown])

    useEffect(() => {
        if (countdown) {
            const timer = setTimeout(() => {
                setCountdown(countdown - 1)
            }, 1000)

            return () => {
                clearTimeout(timer)
            }
        }

        return () => {}
    }, [countdown])

    return (
        <Button ref={ref} {...others} onClick={handleClick} disabled={!!countdown || disabled}>
            {content}
        </Button>
    )
})
