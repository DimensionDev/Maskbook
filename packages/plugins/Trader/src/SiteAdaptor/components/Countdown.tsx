import { Typography, type TypographyProps } from '@mui/material'
import { format } from 'date-fns'
import { useEffect, useState } from 'react'

interface Props extends TypographyProps {
    endtime: number
}
export function Countdown({ endtime, ...rest }: Props) {
    const [remain, setRemain] = useState(() => endtime - Date.now())
    useEffect(() => {
        const interval = 500
        const timer = setInterval(() => {
            setRemain((val) => {
                if (val >= 500) return val - 500
                clearInterval(timer)
                return 0
            })
        }, interval)
        return () => clearInterval(timer)
    }, [])
    return <Typography {...rest}>{remain <= 0 ? '--' : format(remain, 'mm:ss')}</Typography>
}
