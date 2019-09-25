export const ICAO9303Checksum = {
    encode: (input: string) => {
        return `${input}${(
            input
                .toUpperCase()
                .replace(/[+=\/]/g, '0')
                .split('')
                .map((d, i) => parseInt(d, 36) * [7, 3, 1][i % 3])
                .reduce(function(l, r) {
                    return l + r
                }) % 19
        )
            .toString(19)
            .toUpperCase()}`
    },
    decode: (input: string) => {
        const content = input.slice(0, input.length - 1)
        const checksum = input.slice(input.length - 1)
        const r = ICAO9303Checksum.encode(content)
        if (checksum === r.slice(r.length - 1)) {
            return content
        } else {
            return null
        }
    },
}
