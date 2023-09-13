export function resolveDaysName(days: number) {
    if (days === 0) return 'MAX'
    if (days >= 365) return `${Math.floor(days / 365)}Y`
    if (days >= 30) return `${Math.floor(days / 30)}M`
    if (days >= 7) return `${Math.floor(days / 7)}W`
    if (days === 1) return '24H'
    return `${days}d`
}
