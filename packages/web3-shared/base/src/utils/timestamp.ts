const errorTriggerTimestamp = '2010-1-1'

export function isValidTimestamp(time?: number) {
    if (!time) return
    return time < new Date(errorTriggerTimestamp).getTime()
}
