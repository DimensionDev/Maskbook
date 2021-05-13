import scrypt from 'scrypt-js'
import Web3Utils from 'web3-utils'
import { Buffer } from 'buffer'

export type KeyStore = KeyStore.Type

declare namespace KeyStore {
    type Type = AESCipher & KeyDerivation & { mac: string }

    interface AESCipher {
        cipher: 'aes-128-ctr' | 'aes-128-cbc'
        cipherparams: AESCipherParams
        ciphertext: string
    }

    interface AESCipherParams {
        iv: string
    }

    type KeyDerivation = PBKDF2 | Scrypt

    interface PBKDF2 {
        kdf: 'pbkdf2'
        kdfparams: PBKDF2Params
    }

    interface PBKDF2Params {
        c: number
        prf: 'hmac-sha256'
        dklen: number
        salt: string
    }

    interface Scrypt {
        kdf: 'scrypt'
        kdfparams: ScryptParams
    }

    interface ScryptParams {
        n: number
        p: number
        r: number
        dklen: number
        salt: string
    }
}

export interface V3Keystore {
    crypto: KeyStore
    id: string
    version: number
    address: string
}

export async function fromV3Keystore(input: string | V3Keystore, password: string) {
    const json: V3Keystore = typeof input === 'object' ? input : JSON.parse(input)

    if (json.version !== 3) {
        throw new Error('Not a V3 wallet')
    }

    // TODO: check json schema

    let derivedKey: Uint8Array
    let kdfparams: KeyStore.KeyDerivation['kdfparams']
    if (json.crypto.kdf === 'scrypt') {
        kdfparams = json.crypto.kdfparams as KeyStore.ScryptParams
        derivedKey = await scrypt.scrypt(
            Buffer.from(password),
            Buffer.from(kdfparams.salt, 'hex'),
            kdfparams.n,
            kdfparams.r,
            kdfparams.p,
            kdfparams.dklen,
        )
    } else if (json.crypto.kdf === 'pbkdf2') {
        kdfparams = json.crypto.kdfparams as KeyStore.PBKDF2Params
        if (kdfparams.prf !== 'hmac-sha256') {
            throw new Error('Unsupported parameters to PBKDF2')
        }

        const key = await crypto.subtle.importKey('raw', Buffer.from(password), { name: 'PBKDF2' }, false, [
            'deriveBits',
        ])

        derivedKey = Buffer.from(
            await crypto.subtle.deriveBits(
                {
                    name: 'PBKDF2',
                    salt: Buffer.from(kdfparams.salt, 'hex'),
                    iterations: kdfparams.c,
                    hash: 'SHA-256',
                },
                key,
                256,
            ),
        )
    } else {
        throw new Error('Unsupport key derivation scheme')
    }
    const ciphertext = Buffer.from(json.crypto.ciphertext, 'hex')
    const buf = Buffer.concat([Buffer.from(derivedKey.slice(16, 32)), ciphertext])
    const mac = Web3Utils.sha3(`0x${buf.toString('hex')}`)
    if (mac !== `0x${json.crypto.mac}`) {
        throw new Error('Key derivation failed - possibly wrong passphrase')
    }

    const seed = await decrypt(
        json.crypto.cipher,
        derivedKey,
        Buffer.from(json.crypto.ciphertext, 'hex'),
        Buffer.from(json.crypto.cipherparams.iv, 'hex'),
    )
    return { address: `0x${json.address}`, privateKey: `0x${seed}` } as {
        address: string
        privateKey: string
    }
}

async function decrypt(cipher: string, derivedKey: Uint8Array, ciphertext: Uint8Array, iv: Uint8Array) {
    const key = await crypto.subtle.importKey(
        'raw',
        derivedKey.slice(0, 16),
        {
            name: cipher === 'aes-128-ctr' ? 'AES-CTR' : 'AES-CBC',
            length: 128,
        },
        false,
        ['decrypt'],
    )

    const seed = await crypto.subtle.decrypt(
        cipher === 'aes-128-ctr'
            ? {
                  name: 'AES-CTR',
                  counter: iv,
                  length: 128,
              }
            : {
                  name: 'AES-CBC',
                  iv,
              },
        key,
        ciphertext,
    )
    return Buffer.from(seed).toString('hex')
}
