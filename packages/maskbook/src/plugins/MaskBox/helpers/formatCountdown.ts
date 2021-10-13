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

    const amounts: number[] = []

    ;[msPerDay, msPerHour, msPerMinute, msPerSecond].reduce((accumulator, x) => {
        amounts.push(Math.floor(accumulator / x))
        return accumulator % x
    }, countdown)

    return amounts
        .map((x, i) => {
            if (x <= 0) return ''
            if (x === 1) return `${x} ${units[i][0]}`
            return `${x} ${units[i][1]}`
        })
        .filter(Boolean)
        .join(' ')
        .trim()
}
