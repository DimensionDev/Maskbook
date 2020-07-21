export function formatFileSize(input = 0, si = isApplePlatform()) {
    if (input === 0 || Number.isNaN(input)) {
        return '0 B'
    }
    const units = ['', 'K', 'M', 'G', 'T', 'P']
    const base = si ? 1000 : 0x400
    const n = Math.floor(Math.log(input) / Math.log(base))
    const value = input / Math.pow(base, n)
    const formatted = n === 0 ? value : value.toFixed(1)
    return `${formatted} ${units[n]}${si ? '' : 'i'}B`
}

function isApplePlatform() {
    return /^Mac/.test(navigator.platform)
}
