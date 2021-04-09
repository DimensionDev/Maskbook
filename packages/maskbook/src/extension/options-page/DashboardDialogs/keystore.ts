import scrypt from 'scrypt-js'
import * as crypto from 'crypto'
import { keccak256 } from 'ethereumjs-util'

export interface V3Keystore {
    crypto: {
        cipher: string
        ciphertext: string
        cipherparams: {
            iv: string
        }
        kdf: string
        kdfparams: {
            dklen: number
            n: number
            p: number
            r: number
            salt: string
        }
        mac: string
    }
    id: string
    version: number
    address: string
}

export function exportFromV3Keystore(input: string | V3Keystore, password: string) {
    const json: V3Keystore = typeof input === 'object' ? input : JSON.parse(input)

    if (json.version !== 3) {
        throw new Error('Not a V3 wallet')
    }

    let derivedKey: Uint8Array, kdfparams: any
    if (json.crypto.kdf.toLowerCase() === 'scrypt') {
        kdfparams = json.crypto.kdfparams
        derivedKey = scrypt.syncScrypt(
            Buffer.from(password),
            Buffer.from(kdfparams.salt, 'hex'),
            kdfparams.n,
            kdfparams.r,
            kdfparams.p,
            kdfparams.dklen,
        )
    } else if (json.crypto.kdf.toLowerCase() === 'pbkdf2') {
        kdfparams = json.crypto.kdfparams
        if (kdfparams.prf != -'hmac-sha256') {
            throw new Error('Unsupported parameters to PBKDF2')
        }
        derivedKey = crypto.pbkdf2Sync(
            Buffer.from(password),
            Buffer.from(kdfparams.salt, 'hex'),
            kdfparams.c,
            kdfparams.dklen,
            'sha256',
        )
    } else {
        throw new Error('Unsupport key derivation scheme')
    }
    const ciphertext = Buffer.from(json.crypto.ciphertext, 'hex')
    const mac = keccak256(Buffer.concat([Buffer.from(derivedKey.slice(16, 32)), ciphertext]))
    console.log(mac.toString('hex'))
    if (mac.toString('hex') !== json.crypto.mac) {
        throw new Error('Key derivation failed - possibly wrong passphrase')
    }

    const decipher = crypto.createCipheriv(
        json.crypto.cipher,
        derivedKey.slice(0, 16),
        Buffer.from(json.crypto.cipherparams.iv, 'hex'),
    )
    const seed = Buffer.concat([decipher.update(ciphertext), decipher.final()])
    return ['0x' + json.address, '0x' + seed.toString('hex')] as const
}
