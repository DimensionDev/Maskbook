import { test, expect, beforeAll } from 'vitest'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore not want to install @types/node for this
import { webcrypto } from 'node:crypto'
import { encryptBackup, decryptBackup } from '../src/index.js'

beforeAll(() => {
    Reflect.set(globalThis, 'crypto', webcrypto)
})

const rawData = new Uint8Array([4, 5, 6])
const version0Data = new Uint8Array([
    77, 65, 83, 75, 45, 66, 65, 67, 75, 85, 80, 45, 86, 48, 48, 48, 147, 196, 16, 246, 104, 235, 238, 199, 70, 129, 183,
    82, 183, 204, 172, 98, 189, 231, 224, 196, 16, 237, 35, 98, 148, 79, 117, 119, 53, 249, 154, 178, 4, 144, 24, 141,
    165, 196, 19, 2, 53, 83, 21, 28, 73, 245, 184, 178, 219, 72, 182, 96, 141, 138, 201, 114, 163, 61, 82, 63, 146, 102,
    206, 147, 218, 15, 110, 204, 205, 252, 41, 114, 194, 18, 156, 183, 171, 55, 23, 109, 55, 107, 181, 122, 241, 200,
    182, 24, 138, 144,
])
const version1Data = new Uint8Array([
    77, 65, 83, 75, 45, 66, 65, 67, 75, 85, 80, 45, 86, 48, 48, 49, 147, 196, 16, 229, 12, 245, 19, 170, 170, 190, 105,
    231, 151, 114, 123, 204, 217, 53, 30, 196, 16, 163, 192, 34, 12, 133, 197, 158, 139, 133, 94, 200, 228, 220, 184,
    175, 127, 196, 19, 171, 193, 70, 124, 61, 97, 185, 19, 251, 245, 236, 226, 158, 85, 156, 182, 53, 40, 245, 178, 42,
    28, 167, 190, 144, 180, 9, 21, 198, 211, 163, 51, 222, 230, 204, 135, 124, 94, 122, 183, 143, 20, 200, 217, 199, 61,
    207, 2, 120, 168, 144,
])

test('Old data can be still decrypted', async () => {
    const password = Uint8Array.from('password'.split('').map((x) => x.codePointAt(0)))
    const decrypted = await decryptBackup(password, version0Data)
    expect(new Uint8Array(decrypted)).toEqual(rawData)
})

test('V1 data can be decrypted', async () => {
    const password = Uint8Array.from('password'.split('').map((x) => x.codePointAt(0)))
    const decrypted = await decryptBackup(password, version1Data)
    expect(new Uint8Array(decrypted)).toEqual(rawData)
})

test('decrypt(password, encrypt(password, data)) === data', async () => {
    const password = Uint8Array.from('password'.split('').map((x) => x.codePointAt(0)))
    const data = new Uint8Array([4, 5, 6])

    const result = await encryptBackup(password, data)
    const decrypted = await decryptBackup(password, result)
    expect(new Uint8Array(decrypted)).toEqual(data)
})

test('New data uses the V1 container', async () => {
    const password = Uint8Array.from('password'.split('').map((x) => x.codePointAt(0)))
    const encrypted = await encryptBackup(password, rawData)

    expect(new TextDecoder().decode(encrypted.slice(0, 16))).toBe('MASK-BACKUP-V001')
})

test('New data cannot be decrypted with a wrong password', async () => {
    const wrongPassword = Uint8Array.from('incorrect'.split('').map((x) => x.codePointAt(0)))

    await expect(decryptBackup(wrongPassword, version1Data)).rejects.toThrow()
})

test('V1 does not accept a legacy encrypted payload', async () => {
    const password = Uint8Array.from('password'.split('').map((x) => x.codePointAt(0)))
    const relabeledVersion0Data = version0Data.slice()
    relabeledVersion0Data.set(new TextEncoder().encode('MASK-BACKUP-V001'))

    await expect(decryptBackup(password, relabeledVersion0Data)).rejects.toThrow()
})

test('Unknown container versions are rejected', async () => {
    const password = Uint8Array.from('password'.split('').map((x) => x.codePointAt(0)))
    const unknownVersion = version0Data.slice()
    unknownVersion.set(new TextEncoder().encode('MASK-BACKUP-V999'))

    await expect(decryptBackup(password, unknownVersion)).rejects.toThrow('Unknown format')
})
