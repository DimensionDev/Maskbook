export function generateContactAvatarColor(input: string, theme: 'light' | 'dark') {
    // eslint-disable-next-line unicorn/no-array-reduce
    const hash = [...input].reduce((prev, current) => {
        // eslint-disable-next-line no-bitwise
        const next = current.charCodeAt(0) + (prev << 5) - prev
        // eslint-disable-next-line no-bitwise
        return next & next
    }, 0)
    const values = [hash % 360, theme === 'dark' ? '78%' : '98%', theme === 'dark' ? '50%' : '70%']
    return `hsl(${values.join(', ')})`
}
