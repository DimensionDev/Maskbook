import { useEffect, useState, useMemo, type ReactNode } from 'react'
import { Button, type ButtonProps } from '@mui/material'
import { makeStyles } from '../../entry-base.js'

const useStyles = makeStyles()({
    button: {
        whiteSpace: 'nowrap',
        '&:hover': {
            background: 'transparent',
        },
    },
})
export interface CountdownButtonProps extends ButtonProps {
    duration?: number
    repeatContent?: ReactNode | string
}

export function CountdownButton(props: CountdownButtonProps) {
    const { classes, cx } = useStyles()
    const { duration = 60, children, repeatContent = 'Resend', onClick, disabled, ...others } = props
    const [countdown, setCountdown] = useState<number | undefined>(undefined)
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setCountdown(duration)
        onClick?.(event)
    }

    const content = useMemo(() => {
        if (countdown) {
            if (typeof children === 'string') return `${children} (${countdown})`
            else
                return (
                    <>
                        {children} ({countdown})
                    </>
                )
        } else if (countdown === 0) {
            return repeatContent
        } else {
            return children
        }
    }, [countdown])

    useEffect(() => {
        if (!countdown) return
        const timer = setInterval(() => {
            setCountdown((val) => {
                if (!val) {
                    clearInterval(timer)
                }
                return val ? val - 1 : val
            })
        }, 1000)
        return () => clearInterval(timer)
    }, [!countdown])

    return (
        <Button
            {...others}
            className={cx(classes.button, others.className)}
            onClick={handleClick}
            disabled={!!countdown || disabled}
            disableRipple
            disableElevation
            disableTouchRipple>
            {content}
        </Button>
    )
}

CountdownButton.displayName = 'CountdownButton'
