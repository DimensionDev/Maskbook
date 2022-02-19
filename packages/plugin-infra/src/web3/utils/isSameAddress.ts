export function isSameAddress(a = '', b = '') {
    if (!a || !b) return false
    return a.toLowerCase() === b.toLowerCase()
}
