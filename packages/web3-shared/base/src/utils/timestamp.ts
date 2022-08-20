export function isValidTimesTamp(time?: number) {
    if (!time) return
    return new Date(time).toString() !== new Date(1).toString()
}
