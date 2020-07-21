export function formatDateTime(value: Date) {
    const pad = (value: number) => value.toString(10).padStart(2, '0')
    const date = [value.getFullYear(), value.getMonth() + 1, value.getDate()].map(pad).join('-')
    const time = [value.getHours(), value.getMinutes(), value.getSeconds()].map(pad).join(':')
    return `${date} ${time}`
}
