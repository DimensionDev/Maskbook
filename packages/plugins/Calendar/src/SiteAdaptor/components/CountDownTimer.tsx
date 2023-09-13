import React, { useCallback, useEffect, useState } from 'react'
import { makeStyles } from '@masknet/theme'
import differenceInSeconds from 'date-fns/differenceInSeconds'

const useStyles = makeStyles()((theme) => ({
    timer: {
        fontSize: '12px',
        fontWeight: 400,
        lineHeight: '16px',
        background: theme.palette.maskColor.bg,
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2px',
    },
}))

interface CountDownTimerProps {
    targetDate: Date
}

function CountdownTimer({ targetDate }: CountDownTimerProps) {
    const calculateRemainingTime = useCallback(
        (targetDate: Date) => {
            const currentDate = new Date()
            const difference = differenceInSeconds(targetDate, currentDate)
            return difference > 0 ? difference : 0
        },
        [targetDate],
    )

    const [remainingTime, setRemainingTime] = useState(calculateRemainingTime(targetDate))

    const { classes } = useStyles()

    useEffect(() => {
        const interval = setInterval(() => {
            const newRemainingTime = calculateRemainingTime(targetDate)
            setRemainingTime(newRemainingTime)

            if (newRemainingTime === 0) {
                clearInterval(interval)
            }
        }, 1000)

        return () => clearInterval(interval)
    }, [targetDate])

    const days = Math.floor(remainingTime / (60 * 60 * 24))
    const hours = Math.floor((remainingTime % (60 * 60 * 24)) / (60 * 60))
    const minutes = Math.floor((remainingTime % (60 * 60)) / 60)
    const seconds = remainingTime % 60

    return <div className={classes.timer}>{`${days}d :${hours}h :${minutes}m :${seconds}s`}</div>
}

export default CountdownTimer
