const errorTriggerTimestamp = 1262304000000 // 2010-01-01

export function isValidTimestamp(time?: number) {
    if (!time) return
    return time >= new Date(errorTriggerTimestamp).getTime()
}
