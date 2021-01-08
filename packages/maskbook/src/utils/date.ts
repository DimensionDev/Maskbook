export function formatDateTime(value: Date, hiddenSeconds = false) {
    const pad = (value: number) => value.toString(10).padStart(2, '0')
    const date = [value.getFullYear(), value.getMonth() + 1, value.getDate()]
    const time = [value.getHours(), value.getMinutes(), value.getSeconds()]
    if (hiddenSeconds) {
        time.pop()
    }
    return `${date.map(pad).join('-')} ${time.map(pad).join(':')}`
}

export function formatTimeDiffer(startDate: Date, endDate: Date) {
    let delta = Math.abs(endDate.getTime() - startDate.getTime()) / 1000
    let timeDiffer = ''
    const days = Math.floor(delta / 86400)
    delta -= days * 86400
    if (days) timeDiffer += ` ${days}d`
    const hours = Math.floor(delta / 3600) % 24
    delta -= hours * 3600
    if (hours || days) timeDiffer += ` ${hours}h`
    const minutes = Math.floor(delta / 60) % 60
    delta -= minutes * 60
    timeDiffer += ` ${minutes}m`
    return timeDiffer
}
