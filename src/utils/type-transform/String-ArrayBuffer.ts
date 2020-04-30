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
    let encodedString = ''
    for (const byte of new Uint8Array(buffer)) {
        encodedString += String.fromCharCode(byte)
    }
    return btoa(encodedString)
}
