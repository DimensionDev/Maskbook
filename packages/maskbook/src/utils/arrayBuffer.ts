export function isSameArrayBuffer(a: ArrayBuffer, b: ArrayBuffer): boolean {
    if (a.byteLength !== b.byteLength) {
        return false
    } else {
        const viewA = new DataView(a)
        const viewB = new DataView(b)
        const length = a.byteLength
        for (let i = 0; i < length; i += 1) {
            if (viewA.getInt8(i) !== viewB.getInt8(i)) {
                return false
            }
        }
        return true
    }
}
