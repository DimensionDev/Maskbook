/**
 * Copy from @masknet/kit, but with SI units in 1024 base
 */
export function formatFileSize(input = 0, fractionDigits = 1) {
    if (input === 0 || Number.isNaN(input)) {
        return '0 B'
    }
    const units = ['', 'K', 'M', 'G', 'T', 'P']
    const base = 1024
    const n = Math.min(Math.floor(Math.log(input) / Math.log(base)), units.length - 1)
    const value = input / Math.pow(base, n)
    const formatted = n === 0 ? value : value.toFixed(fractionDigits)
    return `${formatted} ${units[n]}B`
}
