export function formatDateTime(value: Date, hiddenSeconds = false) {
    const pad = (value: number) => value.toString(10).padStart(2, '0')
    const date = [value.getFullYear(), value.getMonth() + 1, value.getDate()]
    const time = [value.getHours(), value.getMinutes(), value.getSeconds()]
    if (hiddenSeconds) {
        time.pop()
    }
    return `${date.map(pad).join('-')} ${time.map(pad).join(':')}`
}
