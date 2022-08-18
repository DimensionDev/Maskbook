export function parseJSONc(data: string) {
    if (data.includes('/*')) throw new TypeError('Only // comments are supported.')
    data = data
        .split('\n')
        .filter((line) => !line.trim().startsWith('//'))
        .join('\n')

    return JSON.parse(data)
}
