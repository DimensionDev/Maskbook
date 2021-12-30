import { FC, memo } from 'react'
import { useCountdown } from './useCountdown'

interface Props {
    finishTime: number
}
function formatCountdown(options: Record<string, number>) {
    const paris = Object.keys(options).map((key) => {
        const val = options[key]
        if (val < 1) {
            return ''
        }
        return `${val} ${key}${val > 1 ? 's' : ''}`
    })
    return paris.filter(Boolean).join(' ')
}

export const CountdownText: FC<Props> = memo(({ finishTime }) => {
    const { days, hours, minutes, seconds } = useCountdown(finishTime ?? 0)
    const buttonLabel = `Start Sale in ${formatCountdown({
        day: days,
        hour: hours,
        minute: minutes,
        sec: seconds,
    })}`
    return <>{buttonLabel}</>
})
