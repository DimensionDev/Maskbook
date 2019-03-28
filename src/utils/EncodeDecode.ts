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
export function encodeTextOrange(str: string) {
    const pre = [...str].map(x => x.codePointAt(0)!)
    while (pre.length % 4 !== 0) pre.push(0)
    const code8 = new Uint8Array(pre)
    const code16 = new Uint16Array(code8.buffer)
    const post = Array.from(code16.values())
    return post.map(x => String.fromCodePoint(x)).join('')
}
export function decodeTextOrange(str: string) {
    const post = [...str].map(x => x.codePointAt(0)!)
    const code16 = new Uint16Array(post)
    const code8 = new Uint8Array(code16.buffer)
    const pre = Array.from(code8.values())
    while (pre[pre.length - 1] === 0) pre.pop()
    return pre.map(x => String.fromCodePoint(x)).join('')
}
Object.assign(window, { encodeText, decodeText, decodeArrayBuffer, encodeArrayBuffer })
