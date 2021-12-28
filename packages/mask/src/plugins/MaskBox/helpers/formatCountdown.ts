const msPerSecond = 1000
const msPerMinute = msPerSecond * 60
const msPerHour = msPerMinute * 60
const msPerDay = msPerHour * 24

const units = [
    ['day', 'days'],
    ['hour', 'hours'],
    ['minute', 'minutes'],
    ['second', 'seconds'],
]

export function formatCountdown(countdown: number) {
    if (countdown <= 0) return ''

    const segs: string[] = []

    ;[msPerDay, msPerHour, msPerMinute, msPerSecond].reduce((accumulator, x, index, list) => {
        const isLast = index === list.length - 1
        const value = isLast ? Math.ceil(accumulator / x) : Math.floor(accumulator / x)
        if (segs.length !== 0 || value !== 0) {
            segs.push(`${value} ${units[index][value === 1 ? 0 : 1]}`)
        }
        return accumulator % x
    }, countdown)

    return segs.join(' ')
}
