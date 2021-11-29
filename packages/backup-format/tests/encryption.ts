import { test, expect, beforeAll } from '@jest/globals'
import { webcrypto } from 'crypto'
import { encryptBackup, decryptBackup } from '../src/index'

beforeAll(() => {
    Reflect.set(globalThis, 'crypto', webcrypto)
})

const rawData = new Uint8Array([4, 5, 6])
const testData = new Uint8Array([
    77, 65, 83, 75, 45, 66, 65, 67, 75, 85, 80, 45, 86, 48, 48, 48, 147, 196, 16, 246, 104, 235, 238, 199, 70, 129, 183,
    82, 183, 204, 172, 98, 189, 231, 224, 196, 16, 237, 35, 98, 148, 79, 117, 119, 53, 249, 154, 178, 4, 144, 24, 141,
    165, 196, 19, 2, 53, 83, 21, 28, 73, 245, 184, 178, 219, 72, 182, 96, 141, 138, 201, 114, 163, 61, 82, 63, 146, 102,
    206, 147, 218, 15, 110, 204, 205, 252, 41, 114, 194, 18, 156, 183, 171, 55, 23, 109, 55, 107, 181, 122, 241, 200,
    182, 24, 138, 144,
])

test('Old data can be still decrypted', async () => {
    const password = Uint8Array.from('password'.split('').map((x) => x.charCodeAt(0)))
    const decrypted = await decryptBackup(password, testData)
    expect(new Uint8Array(decrypted)).toEqual(rawData)
})

test('decrypt(password, encrypt(password, data)) === data', async () => {
    const password = Uint8Array.from('password'.split('').map((x) => x.charCodeAt(0)))
    const data = new Uint8Array([4, 5, 6])

    const result = await encryptBackup(password, data)
    const decrypted = await decryptBackup(password, result)
    expect(new Uint8Array(decrypted)).toEqual(new Uint8Array(decrypted))
})
