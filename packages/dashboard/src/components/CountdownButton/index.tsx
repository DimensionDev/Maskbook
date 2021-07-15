import { useEffect, useState } from 'react'
import { Button, ButtonProps } from '@material-ui/core'

export interface CountdownButtonProps extends ButtonProps {
    duration?: number
}

export default function CountdownButton(props: CountdownButtonProps) {
    const { duration = 60, children, onClick, ...others } = props
    const [countdown, setCountdown] = useState(0)
    const handleClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        setCountdown(duration)
        onClick && onClick(event)
    }

    useEffect(() => {
        if (countdown) {
            setTimeout(() => {
                setCountdown(countdown - 1)
            }, 1000)
        }
    }, [countdown])

    return (
        <Button {...others} onClick={handleClick} disabled={!!countdown}>
            {children}
            {countdown ? ` (${countdown})` : ''}
        </Button>
    )
}
