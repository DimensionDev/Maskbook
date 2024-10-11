export function formatCompact(value: number, options?: Intl.NumberFormatOptions) {
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'decimal',
        notation: 'compact',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        ...options,
    })
    return formatter.format(value)
}
