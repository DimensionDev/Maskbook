import { Buffer } from 'buffer'
import scrypt from 'scrypt-js'
import type { CryptoKeyStore } from './types'
import { assertKeyDerivation, loadKeyStore } from './utils'

export async function fromKeyStore(input: string, password: Uint8Array) {
    const { crypto, address } = loadKeyStore(input)
    const derivedKey = await makeDerivedKey(crypto, password)
    assertKeyDerivation(crypto, derivedKey)
    const seed = await decrypt(
        crypto.cipher,
        derivedKey,
        Buffer.from(crypto.ciphertext, 'hex'),
        Buffer.from(crypto.cipherparams.iv, 'hex'),
    )
    return { address: `0x${address}`, privateKey: `0x${seed}` } as const
}

async function decrypt(cipher: string, derivedKey: Uint8Array, cipherText: Buffer, iv: Buffer) {
    const name = cipher === 'aes-128-ctr' ? 'AES-CTR' : 'AES-CBC'
    derivedKey = derivedKey.slice(0, 16)
    const length = 128
    const key = await crypto.subtle.importKey('raw', derivedKey, { name, length }, false, ['decrypt'])
    const aes_ctr_params: AesCtrParams = { name, counter: iv, length }
    const aes_cbc_params: AesCbcParams = { name, iv }
    const seed = await crypto.subtle.decrypt(
        cipher === 'aes-128-ctr' ? aes_ctr_params : aes_cbc_params,
        key,
        cipherText,
    )
    return Buffer.from(seed).toString('hex')
}

async function makeDerivedKey(keystore: CryptoKeyStore, password: Uint8Array) {
    const salt = Buffer.from(keystore.kdfparams.salt, 'hex')
    if (keystore.kdf === 'scrypt') {
        const { n, r, p, dklen } = keystore.kdfparams
        return scrypt.scrypt(password, salt, n, r, p, dklen)
    } else if (keystore.kdf === 'pbkdf2') {
        const iterations = keystore.kdfparams.c
        const key = await crypto.subtle.importKey('raw', password, { name: 'PBKDF2' }, false, ['deriveBits'])
        const params: Pbkdf2Params = { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' }
        return new Uint8Array(await crypto.subtle.deriveBits(params, key, 256))
    }
    throw new Error('Unsupported key derivation scheme')
}
