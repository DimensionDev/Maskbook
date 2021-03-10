import { toArrayBuffer } from './File.prototype.arrayBuffer'

if (typeof Blob !== 'undefined' && !Blob.prototype.arrayBuffer) {
    Object.defineProperty(Blob.prototype, 'arrayBuffer', {
        configurable: true,
        writable: true,
        value: toArrayBuffer,
    })
}
