export function calculateHash(input: string) {
    const hash = [...input].reduce((prev, current) => {
        // eslint-disable-next-line no-bitwise
        const next = current.charCodeAt(0) + (prev << 5) - prev
        // eslint-disable-next-line no-bitwise
        return next & next
    }, 0)
    return Math.abs(hash)
}

export function generateContactAvatarColor(input: string, theme: 'light' | 'dark') {
    const hash = calculateHash(input)
    const values = [Math.abs(hash), theme === 'dark' ? '78%' : '98%', theme === 'dark' ? '50%' : '70%', '0.5']
    return `hsl(${values.join(', ')})`
}
