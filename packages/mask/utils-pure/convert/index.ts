export function Uint8ArrayToHexString(buffer: ArrayBuffer) {
    return Array.prototype.map.call(new Uint8Array(buffer), (x) => ('00' + x.toString(16)).slice(-2)).join('')
}

export function HexStringToUint8Array(hex: string) {
    let hex_ = hex
    hex_ = hex.replace(/^0x/, '') // strip 0x
    if (hex_.length % 2) hex_ = `0${hex_}` // pad even zero
    const buf: number[] = []
    for (let i = 0; i < hex_.length; i += 2) buf.push(Number.parseInt(hex_.substring(i, i + 2), 16))
    return new Uint8Array(buf)
}
