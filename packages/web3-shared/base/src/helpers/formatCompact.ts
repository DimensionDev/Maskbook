export function formatCompact(value: number) {
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'decimal',
        notation: 'compact',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })
    return formatter.format(value)
}
