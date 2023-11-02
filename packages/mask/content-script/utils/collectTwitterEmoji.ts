export function collectTwitterEmoji(points: readonly number[]) {
    if (points.length === 0) return ''
    if (points[0] < 35 || points[0] > 57) return String.fromCodePoint(...points)
    if (points.includes(65039)) return String.fromCodePoint(...points)
    return String.fromCodePoint(points[0], 65039, ...points.slice(1))
}
