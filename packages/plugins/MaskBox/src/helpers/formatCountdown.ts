import { formatDuration, intervalToDuration } from 'date-fns'

export function formatCountdown(from: number, to: number) {
    const duration = intervalToDuration({ start: from, end: to })
    return formatDuration(duration)
}
