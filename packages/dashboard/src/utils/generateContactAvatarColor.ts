export function generateContactAvatarColor(string: string, theme: 'light' | 'dark') {
    const hash = [...string].reduce((prev, current) => {
        // eslint-disable-next-line no-bitwise
        const next = current.charCodeAt(0) + (prev << 5) - prev
        // eslint-disable-next-line no-bitwise
        return next & next
    }, 0)
    return `hsl(${hash % 360}, ${theme === 'dark' ? `78%` : '98%'}, ${theme === 'dark' ? `50%` : '70%'})`
}
