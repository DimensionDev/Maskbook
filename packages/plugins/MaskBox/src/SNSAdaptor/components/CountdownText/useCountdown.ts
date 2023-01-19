import { useState, useEffect, useMemo } from 'react'

const MS_PER_MINUTE = 60 * 1000
const MS_PER_HOUR = MS_PER_MINUTE * 60
const MS_PER_DAY = MS_PER_HOUR * 24

type Remains = {
    days: number
    hours: number
    minutes: number
    seconds: number
}

function calcRemains(date: Date): Remains {
    const now = new Date()
    const ms = date.getTime()
    const remainMs = ms - now.getTime()
    const days = Math.floor(remainMs / MS_PER_DAY)
    const hours = Math.floor((remainMs - days * MS_PER_DAY) / MS_PER_HOUR)
    const minutes = Math.floor((remainMs - days * MS_PER_DAY - hours * MS_PER_HOUR) / MS_PER_MINUTE)
    const seconds = Math.round((remainMs - days * MS_PER_DAY - hours * MS_PER_HOUR - minutes * MS_PER_MINUTE) / 1000)

    return {
        days,
        hours,
        minutes,
        seconds,
    }
}

export function useCountdown(end: number, onEnded?: () => void): Remains & { finished: boolean } {
    const [days, setDays] = useState(0)
    const [hours, setHours] = useState(0)
    const [minutes, setMinutes] = useState(0)
    const [seconds, setSeconds] = useState(0)
    const [finished, setFinished] = useState(false)
    const endDate = useMemo(() => new Date(end), [end])
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>
        const tick = (): void => {
            if (Date.now() >= end) {
                setFinished(true)
                clearTimeout(timer)
                onEnded?.()
                return
            }
            const {
                days: remainDays,
                hours: remainHours,
                minutes: remainMinutes,
                seconds: remainSeconds,
            } = calcRemains(endDate)
            setDays(remainDays)
            setHours(remainHours)
            setMinutes(remainMinutes)
            setSeconds(remainSeconds)

            clearTimeout(timer)
            timer = setTimeout(tick, 1000)
        }
        tick()
        // synchronizing
        timer = setTimeout(tick, 1000 - (Date.now() % 1000))
        return () => {
            clearTimeout(timer)
        }
    }, [setDays, setHours, setMinutes, setSeconds, end, endDate, onEnded])

    return {
        finished,
        days,
        hours,
        minutes,
        seconds,
    }
}
