import formatDuration from 'date-fns/formatDuration'
import intervalToDuration from 'date-fns/intervalToDuration'

export function formatCountdown(from: number, to: number) {
    const duration = intervalToDuration({ start: from, end: to })
    return formatDuration(duration)
}
