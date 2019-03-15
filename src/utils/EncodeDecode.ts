export function encodeText(str: string) {
    return new TextEncoder().encode(str)
}
export function decodeText(str: ArrayBuffer) {
    return new TextDecoder().decode(str)
}
export function decodeArrayBuffer(str: string): ArrayBuffer {
    const decodedString = atob(str)
    const uintArr = []
    for (const i of decodedString) uintArr.push(i.charCodeAt(0))
    return new Uint8Array(uintArr).buffer
}
export function encodeArrayBuffer(buffer: ArrayBuffer) {
    const x = [...new Uint8Array(buffer)]
    const encodedString = String.fromCharCode.apply(null, x)
    return btoa(encodedString)
}
